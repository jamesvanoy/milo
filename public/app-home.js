const SESSION_KEY = 'milo_app_session';
const SETTINGS_KEY = 'milo_app_settings';

const arrivals = [
  { dog: 'Charlie', owner: 'Mia Torres', type: 'Arrival', time: '8:30 AM', service: 'Boarding' },
  { dog: 'Bailey', owner: 'Noah Greene', type: 'Departure', time: '11:00 AM', service: 'Boarding' },
  { dog: 'Luna', owner: 'Avery Clark', type: 'Arrival', time: '1:15 PM', service: 'Daycare' },
  { dog: 'Cooper', owner: 'Riley James', type: 'Departure', time: '5:45 PM', service: 'Daycare' }
];

const daycareGroups = [
  { group: 'Small Social', dogs: 9, lead: 'Sam' },
  { group: 'High Energy', dogs: 14, lead: 'Jordan' },
  { group: 'Senior & Calm', dogs: 6, lead: 'Alex' }
];

const groomingQueue = [
  { dog: 'Molly', service: 'Bath + Trim', time: '10:00 AM', groomer: 'Taylor' },
  { dog: 'Winston', service: 'Full Groom', time: '12:30 PM', groomer: 'Casey' },
  { dog: 'Nala', service: 'Nails + Bath', time: '3:00 PM', groomer: 'Morgan' }
];

const calendarItems = [
  { time: '8:30 AM', item: 'Charlie check-in (Boarding)' },
  { time: '9:00 AM', item: 'Small Social daycare group opens' },
  { time: '10:00 AM', item: 'Molly grooming appointment' },
  { time: '11:00 AM', item: 'Bailey check-out (Boarding)' },
  { time: '3:00 PM', item: 'Nala grooming appointment' }
];

const reservationItems = [
  { pet: 'Koda', owner: 'Emma Lewis', stay: 'Mar 3 - Mar 6', status: 'Pending' },
  { pet: 'Rosie', owner: 'Liam Walker', stay: 'Mar 4 (Daycare)', status: 'Confirmed' },
  { pet: 'Duke', owner: 'Olivia Hall', stay: 'Mar 5 - Mar 8', status: 'Pending' }
];

const customerItems = [
  { customer: 'Mia Torres', pets: 'Charlie, Sunny', phone: '555-2041' },
  { customer: 'Avery Clark', pets: 'Luna', phone: '555-8821' },
  { customer: 'Riley James', pets: 'Cooper', phone: '555-4382' }
];

const billingItems = [
  { invoice: 'INV-1043', customer: 'Mia Torres', total: '$232.14', status: 'Open' },
  { invoice: 'INV-1044', customer: 'Avery Clark', total: '$78.21', status: 'Paid' },
  { invoice: 'INV-1045', customer: 'Liam Walker', total: '$54.50', status: 'Open' }
];

const inventoryItems = [
  { item: 'Large Kennel Cleaner', qty: 4, reorder: 6 },
  { item: 'Premium Dog Food 30lb', qty: 11, reorder: 8 },
  { item: 'Shampoo - Oatmeal', qty: 2, reorder: 5 }
];

const reportItems = [
  { metric: 'Boarding revenue', value: '$18,240', trend: '+8%' },
  { metric: 'Daycare visits', value: '412', trend: '+5%' },
  { metric: 'Grooming services', value: '96', trend: '+11%' }
];

const tabTitles = {
  dashboard: 'Operations Home',
  calendar: 'Calendar',
  reservations: 'Reservations',
  customers: 'Customers & Pets',
  daycare: 'Daycare',
  grooming: 'Grooming',
  billing: 'Billing',
  inventory: 'Inventory',
  reports: 'Reports',
  settings: 'Settings'
};

function requireSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) {
    window.location.href = '/app.html';
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    window.location.href = '/app.html';
    return null;
  }
}

function renderList(containerId, items, formatter) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  for (const item of items) {
    const row = document.createElement('div');
    row.className = 'list-item';
    row.innerHTML = formatter(item);
    container.appendChild(row);
  }
}

function activateTab(tabName) {
  for (const menuItem of document.querySelectorAll('.menu-tab')) {
    menuItem.classList.toggle('active', menuItem.getAttribute('data-tab') === tabName);
  }

  for (const panel of document.querySelectorAll('.tab-panel')) {
    panel.classList.toggle('active', panel.getAttribute('data-panel') === tabName);
  }

  document.getElementById('active-tab-title').textContent = tabTitles[tabName] || 'Operations Home';
}

