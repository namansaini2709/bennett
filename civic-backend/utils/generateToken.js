const jwt = require('jsonwebtoken');

const generateToken = (id, role, department = null) => {
  return jwt.sign({ id, role, department }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const generateRefreshToken = (id, role, department = null) => {
  return jwt.sign({ id, role, department }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

module.exports = { generateToken, generateRefreshToken };