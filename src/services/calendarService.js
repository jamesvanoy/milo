const { calculateUnits } = require('./pricingService');

function overlaps(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

function toDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date provided');
  }
  return date;
}

function getReservationOccupancy({ reservations, from, to }) {
  const fromDate = toDate(from);
  const toDateValue = toDate(to);

  return reservations.filter((reservation) => {
    if (reservation.status === 'cancelled') {
      return false;
    }

    const checkIn = toDate(reservation.checkInAt);
    const checkOut = toDate(reservation.checkOutAt);

    return overlaps(fromDate, toDateValue, checkIn, checkOut);
  });
}

function getAvailabilitySummary({ facility, reservations, from, to }) {
  const active = getReservationOccupancy({ reservations, from, to });
  const occupiedKennels = active.reduce((sum, reservation) => sum + (reservation.kennelsRequired || 1), 0);
  const totalKennels = facility.kennelCount;

  return {
    totalKennels,
    occupiedKennels,
    availableKennels: Math.max(0, totalKennels - occupiedKennels),
    utilizationPct: totalKennels ? Number(((occupiedKennels / totalKennels) * 100).toFixed(2)) : 0,
    activeReservations: active.length
  };
}

function quoteReservation({ facility, serviceType, billingMode, checkInAt, checkOutAt, kennelsRequired = 1 }) {
  const units = calculateUnits({
    billingMode,
    checkInAt,
    checkOutAt,
    dayCutoffHour: facility.dayCutoffHour
  });

  return {
    serviceType,
    billingMode,
    units,
    kennelsRequired,
    pricingModel: billingMode === 'night' ? 'Per night' : 'Per day'
  };
}

module.exports = {
  getReservationOccupancy,
  getAvailabilitySummary,
  quoteReservation
};
