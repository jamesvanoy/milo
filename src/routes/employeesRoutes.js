const express = require('express');
const { list, insert, update } = require('../data/store');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  return res.json(list('employees'));
});

router.post('/', requireAuth, requireRole(['admin', 'manager']), (req, res) => {
  const { firstName, lastName, role, hourlyRate, active = true } = req.body;

  if (!firstName || !lastName || !role) {
    return res.status(400).json({ error: 'firstName, lastName, and role are required' });
  }

  const employee = insert('employees', { firstName, lastName, role, hourlyRate: hourlyRate || 0, active });
  return res.status(201).json(employee);
});

router.patch('/:id', requireAuth, requireRole(['admin', 'manager']), (req, res) => {
  const employee = update('employees', req.params.id, req.body);

  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  return res.json(employee);
});

module.exports = router;
