const jwt = require("jsonwebtoken");
require("dotenv").config();

// Génération du token
const generateToken = (user) => {
  return (
    jwt.sign({
      id: user.id,
      username: user.username,
      role: user.role,
    }),
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );
};

// Vérification du token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };