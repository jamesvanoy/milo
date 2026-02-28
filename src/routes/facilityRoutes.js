const express = require('express');
const { data } = require('../data/store');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  return res.json(data.facility);
});

router.patch('/', requireAuth, requireRole(['admin', 'manager']), (req, res) => {
  const allowedFields = ['name', 'timezone', 'kennelCount', 'dayCutoffHour', 'nightCutoffHour', 'taxRates', 'pricing'];

  for (const key of Object.keys(req.body)) {
    if (allowedFields.includes(key)) {
      data.facility[key] = req.body[key];
    }
  }

  return res.json(data.facility);
});

module.exports = router;
