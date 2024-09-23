const bcrypt = require('bcryptjs');

const plainPassword = 'jeronimo'; // Use the password you're testing with
const storedHash = '$2a$10$O7x3wFjIR6c97osiWSamCeDsv1b/cV3iTgiRAvEDt/B3zW9u1vI2e'; // Replace with the stored hash

bcrypt.compare(plainPassword, storedHash, (err, result) => {
  if (err) throw err;
  console.log('Password match result:', result); // Should print true or false
});
