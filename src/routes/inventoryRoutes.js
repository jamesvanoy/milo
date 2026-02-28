const express = require('express');
const { list, insert, update } = require('../data/store');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  return res.json(list('inventoryItems'));
});

router.post('/', requireAuth, requireRole(['admin', 'manager']), (req, res) => {
  const { sku, name, category, price = 0, taxable = true, quantityOnHand = 0, reorderLevel = 0 } = req.body;

  if (!sku || !name) {
    return res.status(400).json({ error: 'sku and name are required' });
  }

  const item = insert('inventoryItems', {
    sku,
    name,
    category: category || 'retail',
    price,
    taxable,
    quantityOnHand,
    reorderLevel
  });

  return res.status(201).json(item);
});

router.patch('/:id', requireAuth, requireRole(['admin', 'manager']), (req, res) => {
  const item = update('inventoryItems', req.params.id, req.body);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  return res.json(item);
});

module.exports = router;
