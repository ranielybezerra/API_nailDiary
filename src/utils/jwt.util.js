const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Gera um token JWT para o usuário
 * @param {Object} payload - Dados do usuário (id, email, role)
 * @returns {string} Token JWT
 */
const gerarToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Verifica e decodifica um token JWT
 * @param {string} token - Token JWT
 * @returns {Object} Dados decodificados do token
 */
const verificarToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

/**
 * Extrai o token do header Authorization
 * @param {string} authHeader - Header Authorization (Bearer token)
 * @returns {string|null} Token extraído ou null
 */
const extrairToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

module.exports = {
  gerarToken,
  verificarToken,
  extrairToken,
};

