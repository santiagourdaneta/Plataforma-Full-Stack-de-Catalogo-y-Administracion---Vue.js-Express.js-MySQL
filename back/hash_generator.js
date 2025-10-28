const bcrypt = require('bcryptjs');

const passwordToHash = '123456'; 
const saltRounds = 10;

bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err) throw err;
    bcrypt.hash(passwordToHash, salt, (err, hash) => {
        if (err) throw err;
        console.log(`\n--- HASH GENERADO ---\n`);
        console.log(`Contraseña: ${passwordToHash}`);
        console.log(`HASH: ${hash}`);
        console.log(`\n-----------------------\n`);
    });
});