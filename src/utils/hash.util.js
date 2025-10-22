const bcrypt = require('bcryptjs');

/**
 * Gera hash da senha
 * @param {string} senha - Senha em texto plano
 * @returns {Promise<string>} Hash da senha
 */
const hashSenha = async (senha) => {
  const saltRounds = 12;
  return await bcrypt.hash(senha, saltRounds);
};

/**
 * Compara senha com hash
 * @param {string} senha - Senha em texto plano
 * @param {string} hash - Hash da senha
 * @returns {Promise<boolean>} True se a senha confere
 */
const compararSenha = async (senha, hash) => {
  return await bcrypt.compare(senha, hash);
};

module.exports = {
  hashSenha,
  compararSenha,
};

