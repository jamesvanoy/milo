const express = require('express');
const bcrypt = require('bcryptjs');
const { data, list, insert, findById } = require('../data/store');
const { requireAuth, requireCustomer } = require('../middleware/auth');
const { signUserToken } = require('./authRoutes');
const { quoteReservation } = require('../services/calendarService');
const { calculateSubtotal, calculateTax } = require('../services/pricingService');

const router = express.Router();

function sanitizeCustomer(customer) {
  return {
    id: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone,
    notes: customer.notes,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt
  };
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    customerId: user.customerId || null
  };
}

router.get('/public/config', (req, res) => {
  return res.json({
    facility: {
      id: data.facility.id,
      name: data.facility.name,
      timezone: data.facility.timezone,
      dayCutoffHour: data.facility.dayCutoffHour,
      kennelCount: data.facility.kennelCount
    },
    pricing: data.facility.pricing
  });
});

router.post('/register', async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'firstName, lastName, email, and password are required' });
  }

  const normalizedEmail = String(email).toLowerCase();
  const existingUser = data.users.find((entry) => entry.email.toLowerCase() === normalizedEmail);
  if (existingUser) {
    return res.status(409).json({ error: 'An account already exists for this email' });
  }

  let customer = data.customers.find((entry) => (entry.email || '').toLowerCase() === normalizedEmail);
  if (!customer) {
    customer = insert('customers', {
      firstName,
      lastName,
      email: normalizedEmail,
      phone: phone || null,
      notes: 'Created from online portal registration'
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = insert('users', {
    name: `${firstName} ${lastName}`,
    email: normalizedEmail,
    passwordHash,
    role: 'customer',
    active: true,
    customerId: customer.id
  });

  const token = signUserToken(user);

  return res.status(201).json({
    token,
    user: sanitizeUser(user),
    customer: sanitizeCustomer(customer)
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = data.users.find((entry) => entry.email.toLowerCase() === String(email).toLowerCase());
  if (!user || !user.active || user.role !== 'customer') {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const customer = findById('customers', user.customerId);
  if (!customer) {
    return res.status(401).json({ error: 'Customer profile is missing' });
  }

  const token = signUserToken(user);

  return res.json({
    token,
    user: sanitizeUser(user),
    customer: sanitizeCustomer(customer)
  });
});

router.get('/me', requireAuth, requireCustomer, (req, res) => {
  const user = findById('users', req.user.id);
  const customer = findById('customers', req.user.customerId);

  if (!user || !customer) {
    return res.status(404).json({ error: 'Customer account not found' });
  }

  return res.json({
    user: sanitizeUser(user),
    customer: sanitizeCustomer(customer)
  });
});

router.get('/pets', requireAuth, requireCustomer, (req, res) => {
  const pets = list('pets').filter((pet) => pet.customerId === req.user.customerId);
  return res.json(pets);
});

router.post('/pets', requireAuth, requireCustomer, (req, res) => {
  const { name, species = 'dog', breed, birthDate, weightLbs, behaviorNotes, groomingNotes } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Pet name is required' });
  }

  const pet = insert('pets', {
    customerId: req.user.customerId,
    name,
    species,
    breed: breed || null,
    birthDate: birthDate || null,
    weightLbs: weightLbs || null,
    behaviorNotes: behaviorNotes || '',
    groomingNotes: groomingNotes || ''
  });

  return res.status(201).json(pet);
});

router.get('/reservations', requireAuth, requireCustomer, (req, res) => {
  const reservations = list('reservations').filter((reservation) => reservation.customerId === req.user.customerId);
  return res.json(reservations);
});

router.post('/quote', requireAuth, requireCustomer, (req, res) => {
  const { serviceType = 'boarding', billingMode = 'night', checkInAt, checkOutAt, kennelsRequired = 1 } = req.body;

  if (!checkInAt || !checkOutAt) {
    return res.status(400).json({ error: 'checkInAt and checkOutAt are required' });
  }

  try {
    const quote = quoteReservation({
      facility: data.facility,
      serviceType,
      billingMode,
      checkInAt,
      checkOutAt,
      kennelsRequired
    });

    const subtotal = calculateSubtotal({
      serviceType,
      units: quote.units,
      facilityPricing: data.facility.pricing
    });

    const tax = calculateTax({
      serviceType,
      subtotal,
      taxRates: data.facility.taxRates
    });

    return res.json({
      ...quote,
      subtotal,
      tax,
      total: Number((subtotal + tax).toFixed(2))
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.post('/reservations', requireAuth, requireCustomer, (req, res) => {
  const {
    petId,
    serviceType = 'boarding',
    billingMode = 'night',
    checkInAt,
    checkOutAt,
    kennelsRequired = 1,
    notes = '',
    status = 'pending-confirmation'
  } = req.body;

  if (!petId || !checkInAt || !checkOutAt) {
    return res.status(400).json({ error: 'petId, checkInAt, and checkOutAt are required' });
  }

  const pet = findById('pets', petId);
  if (!pet || pet.customerId !== req.user.customerId) {
    return res.status(404).json({ error: 'Pet not found for this account' });
  }

  const quote = quoteReservation({
    facility: data.facility,
    serviceType,
    billingMode,
    checkInAt,
    checkOutAt,
    kennelsRequired
  });

  const reservation = insert('reservations', {
    customerId: req.user.customerId,
    petId,
    serviceType,
    billingMode,
    checkInAt,
    checkOutAt,
    kennelsRequired,
    units: quote.units,
    notes,
    status,
    source: 'portal'
  });

  return res.status(201).json(reservation);
});

module.exports = router;
