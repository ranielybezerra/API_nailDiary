/**
 * Formata resposta de sucesso
 * @param {Object} res - Objeto response do Express
 * @param {*} data - Dados a serem retornados
 * @param {string} message - Mensagem de sucesso
 * @param {number} statusCode - Código de status HTTP
 */
const successResponse = (res, data = null, message = 'Operação realizada com sucesso', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

/**
 * Formata resposta de erro
 * @param {Object} res - Objeto response do Express
 * @param {string} message - Mensagem de erro
 * @param {string} code - Código do erro
 * @param {number} statusCode - Código de status HTTP
 */
const errorResponse = (res, message = 'Erro interno do servidor', code = 'INTERNAL_ERROR', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
    code,
  });
};

/**
 * Formata resposta de validação
 * @param {Object} res - Objeto response do Express
 * @param {Array} errors - Array de erros de validação
 */
const validationErrorResponse = (res, errors) => {
  return res.status(400).json({
    success: false,
    error: 'Dados inválidos',
    code: 'VALIDATION_ERROR',
    details: errors,
  });
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
};

