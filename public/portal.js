let token = null;
let pets = [];

const params = new URLSearchParams(window.location.search);

function toIsoFromLocal(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date/time');
  }
  return date.toISOString();
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `HTTP ${response.status}`);
  }

  return payload;
}

function write(id, value) {
  document.getElementById(id).textContent = JSON.stringify(value, null, 2);
}

function renderPetSelect() {
  const select = document.getElementById('reservation-pet');
  select.innerHTML = '';

  for (const pet of pets) {
    const option = document.createElement('option');
    option.value = pet.id;
    option.textContent = `${pet.name}${pet.breed ? ` (${pet.breed})` : ''}`;
    select.appendChild(option);
  }
}

async function refreshPets() {
  pets = await api('/api/portal/pets');
  renderPetSelect();
  write('pets-output', pets);
}

async function refreshReservations() {
  const reservations = await api('/api/portal/reservations');
  write('reservation-output', reservations);
}

async function initializePortal() {
  const config = await api('/api/portal/public/config');
  document.getElementById('facility-name').textContent = `${config.facility.name} • ${config.facility.timezone}`;
}

initializePortal().catch((error) => {
  document.getElementById('facility-name').textContent = `Portal unavailable: ${error.message}`;
});

if (params.get('verifyToken')) {
  document.getElementById('verify-token').value = params.get('verifyToken');
}

document.getElementById('register-request-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  try {
    const result = await api('/api/portal/register/request', {
      method: 'POST',
      body: JSON.stringify({
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone')
      })
    });

    write('register-output', result);
    if (result.pendingSignup && result.pendingSignup.token) {
      document.getElementById('verify-token').value = result.pendingSignup.token;
    }
  } catch (error) {
    write('register-output', { error: error.message });
  }
});

document.getElementById('register-complete-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  try {
    const result = await api('/api/portal/register/complete', {
      method: 'POST',
      body: JSON.stringify({
        token: formData.get('token'),
        password: formData.get('password')
      })
    });

    token = result.token;
    write('auth-output', { message: 'Account verified and created', user: result.user, customer: result.customer });
    await refreshPets();
    await refreshReservations();
  } catch (error) {
    write('auth-output', { error: error.message });
  }
});

document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  try {
    const result = await api('/api/portal/login', {
      method: 'POST',
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password')
      })
    });

    token = result.token;
    write('auth-output', { message: 'Logged in', user: result.user, customer: result.customer });
    await refreshPets();
    await refreshReservations();
  } catch (error) {
    write('auth-output', { error: error.message });
  }
});

document.getElementById('pet-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  try {
    await api('/api/portal/pets', {
      method: 'POST',
      body: JSON.stringify({
        name: formData.get('name'),
        breed: formData.get('breed') || null,
        weightLbs: formData.get('weightLbs') ? Number(formData.get('weightLbs')) : null
      })
    });

    await refreshPets();
  } catch (error) {
    write('pets-output', { error: error.message });
  }
});

document.getElementById('load-pets').addEventListener('click', async () => {
  try {
    await refreshPets();
  } catch (error) {
    write('pets-output', { error: error.message });
  }
});

document.getElementById('quote-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  try {
    const quote = await api('/api/portal/quote', {
      method: 'POST',
      body: JSON.stringify({
        serviceType: formData.get('serviceType'),
        billingMode: formData.get('billingMode'),
        checkInAt: toIsoFromLocal(formData.get('checkInAt')),
        checkOutAt: toIsoFromLocal(formData.get('checkOutAt')),
        kennelsRequired: Number(formData.get('kennelsRequired') || 1)
      })
    });

    write('quote-output', quote);
  } catch (error) {
    write('quote-output', { error: error.message });
  }
});

document.getElementById('reservation-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  try {
    const reservation = await api('/api/portal/reservations', {
      method: 'POST',
      body: JSON.stringify({
        petId: formData.get('petId'),
        serviceType: formData.get('serviceType'),
        billingMode: formData.get('billingMode'),
        checkInAt: toIsoFromLocal(formData.get('checkInAt')),
        checkOutAt: toIsoFromLocal(formData.get('checkOutAt')),
        notes: formData.get('notes')
      })
    });

    write('reservation-output', reservation);
    await refreshReservations();
  } catch (error) {
    write('reservation-output', { error: error.message });
  }
});

document.getElementById('load-reservations').addEventListener('click', async () => {
  try {
    await refreshReservations();
  } catch (error) {
    write('reservation-output', { error: error.message });
  }
});
