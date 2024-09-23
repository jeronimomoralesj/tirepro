// hashPassword.js

const bcrypt = require('bcryptjs');

const password = 'jeronimo'; // Use the plain-text password you want to test
bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log('Hashed password:', hash);
});
