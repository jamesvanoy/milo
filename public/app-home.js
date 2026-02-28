const SESSION_KEY = 'milo_app_session';

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
}

const session = requireSession();
if (session) {
  setupDashboard(session);
}

document.getElementById('logout-btn').addEventListener('click', () => {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = '/app.html';
});

for (const button of document.querySelectorAll('[data-action]')) {
  button.addEventListener('click', () => {
    const action = button.getAttribute('data-action');
    document.getElementById('action-output').textContent = JSON.stringify(
      {
        message: `${action} clicked`,
        status: 'placeholder',
        next: 'Wire this action to the real module screen'
      },
      null,
      2
    );
  });
}
