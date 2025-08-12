const bcrypt = require("bcrypt");

// Fonction pour hasher un mot de passe
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Fonction pour comparer un mot de passe avec son hash
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = {
  hashPassword,
  comparePassword,
};
