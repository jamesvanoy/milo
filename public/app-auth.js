const SESSION_KEY = 'milo_app_session';

function writeOutput(value) {
  document.getElementById('login-output').textContent = JSON.stringify(value, null, 2);
}

function displayNameFromEmail(email) {
  const localPart = String(email).split('@')[0] || 'staff';
  return localPart
    .split(/[._-]/g)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ') || 'Staff User';
}

const existing = sessionStorage.getItem(SESSION_KEY);
if (existing) {
  window.location.href = '/app-home.html';
}

document.getElementById('app-login-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    writeOutput({ error: 'Email and password are required' });
    return;
  }

  const session = {
    email,
    role: 'staff',
    name: displayNameFromEmail(email),
    signedInAt: new Date().toISOString(),
    authMode: 'fake-login'
  };

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  writeOutput({ message: 'Login successful', session });

  setTimeout(() => {
    window.location.href = '/app-home.html';
  }, 220);
});
