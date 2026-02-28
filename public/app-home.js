const SESSION_KEY = 'milo_app_session';
const CUSTOMERS_KEY = 'milo_app_customers';

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

const reportItems = [
  { metric: 'Boarding revenue', value: '$18,240', trend: '+8%' },
  { metric: 'Daycare visits', value: '412', trend: '+5%' },
  { metric: 'Grooming services', value: '96', trend: '+11%' }
];

const bookableEmployees = [
  {
    id: 'emp_taylor',
    name: 'Taylor Brooks',
    role: 'Senior Groomer',
    bookable: true,
    calendar: [
      { time: '9:00 AM', pet: 'Molly', service: 'Bath + Trim', status: 'Confirmed' },
      { time: '11:00 AM', pet: 'Luna', service: 'Full Groom', status: 'Confirmed' },
      { time: '2:30 PM', pet: 'Scout', service: 'Nails + Bath', status: 'Pending' }
    ]
  },
  {
    id: 'emp_casey',
    name: 'Casey Nguyen',
    role: 'Groomer',
    bookable: true,
    calendar: [
      { time: '10:30 AM', pet: 'Winston', service: 'Full Groom', status: 'Confirmed' },
      { time: '1:00 PM', pet: 'Bailey', service: 'Bath + Brush', status: 'Confirmed' },
      { time: '4:00 PM', pet: 'Nala', service: 'Sanitary Trim', status: 'Pending' }
    ]
  },
  {
    id: 'emp_morgan',
    name: 'Morgan Patel',
    role: 'Grooming Assistant',
    bookable: true,
    calendar: [
      { time: '9:30 AM', pet: 'Charlie', service: 'Nails + Ears', status: 'Confirmed' },
      { time: '12:00 PM', pet: 'Rosie', service: 'Bath + Brush', status: 'Confirmed' },
      { time: '3:30 PM', pet: 'Duke', service: 'Prep & Brush', status: 'Pending' }
    ]
  }
];

const tabTitles = {
  home: 'Operations Home',
  calendar: 'Calendar',
  customers: 'Customers',
  reports: 'Reports',
  appointments: 'Appointments'
};

function makeId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function getPetPhotoUrl(url) {
  return url && url.trim() ? url.trim() : 'https://placehold.co/96x96/e2e8f0/475569?text=PET';
}

function getDefaultCustomers() {
  return [
    {
      id: 'cust_mia',
      firstName: 'Mia',
      lastName: 'Torres',
      email: 'mia.torres@example.com',
      phone: '555-2041',
      notes: 'Prefers text updates',
      pets: [
        {
          id: 'pet_charlie',
          name: 'Charlie',
          species: 'dog',
          breed: 'Golden Retriever',
          photoUrl: 'https://placehold.co/96x96/fef3c7/92400e?text=Charlie',
          archived: false
        },
        {
          id: 'pet_sunny',
          name: 'Sunny',
          species: 'dog',
          breed: 'Labrador',
          photoUrl: 'https://placehold.co/96x96/dbeafe/1e3a8a?text=Sunny',
          archived: false
        }
      ]
    },
    {
      id: 'cust_avery',
      firstName: 'Avery',
      lastName: 'Clark',
      email: 'avery.clark@example.com',
      phone: '555-8821',
      notes: '',
      pets: [
        {
          id: 'pet_luna',
          name: 'Luna',
          species: 'dog',
          breed: 'Aussie Mix',
          photoUrl: 'https://placehold.co/96x96/e0e7ff/3730a3?text=Luna',
          archived: false
        }
      ]
    }
  ];
}

function loadCustomers() {
  const raw = localStorage.getItem(CUSTOMERS_KEY);
  if (!raw) {
    return getDefaultCustomers();
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : getDefaultCustomers();
  } catch {
    return getDefaultCustomers();
  }
}

function saveCustomers() {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customersData));
}

let customersData = loadCustomers();
let activeCustomerId = customersData[0]?.id || null;
let activePetId = null;
let activeBookableEmployeeId = bookableEmployees[0]?.id || null;
let customerEditMode = false;

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

