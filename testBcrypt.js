const bcrypt = require('bcryptjs');

// This is the password you'd like to test
const plainPassword = '123456';  // Try the password you are using to login

// Hash the password

bcrypt.hash(plainPassword, 10, (err, hashedPassword) => {
  if (err) {
    console.log('Error hashing password:', err);
  } else {
    console.log('Hashed Password:', hashedPassword);
  }
});
