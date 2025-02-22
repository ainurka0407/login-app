//public//login.js
console.log('login.js loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded');

  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const message = document.getElementById('message');

  if (!loginForm || !emailInput || !passwordInput || !message) {
    console.error('One or more elements not found!');
    return;
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Form submitted');

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      message.textContent = 'Please fill in all fields!';
      message.style.color = 'red';
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        credentials: 'include', // Ensures session cookie is saved
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          deviceId: 'browser-device-id'
        }),
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        // Store the token and user info in localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem("email", data.user.email);

        console.log("Token stored in localStorage:", localStorage.getItem('authToken'));
        message.textContent = 'Login successful!';
        message.style.color = 'green';
        // Redirect based on whether the user is admin or not:
        setTimeout(() => {
          if (data.user && data.user.isAdmin) {
            window.location.href = '/managa';
          } else {
            window.location.href = '/profile';
          }
        }, 1000);
      } else {
        message.textContent = data.message || 'Login failed. Please try again.';
        message.style.color = 'red';
      }
    } catch (error) {
      console.error('Error during login:', error);
      message.textContent = 'An error occurred. Please try again.';
      message.style.color = 'red';
    }
  });
});