function getActiveCustomer() {
  return customersData.find((customer) => customer.id === activeCustomerId) || null;
}

function setPetPreview(url) {
  document.getElementById('pet-photo-preview').src = getPetPhotoUrl(url);
}

function setCustomerEditMode(enabled) {
  customerEditMode = enabled;
  document.getElementById('customer-edit-section').classList.toggle('hidden', !enabled);
  document.getElementById('pet-edit-section').classList.toggle('hidden', !enabled);
  document.getElementById('new-pet-btn').disabled = !enabled;
}

function renderCustomerDetail(customer) {
  const nameEl = document.getElementById('customer-detail-name');
  const metaEl = document.getElementById('customer-detail-meta');
  const notesEl = document.getElementById('customer-detail-notes');
  const editBtn = document.getElementById('edit-customer-btn');

  if (!customer) {
    nameEl.textContent = 'Customer Details';
    metaEl.textContent = 'Select a customer to view profile.';
    notesEl.textContent = 'No customer selected.';
    editBtn.disabled = true;
    return;
  }

  nameEl.textContent = `${customer.firstName} ${customer.lastName}`;
  metaEl.textContent = `${customer.email || 'No email'} • ${customer.phone || 'No phone'}`;
  notesEl.textContent = customer.notes || 'No notes yet.';
  editBtn.disabled = false;
}

function resetCustomerForm() {
  const form = document.getElementById('customer-form');
  form.customerId.value = '';
  form.firstName.value = '';
  form.lastName.value = '';
  form.email.value = '';
  form.phone.value = '';
  form.notes.value = '';
}

function resetPetForm() {
  const form = document.getElementById('pet-form');
  form.petId.value = '';
  form.name.value = '';
  form.species.value = 'dog';
  form.breed.value = '';
  form.photoUrl.value = '';
  form.archived.checked = false;
  activePetId = null;
  setPetPreview('');
}

function fillCustomerForm(customer) {
  const form = document.getElementById('customer-form');
  form.customerId.value = customer.id;
  form.firstName.value = customer.firstName;
  form.lastName.value = customer.lastName;
  form.email.value = customer.email || '';
  form.phone.value = customer.phone || '';
  form.notes.value = customer.notes || '';
}

function fillPetForm(pet) {
  const form = document.getElementById('pet-form');
  form.petId.value = pet.id;
  form.name.value = pet.name;
  form.species.value = pet.species || 'dog';
  form.breed.value = pet.breed || '';
  form.photoUrl.value = pet.photoUrl || '';
  form.archived.checked = Boolean(pet.archived);
  activePetId = pet.id;
  setPetPreview(pet.photoUrl || '');
}

