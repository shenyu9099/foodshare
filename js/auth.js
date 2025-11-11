// Register
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('rUsername').value.trim();
    const displayName = document.getElementById('displayName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('rPassword').value;
    const msg = document.getElementById('registerMsg');
    msg.textContent = 'Registering...';
    const res = await fetch(typeof REGISTER_URL === 'string' ? REGISTER_URL : `${API_BASE}/register-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, displayName, email, password })
    });
    if (res.ok) {
      // Track registration event
      if (window.trackEvent) {
        window.trackEvent('UserRegistered', { username: username });
      }
      msg.textContent = 'Registration successful. You can login now.';
    } else {
      msg.textContent = 'Registration failed.';
    }
  });
}

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const msg = document.getElementById('loginMsg');
    msg.textContent = 'Signing in...';
    const res = await fetch(typeof LOGIN_URL === 'string' ? LOGIN_URL : `${API_BASE}/login-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      msg.textContent = 'Invalid credentials.';
      return;
    }
    const data = await res.json();
    // Expected: { success: true, id, username, displayName, email }
    if (data.success && data.id) {
      localStorage.setItem('userId', data.id);
      localStorage.setItem('username', data.username || username);
      localStorage.setItem('displayName', data.displayName || username);
      localStorage.setItem('email', data.email || '');
      
      // Track login event
      if (window.trackEvent) {
        window.trackEvent('UserLoggedIn', { 
          username: data.username,
          userId: data.id
        });
      }
      
      location.href = 'gallery.html';
    } else {
      msg.textContent = 'Login failed.';
    }
  });
}


