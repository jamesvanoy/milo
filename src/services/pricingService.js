function toDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date provided');
  }
  return date;
}

function diffNights(checkInAt, checkOutAt) {
  const start = toDate(checkInAt);
  const end = toDate(checkOutAt);

  if (end <= start) {
    return 0;
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const raw = (end - start) / msPerDay;
  return Math.max(1, Math.ceil(raw));
}

function diffDays(checkInAt, checkOutAt, cutoffHour = 12) {
  const start = toDate(checkInAt);
  const end = toDate(checkOutAt);

  if (end <= start) {
    return 0;
  }

  const startDate = new Date(start);
  startDate.setHours(cutoffHour, 0, 0, 0);

  const endDate = new Date(end);
  endDate.setHours(cutoffHour, 0, 0, 0);

  const msPerDay = 24 * 60 * 60 * 1000;
  const fullDays = Math.floor((endDate - startDate) / msPerDay);
  const addPartial = end > endDate ? 1 : 0;

  return Math.max(1, fullDays + addPartial);
}

function calculateUnits({ billingMode, checkInAt, checkOutAt, dayCutoffHour }) {
  if (billingMode === 'night') {
    return diffNights(checkInAt, checkOutAt);
  }

  return diffDays(checkInAt, checkOutAt, dayCutoffHour);
}

function calculateSubtotal({ serviceType, units, facilityPricing }) {
  if (serviceType === 'boarding') {
    return units * facilityPricing.boardingNight;
  }

  if (serviceType === 'daycare') {
    return units * facilityPricing.daycareDay;
  }

  if (serviceType === 'grooming') {
    return units * facilityPricing.groomingBase;
  }

  return 0;
}

function calculateTax({ serviceType, subtotal, taxRates }) {
  const rate = taxRates[serviceType] ?? taxRates.retail ?? 0;
  return Number((subtotal * rate).toFixed(2));
}

module.exports = {
  calculateUnits,
  calculateSubtotal,
  calculateTax
};
