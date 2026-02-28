const express = require('express');
const { data, list, insert } = require('../data/store');
const { requireAuth } = require('../middleware/auth');
const { getAvailabilitySummary, quoteReservation } = require('../services/calendarService');
const { calculateSubtotal, calculateTax } = require('../services/pricingService');

const router = express.Router();

router.get('/availability', requireAuth, (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: 'from and to query params are required' });
  }

  try {
    const summary = getAvailabilitySummary({
      facility: data.facility,
      reservations: list('reservations'),
      from,
      to
    });

    return res.json(summary);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.post('/quote', requireAuth, (req, res) => {
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

router.post('/reservations', requireAuth, (req, res) => {
  const {
    customerId,
    petId,
    serviceType = 'boarding',
    billingMode = 'night',
    checkInAt,
    checkOutAt,
    kennelsRequired = 1,
    status = 'booked'
  } = req.body;

  if (!customerId || !petId || !checkInAt || !checkOutAt) {
    return res.status(400).json({ error: 'customerId, petId, checkInAt, and checkOutAt are required' });
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
    customerId,
    petId,
    serviceType,
    billingMode,
    checkInAt,
    checkOutAt,
    kennelsRequired,
    units: quote.units,
    status
  });

  return res.status(201).json(reservation);
});

router.get('/reservations', requireAuth, (req, res) => {
  return res.json(list('reservations'));
});

module.exports = router;