function renderCustomerModule() {
  const customerList = document.getElementById('customer-record-list');
  customerList.innerHTML = '';

  if (customersData.length === 0) {
    customerList.innerHTML = '<div class="record-card">No customers yet. Add one to get started.</div>';
  }

  for (const customer of customersData) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `record-button ${customer.id === activeCustomerId ? 'active' : ''}`;

    const petCount = customer.pets.filter((pet) => !pet.archived).length;
    button.innerHTML = `
      <div class="record-title">${customer.firstName} ${customer.lastName}</div>
      <div class="record-sub">${customer.phone || 'No phone'} • ${petCount} active pet${petCount === 1 ? '' : 's'}</div>
    `;

    button.addEventListener('click', () => {
      activeCustomerId = customer.id;
      activePetId = null;
      fillCustomerForm(customer);
      resetPetForm();
      setCustomerEditMode(false);
      renderCustomerModule();
    });

    customerList.appendChild(button);
  }

  const activeCustomer = getActiveCustomer();
  const label = document.getElementById('active-customer-label');
  const petList = document.getElementById('pet-record-list');
  petList.innerHTML = '';

  if (!activeCustomer) {
    label.textContent = 'Select or create a customer first.';
    renderCustomerDetail(null);
    return;
  }

  label.textContent = `${activeCustomer.firstName} ${activeCustomer.lastName}`;
  renderCustomerDetail(activeCustomer);

  for (const pet of activeCustomer.pets) {
    const row = document.createElement('div');
    row.className = 'record-card pet-row';

    row.innerHTML = `
      <img src="${getPetPhotoUrl(pet.photoUrl)}" alt="${pet.name}" />
      <div>
        <div class="record-title">${pet.name} ${pet.archived ? '<span class="badge archived">Archived</span>' : ''}</div>
        <div class="record-sub">${pet.species || 'dog'} • ${pet.breed || 'Breed not set'}</div>
      </div>
      <div class="pet-actions">
        <button class="btn btn-outline" type="button" data-action="edit-pet" data-pet-id="${pet.id}">Edit</button>
        <button class="btn btn-outline" type="button" data-action="archive-pet" data-pet-id="${pet.id}">${pet.archived ? 'Unarchive' : 'Archive'}</button>
      </div>
    `;

    petList.appendChild(row);
  }

  if (activeCustomer.pets.length === 0) {
    petList.innerHTML = '<div class="record-card">No pets yet. Click + New Pet.</div>';
  }

  for (const button of petList.querySelectorAll('[data-action="edit-pet"]')) {
    button.addEventListener('click', () => {
      const petId = button.getAttribute('data-pet-id');
      const pet = activeCustomer.pets.find((entry) => entry.id === petId);
      if (pet) {
        setCustomerEditMode(true);
        fillPetForm(pet);
        document.getElementById('pet-output').textContent = `Editing ${pet.name}.`;
      }
    });
  }

  for (const button of petList.querySelectorAll('[data-action="archive-pet"]')) {
    button.addEventListener('click', () => {
      const petId = button.getAttribute('data-pet-id');
      const pet = activeCustomer.pets.find((entry) => entry.id === petId);
      if (!pet) {
        return;
      }

      pet.archived = !pet.archived;
      saveCustomers();
      document.getElementById('pet-output').textContent = `${pet.name} ${pet.archived ? 'archived' : 'unarchived'}.`;
      renderCustomerModule();
    });
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

function renderAppointmentsModule() {
  const listEl = document.getElementById('bookable-employee-list');
  const calendarEl = document.getElementById('employee-calendar-list');
  const titleEl = document.getElementById('appointments-title');
  listEl.innerHTML = '';
  calendarEl.innerHTML = '';

  const employees = bookableEmployees.filter((employee) => employee.bookable);

  for (const employee of employees) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `record-button ${employee.id === activeBookableEmployeeId ? 'active' : ''}`;
    button.innerHTML = `
      <div class="record-title">${employee.name}</div>
      <div class="record-sub">${employee.role} • ${employee.calendar.length} appointments</div>
    `;

    button.addEventListener('click', () => {
      activeBookableEmployeeId = employee.id;
      renderAppointmentsModule();
    });

    listEl.appendChild(button);
  }

  const activeEmployee = employees.find((employee) => employee.id === activeBookableEmployeeId) || employees[0] || null;
  if (!activeEmployee) {
    titleEl.textContent = 'Employee Calendar';
    calendarEl.innerHTML = '<div class="record-card">No bookable employees configured.</div>';
    return;
  }

  activeBookableEmployeeId = activeEmployee.id;
  titleEl.textContent = `${activeEmployee.name} Calendar`;

  renderList('employee-calendar-list', activeEmployee.calendar, (entry) => `
    <strong>${entry.time}</strong>
    <div class="inline"><span>${entry.pet} • ${entry.service}</span><span>${entry.status}</span></div>
  `);
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

  renderList('report-list', reportItems, (item) => `
    <strong>${item.metric}</strong>
    <div class="inline"><span>${item.value}</span><span>${item.trend}</span></div>
  `);

  renderAppointmentsModule();
  const activeCustomer = getActiveCustomer();
  if (activeCustomer) {
    fillCustomerForm(activeCustomer);
    renderCustomerDetail(activeCustomer);
  } else {
    resetCustomerForm();
    renderCustomerDetail(null);
  }
  resetPetForm();
  setCustomerEditMode(false);
  renderCustomerModule();
}

