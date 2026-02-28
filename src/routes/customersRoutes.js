const express = require('express');
const { list, insert, update, findById } = require('../data/store');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  return res.json(list('customers'));
});

router.post('/', requireAuth, (req, res) => {
  const { firstName, lastName, email, phone, notes } = req.body;

  if (!firstName || !lastName) {
    return res.status(400).json({ error: 'firstName and lastName are required' });
  }

  const customer = insert('customers', { firstName, lastName, email: email || null, phone: phone || null, notes: notes || '' });
  return res.status(201).json(customer);
});

router.patch('/:id', requireAuth, (req, res) => {
  const customer = update('customers', req.params.id, req.body);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  return res.json(customer);
});

router.get('/:id/pets', requireAuth, (req, res) => {
  const customer = findById('customers', req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const pets = list('pets').filter((pet) => pet.customerId === req.params.id);
  return res.json(pets);
});

router.post('/:id/pets', requireAuth, (req, res) => {
  const customer = findById('customers', req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const { name, species = 'dog', breed, birthDate, weightLbs, behaviorNotes, groomingNotes } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Pet name is required' });
  }

  const pet = insert('pets', {
    customerId: req.params.id,
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

module.exports = router;
