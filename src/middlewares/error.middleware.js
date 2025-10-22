const { errorResponse, validationErrorResponse } = require('../utils/response.util');

/**
 * Middleware para tratamento centralizado de erros
 */
const errorHandler = (err, req, res, next) => {
  console.error('Erro capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Erro de validação do express-validator
  if (err.type === 'validation') {
    return validationErrorResponse(res, err.errors);
  }

  // Erro de sintaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, 'JSON inválido', 'INVALID_JSON', 400);
  }

  // Erro de validação personalizado
  if (err.message && (
    err.message.includes('obrigatório') ||
    err.message.includes('deve ter') ||
    err.message.includes('inválido') ||
    err.message.includes('formato')
  )) {
    return errorResponse(res, err.message, 'VALIDATION_ERROR', 400);
  }

  // Erro de recurso não encontrado
  if (err.message && (
    err.message.includes('não encontrado') ||
    err.message.includes('não existe')
  )) {
    return errorResponse(res, err.message, 'NOT_FOUND', 404);
  }

  // Erro de conflito (ex: horário já ocupado, duplicação)
  if (err.message && (
    err.message.includes('não disponível') ||
    err.message.includes('já existe') ||
    err.message.includes('conflito') ||
    err.message.includes('ocupado')
  )) {
    return errorResponse(res, err.message, 'CONFLICT', 409);
  }

  // Erro de acesso negado
  if (err.message && (
    err.message.includes('Acesso negado') ||
    err.message.includes('apenas administradores') ||
    err.message.includes('não autorizado')
  )) {
    return errorResponse(res, err.message, 'ACCESS_DENIED', 403);
  }

  // Erro de credenciais inválidas
  if (err.message && (
    err.message.includes('Credenciais inválidas') ||
    err.message.includes('senha incorreta') ||
    err.message.includes('usuário não encontrado')
  )) {
    return errorResponse(res, err.message, 'INVALID_CREDENTIALS', 401);
  }

  // Erro de token
  if (err.message && (
    err.message.includes('Token') ||
    err.message.includes('token') ||
    err.message.includes('jwt')
  )) {
    return errorResponse(res, err.message, 'TOKEN_ERROR', 401);
  }

  // Erro de banco de dados
  if (err.code && (
    err.code.includes('P2002') || // Unique constraint
    err.code.includes('P2025') || // Record not found
    err.code.includes('P2003')    // Foreign key constraint
  )) {
    let message = 'Erro de banco de dados';
    let code = 'DATABASE_ERROR';
    
    if (err.code === 'P2002') {
      message = 'Recurso já existe';
      code = 'DUPLICATE_ENTRY';
    } else if (err.code === 'P2025') {
      message = 'Recurso não encontrado';
      code = 'NOT_FOUND';
    } else if (err.code === 'P2003') {
      message = 'Referência inválida';
      code = 'INVALID_REFERENCE';
    }
    
    return errorResponse(res, message, code, 400);
  }

  // Erro de conexão com banco
  if (err.message && (
    err.message.includes('DATABASE_URL') ||
    err.message.includes('connection') ||
    err.message.includes('connect')
  )) {
    return errorResponse(res, 'Erro de conexão com banco de dados', 'DATABASE_CONNECTION_ERROR', 503);
  }

  // Erro interno do servidor (padrão) - NUNCA expor detalhes internos
  console.error('Erro interno não tratado:', err);
  return errorResponse(res, 'Erro interno do servidor. Tente novamente mais tarde.', 'INTERNAL_ERROR', 500);
};

/**
 * Middleware para capturar rotas não encontradas
 */
const notFoundHandler = (req, res) => {
  return errorResponse(res, `Rota ${req.method} ${req.path} não encontrada`, 'ROUTE_NOT_FOUND', 404);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