const session = requireSession();
if (session) {
  setupDashboard(session);
}

activateTab('home');

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

document.getElementById('new-customer-btn').addEventListener('click', () => {
  activeCustomerId = null;
  activePetId = null;
  resetCustomerForm();
  resetPetForm();
  setCustomerEditMode(true);
  renderCustomerDetail(null);
  document.getElementById('customer-detail-name').textContent = 'New Customer';
  document.getElementById('customer-detail-meta').textContent = 'Enter customer details and save.';
  document.getElementById('customer-output').textContent = 'Creating a new customer.';
  renderCustomerModule();
});

document.getElementById('edit-customer-btn').addEventListener('click', () => {
  const activeCustomer = getActiveCustomer();
  if (!activeCustomer) {
    return;
  }

  fillCustomerForm(activeCustomer);
  setCustomerEditMode(true);
  document.getElementById('customer-output').textContent = `Editing ${activeCustomer.firstName} ${activeCustomer.lastName}.`;
});

document.getElementById('customer-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;

  const payload = {
    firstName: form.firstName.value.trim(),
    lastName: form.lastName.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    notes: form.notes.value.trim()
  };

  if (!payload.firstName || !payload.lastName) {
    document.getElementById('customer-output').textContent = 'First and last name are required.';
    return;
  }

  const existingId = form.customerId.value;
  if (existingId) {
    const existing = customersData.find((customer) => customer.id === existingId);
    if (existing) {
      Object.assign(existing, payload);
      activeCustomerId = existing.id;
      document.getElementById('customer-output').textContent = 'Customer updated.';
    }
  } else {
    const customer = {
      id: makeId('cust'),
      ...payload,
      pets: []
    };
    customersData.unshift(customer);
    activeCustomerId = customer.id;
    form.customerId.value = customer.id;
    document.getElementById('customer-output').textContent = 'Customer added.';
  }

  saveCustomers();
  setCustomerEditMode(false);
  renderCustomerModule();
});

document.getElementById('new-pet-btn').addEventListener('click', () => {
  const activeCustomer = getActiveCustomer();
  if (!activeCustomer) {
    document.getElementById('pet-output').textContent = 'Save a customer first, then add pets.';
    return;
  }

  resetPetForm();
  setCustomerEditMode(true);
  document.getElementById('pet-output').textContent = `Adding new pet for ${activeCustomer.firstName} ${activeCustomer.lastName}.`;
});

document.getElementById('pet-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const activeCustomer = getActiveCustomer();
  if (!activeCustomer) {
    document.getElementById('pet-output').textContent = 'Save a customer before adding pets.';
    return;
  }

  const form = event.currentTarget;
  const petPayload = {
    name: form.name.value.trim(),
    species: form.species.value.trim() || 'dog',
    breed: form.breed.value.trim(),
    photoUrl: form.photoUrl.value.trim(),
    archived: Boolean(form.archived.checked)
  };

  if (!petPayload.name) {
    document.getElementById('pet-output').textContent = 'Pet name is required.';
    return;
  }

  const existingPetId = form.petId.value;
  if (existingPetId) {
    const pet = activeCustomer.pets.find((entry) => entry.id === existingPetId);
    if (pet) {
      Object.assign(pet, petPayload);
      document.getElementById('pet-output').textContent = 'Pet updated.';
    }
  } else {
    activeCustomer.pets.push({ id: makeId('pet'), ...petPayload });
    document.getElementById('pet-output').textContent = 'Pet added.';
  }

  saveCustomers();
  setCustomerEditMode(false);
  renderCustomerModule();
});

document.getElementById('pet-form').photoUrl.addEventListener('input', (event) => {
  setPetPreview(event.target.value);
});
