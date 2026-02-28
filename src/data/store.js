const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const now = () => new Date().toISOString();

const makeId = () => randomUUID();

const data = {
  facility: {
    id: 'facility-main',
    name: 'MILO Demo Boarding',
    timezone: 'America/New_York',
    kennelCount: 24,
    dayCutoffHour: 12,
    nightCutoffHour: 18,
    taxRates: {
      boarding: 0.07,
      daycare: 0.07,
      grooming: 0.07,
      retail: 0.07
    },
    pricing: {
      boardingNight: 58,
      daycareDay: 34,
      groomingBase: 45
    }
  },
  users: [
    {
      id: 'user-admin',
      email: 'admin@milo.local',
      name: 'Owner Admin',
      role: 'admin',
      passwordHash: bcrypt.hashSync('ChangeMe123!', 10),
      active: true,
      createdAt: now()
    }
  ],
  employees: [],
  customers: [],
  pets: [],
  reservations: [],
  groomingAppointments: [],
  inventoryItems: [],
  invoices: []
};

function list(collectionName) {
  return data[collectionName] || [];
}

function insert(collectionName, item) {
  const entity = {
    id: makeId(),
    createdAt: now(),
    updatedAt: now(),
    ...item
  };

  data[collectionName].push(entity);
  return entity;
}

function update(collectionName, id, patch) {
  const index = data[collectionName].findIndex((entry) => entry.id === id);
  if (index === -1) {
    return null;
  }

  data[collectionName][index] = {
    ...data[collectionName][index],
    ...patch,
    updatedAt: now()
  };

  return data[collectionName][index];
}

function findById(collectionName, id) {
  return data[collectionName].find((entry) => entry.id === id) || null;
}

module.exports = {
  data,
  list,
  insert,
  update,
  findById
};
