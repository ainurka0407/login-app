// Registration form submission
// Get the registration form
const registerForm = document.getElementById('register-form');

// Add a submit event listener
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent default form submission

  // Collect input values
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirm-password').value.trim();

  // Basic validation
  if (!email || !password) {
    document.getElementById('message').textContent = 'Email and password are required.';
    return;
  }
  if (password !== confirmPassword) {
    document.getElementById('message').textContent = 'Passwords do not match.';
    return;
  }

  try {
    // Send a POST to your registration endpoint
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.ok) {
      // Registration successful; show a success message and redirect after a short delay
      document.getElementById('message').textContent = 'Registration successful! You can now log in.';
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 2000); // Redirect after 2 seconds
    } else {
      // If there's an error (e.g., email taken)
      document.getElementById('message').textContent = data.message || 'Registration failed.';
    }
  } catch (error) {
    console.error('Error registering user:', error);
    document.getElementById('message').textContent = 'An error occurred. Please try again.';
  }
});
