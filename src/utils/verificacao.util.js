const crypto = require('crypto');

/**
 * Gera um token único para verificação de agendamento
 * @returns {string} Token único (32 caracteres hexadecimais)
 */
const gerarToken = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Gera um PIN numérico de 4 dígitos
 * @returns {string} PIN de 4 dígitos
 */
const gerarPIN = () => {
  // Gerar número aleatório entre 1000 e 9999
  const pin = Math.floor(1000 + Math.random() * 9000);
  return pin.toString();
};

module.exports = {
  gerarToken,
  gerarPIN,
};

