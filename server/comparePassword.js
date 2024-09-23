// comparePassword.js

const bcrypt = require('bcryptjs');

const plainPassword = 'jeronimo'; // Use the plain-text password you're testing
const storedHash = '$2a$10$AScFDXtuSWnoxRgHYUR9g.Sc653dcNwDzkSvhAOv3q.uhO2gnXBku'; // Replace with the hash from your registration

bcrypt.compare(plainPassword, storedHash, (err, result) => {
  if (err) throw err;
  console.log('Password match result:', result); // Should print true if they match, false otherwise
});
