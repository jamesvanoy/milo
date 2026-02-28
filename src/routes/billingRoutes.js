const express = require('express');
const { data, list, insert, findById } = require('../data/store');
const { requireAuth } = require('../middleware/auth');
const { calculateSubtotal, calculateTax } = require('../services/pricingService');

const router = express.Router();

router.get('/invoices', requireAuth, (req, res) => {
  return res.json(list('invoices'));
});

router.post('/invoices/from-reservation/:reservationId', requireAuth, (req, res) => {
  const reservation = findById('reservations', req.params.reservationId);
  if (!reservation) {
    return res.status(404).json({ error: 'Reservation not found' });
  }

  const subtotal = calculateSubtotal({
    serviceType: reservation.serviceType,
    units: reservation.units,
    facilityPricing: data.facility.pricing
  });

  const tax = calculateTax({
    serviceType: reservation.serviceType,
    subtotal,
    taxRates: data.facility.taxRates
  });

  const invoice = insert('invoices', {
    customerId: reservation.customerId,
    petId: reservation.petId,
    reservationId: reservation.id,
    lineItems: [
      {
        description: `${reservation.serviceType} (${reservation.units} units)` ,
        quantity: reservation.units,
        unitPrice: reservation.units ? Number((subtotal / reservation.units).toFixed(2)) : subtotal,
        subtotal
      }
    ],
    subtotal,
    tax,
    total: Number((subtotal + tax).toFixed(2)),
    status: 'open'
  });

  return res.status(201).json(invoice);
});

router.post('/sales', requireAuth, (req, res) => {
  const { customerId = null, items = [] } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items is required and must be a non-empty array' });
  }

  let subtotal = 0;
  let tax = 0;

  const normalized = items.map((item) => {
    const quantity = Number(item.quantity || 1);
    const unitPrice = Number(item.unitPrice || 0);
    const lineSubtotal = Number((quantity * unitPrice).toFixed(2));
    const lineTax = item.taxable === false ? 0 : Number((lineSubtotal * (data.facility.taxRates.retail || 0)).toFixed(2));

    subtotal += lineSubtotal;
    tax += lineTax;

    return {
      description: item.description || 'Item',
      quantity,
      unitPrice,
      taxable: item.taxable !== false,
      subtotal: lineSubtotal,
      tax: lineTax
    };
  });

  const invoice = insert('invoices', {
    customerId,
    lineItems: normalized,
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    total: Number((subtotal + tax).toFixed(2)),
    status: 'paid'
  });

  return res.status(201).json(invoice);
});

module.exports = router;