function loadSettings() {
  const fallback = {
    facilityName: 'MILO Demo Boarding',
    timezone: 'America/New_York',
    kennelCount: 24,
    boardingRate: 58,
    daycareRate: 34,
    groomingRate: 45
  };

  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return fallback;
  }

  try {
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

function applySettingsToForm(settings) {
  const form = document.getElementById('settings-form');
  form.facilityName.value = settings.facilityName;
  form.timezone.value = settings.timezone;
  form.kennelCount.value = settings.kennelCount;
  form.boardingRate.value = settings.boardingRate;
  form.daycareRate.value = settings.daycareRate;
  form.groomingRate.value = settings.groomingRate;
}

function setupDashboard(session) {
  document.getElementById('user-name').textContent = session.name;
  document.getElementById('user-role').textContent = `${session.role} • ${session.email}`;

  const today = new Date();
  document.getElementById('today-label').textContent = today.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  document.getElementById('kpi-occupancy').textContent = '71%';
  document.getElementById('kpi-onsite').textContent = '27';
  document.getElementById('kpi-daycare').textContent = '19';
  document.getElementById('kpi-grooming').textContent = '8';

  renderList('arrivals-list', arrivals, (item) => `
    <strong>${item.dog}</strong>
    <div class="inline"><span>${item.type} • ${item.service}</span><span>${item.time}</span></div>
    <div class="inline"><span>Owner: ${item.owner}</span></div>
  `);

  renderList('daycare-list', daycareGroups, (item) => `
    <strong>${item.group}</strong>
    <div class="inline"><span>${item.dogs} dogs</span><span>Lead: ${item.lead}</span></div>
  `);

  renderList('grooming-list', groomingQueue, (item) => `
    <strong>${item.dog}</strong>
    <div class="inline"><span>${item.service}</span><span>${item.time}</span></div>
    <div class="inline"><span>Groomer: ${item.groomer}</span></div>
  `);

  renderList('calendar-list', calendarItems, (item) => `
    <strong>${item.time}</strong>
    <div class="inline"><span>${item.item}</span></div>
  `);

  renderList('reservation-list', reservationItems, (item) => `
    <strong>${item.pet}</strong>
    <div class="inline"><span>${item.owner}</span><span>${item.status}</span></div>
    <div class="inline"><span>${item.stay}</span></div>
  `);

  renderList('customer-list', customerItems, (item) => `
    <strong>${item.customer}</strong>
    <div class="inline"><span>Pets: ${item.pets}</span><span>${item.phone}</span></div>
  `);

  renderList('daycare-tab-list', daycareGroups, (item) => `
    <strong>${item.group}</strong>
    <div class="inline"><span>${item.dogs} dogs</span><span>Lead: ${item.lead}</span></div>
  `);

  renderList('grooming-tab-list', groomingQueue, (item) => `
    <strong>${item.dog}</strong>
    <div class="inline"><span>${item.service}</span><span>${item.time}</span></div>
    <div class="inline"><span>Groomer: ${item.groomer}</span></div>
  `);

  renderList('billing-list', billingItems, (item) => `
    <strong>${item.invoice}</strong>
    <div class="inline"><span>${item.customer}</span><span>${item.total}</span></div>
    <div class="inline"><span>Status: ${item.status}</span></div>
  `);

  renderList('inventory-list', inventoryItems, (item) => `
    <strong>${item.item}</strong>
    <div class="inline"><span>Qty: ${item.qty}</span><span>Reorder: ${item.reorder}</span></div>
  `);

  renderList('report-list', reportItems, (item) => `
    <strong>${item.metric}</strong>
    <div class="inline"><span>${item.value}</span><span>${item.trend}</span></div>
  `);

  applySettingsToForm(loadSettings());
}

const session = requireSession();
if (session) {
  setupDashboard(session);
}

activateTab('dashboard');

for (const tabButton of document.querySelectorAll('.menu-tab')) {
  tabButton.addEventListener('click', (event) => {
    event.preventDefault();
    activateTab(tabButton.getAttribute('data-tab'));
  });
}

document.getElementById('logout-btn').addEventListener('click', () => {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = '/app.html';
});

for (const button of document.querySelectorAll('[data-action]')) {
  button.addEventListener('click', () => {
    const action = button.getAttribute('data-action');
    const targetTab = button.getAttribute('data-target-tab');
    document.getElementById('action-output').textContent = `${action} selected.`;
    if (targetTab) {
      activateTab(targetTab);
    }
  });
}

document.getElementById('settings-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;

  const settings = {
    facilityName: form.facilityName.value.trim(),
    timezone: form.timezone.value.trim(),
    kennelCount: Number(form.kennelCount.value),
    boardingRate: Number(form.boardingRate.value),
    daycareRate: Number(form.daycareRate.value),
    groomingRate: Number(form.groomingRate.value)
  };

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  document.getElementById('settings-output').textContent = 'Settings saved locally for this browser session.';
});
