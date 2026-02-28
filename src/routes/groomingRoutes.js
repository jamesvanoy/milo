const express = require('express');
const { list, insert, update, findById } = require('../data/store');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/appointments', requireAuth, (req, res) => {
  return res.json(list('groomingAppointments'));
});

router.post('/appointments', requireAuth, (req, res) => {
  const { petId, groomerId, startAt, endAt, packageName, notes, status = 'booked' } = req.body;

  if (!petId || !startAt || !endAt || !packageName) {
    return res.status(400).json({ error: 'petId, startAt, endAt, and packageName are required' });
  }

  const pet = findById('pets', petId);
  if (!pet) {
    return res.status(404).json({ error: 'Pet not found' });
  }

  const appointment = insert('groomingAppointments', {
    petId,
    groomerId: groomerId || null,
    startAt,
    endAt,
    packageName,
    notes: notes || '',
    status
  });

  return res.status(201).json(appointment);
});

router.patch('/appointments/:id', requireAuth, (req, res) => {
  const appointment = update('groomingAppointments', req.params.id, req.body);
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  return res.json(appointment);
});

module.exports = router;
