let token = null;

const restrictedSections = Array.from(document.querySelectorAll('[data-requires-auth]'));

function setLockedState(locked) {
  for (const section of restrictedSections) {
    section.classList.toggle('locked', locked);
    const controls = section.querySelectorAll('button, input, select, textarea');
    for (const control of controls) {
      control.disabled = locked;
    }
  }
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

setLockedState(true);
write('auth-output', { message: 'Please sign in to load operational data.' });

document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  try {
    const result = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password')
      })
    });

    token = result.token;
    setLockedState(false);
    write('auth-output', result);
  } catch (error) {
    setLockedState(true);
    write('auth-output', { error: error.message });
  }
});

document.getElementById('load-facility').addEventListener('click', async () => {
  try {
    write('facility-output', await api('/api/facility'));
  } catch (error) {
    write('facility-output', { error: error.message });
  }
});

document.getElementById('check-availability').addEventListener('click', async () => {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  try {
    write('facility-output', await api(`/api/calendar/availability?from=${encodeURIComponent(now.toISOString())}&to=${encodeURIComponent(nextWeek.toISOString())}`));
  } catch (error) {
    write('facility-output', { error: error.message });
  }
});

document.getElementById('quote-night').addEventListener('click', async () => {
  const checkIn = new Date();
  const checkOut = new Date(checkIn.getTime() + 2 * 24 * 60 * 60 * 1000);

  try {
    write('quote-output', await api('/api/calendar/quote', {
      method: 'POST',
      body: JSON.stringify({
        serviceType: 'boarding',
        billingMode: 'night',
        checkInAt: checkIn.toISOString(),
        checkOutAt: checkOut.toISOString(),
        kennelsRequired: 1
      })
    }));
  } catch (error) {
    write('quote-output', { error: error.message });
  }
});

document.getElementById('quote-day').addEventListener('click', async () => {
  const checkIn = new Date();
  const checkOut = new Date(checkIn.getTime() + 2 * 24 * 60 * 60 * 1000);

  try {
    write('quote-output', await api('/api/calendar/quote', {
      method: 'POST',
      body: JSON.stringify({
        serviceType: 'daycare',
        billingMode: 'day',
        checkInAt: checkIn.toISOString(),
        checkOutAt: checkOut.toISOString(),
        kennelsRequired: 1
      })
    }));
  } catch (error) {
    write('quote-output', { error: error.message });
  }
});

for (const [buttonId, endpoint, outputId] of [
  ['list-employees', '/api/employees', 'employees-output'],
  ['list-inventory', '/api/inventory', 'inventory-output'],
  ['list-grooming', '/api/grooming/appointments', 'grooming-output'],
  ['list-invoices', '/api/billing/invoices', 'billing-output']
]) {
  document.getElementById(buttonId).addEventListener('click', async () => {
    try {
      write(outputId, await api(endpoint));
    } catch (error) {
      write(outputId, { error: error.message });
    }
  });
}
