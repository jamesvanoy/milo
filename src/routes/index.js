const express = require('express');
const authRoutes = require('./authRoutes');
const facilityRoutes = require('./facilityRoutes');
const employeesRoutes = require('./employeesRoutes');
const customersRoutes = require('./customersRoutes');
const calendarRoutes = require('./calendarRoutes');
const groomingRoutes = require('./groomingRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const billingRoutes = require('./billingRoutes');
const portalRoutes = require('./portalRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'milo', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/facility', facilityRoutes);
router.use('/employees', employeesRoutes);
router.use('/customers', customersRoutes);
router.use('/calendar', calendarRoutes);
router.use('/grooming', groomingRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/billing', billingRoutes);
router.use('/portal', portalRoutes);

module.exports = router;
