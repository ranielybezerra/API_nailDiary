const { body, param, query, validationResult } = require('express-validator');
const { validationErrorResponse } = require('../utils/response.util');

/**
 * Middleware para processar resultados de validação
 */
const processarValidacao = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));

    return validationErrorResponse(res, errorDetails);
  }

  next();
};

/**
 * Validações para login
 */
const validarLogin = [
  body('email')
    .isEmail()
    .withMessage('Email deve ser válido')
    .normalizeEmail(),
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  processarValidacao,
];

/**
 * Validações para criação de serviço
 */
const validarCriarServico = [
  body('nome')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('descricao')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres'),
  body('duracao')
    .isInt({ min: 15, max: 480 })
    .withMessage('Duração deve estar entre 15 e 480 minutos'),
  body('preco')
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Preço deve ser um valor decimal válido'),
  body('icone')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Ícone deve ter no máximo 10 caracteres'),
  processarValidacao,
];

/**
 * Validações para criação de agendamento
 */
const validarCriarAgendamento = [
  body('clienteNome')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome do cliente deve ter entre 2 e 100 caracteres'),
  body('clienteEmail')
    .isEmail()
    .withMessage('Email deve ser válido')
    .normalizeEmail(),
  body('clienteTelefone')
    .trim()
    .notEmpty()
    .withMessage('Telefone é obrigatório')
    .custom((value) => {
      // Remover caracteres não numéricos para validar
      const numeros = value.replace(/\D/g, '');
      if (numeros.length < 10 || numeros.length > 15) {
        throw new Error('Telefone deve ter entre 10 e 15 dígitos numéricos');
      }
      return true;
    }),
  body('dataHora')
    .isISO8601()
    .withMessage('Data e hora devem estar no formato ISO 8601'),
  body('servicoId')
    .notEmpty()
    .withMessage('ID do serviço é obrigatório')
    .isString()
    .withMessage('ID do serviço deve ser uma string')
    .isLength({ min: 1 })
    .withMessage('ID do serviço é obrigatório'),
  body('observacoes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Observações devem ter no máximo 500 caracteres'),
  processarValidacao,
];

/**
 * Validações para criação de dica
 */
const validarCriarDica = [
  body('titulo')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Título deve ter entre 3 e 200 caracteres'),
  body('conteudo')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Conteúdo deve ter entre 10 e 5000 caracteres'),
  processarValidacao,
];

/**
 * Validações para parâmetros UUID/CUID
 */
const validarUUID = (paramName) => [
  param(paramName)
    .isLength({ min: 20, max: 30 })
    .withMessage(`${paramName} deve ser um ID válido`),
  processarValidacao,
];

/**
 * Validações para query de busca
 */
const validarBusca = [
  query('titulo')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Título de busca deve ter entre 2 e 100 caracteres'),
  query('status')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(['PENDENTE', 'CONFIRMADO', 'CANCELADO', 'CONCLUIDO'])
    .withMessage('Status deve ser PENDENTE, CONFIRMADO, CANCELADO ou CONCLUIDO'),
  query('dataInicio')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value || value === '') return true;
      // Aceita formato ISO8601 ou formato YYYY-MM-DD
      const iso8601Regex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      return iso8601Regex.test(value) || dateRegex.test(value);
    })
    .withMessage('Data de início deve estar no formato ISO 8601 ou YYYY-MM-DD'),
  query('dataFim')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value || value === '') return true;
      // Aceita formato ISO8601 ou formato YYYY-MM-DD
      const iso8601Regex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      return iso8601Regex.test(value) || dateRegex.test(value);
    })
    .withMessage('Data de fim deve estar no formato ISO 8601 ou YYYY-MM-DD'),
  processarValidacao,
];

module.exports = {
  processarValidacao,
  validarLogin,
  validarCriarServico,
  validarCriarAgendamento,
  validarCriarDica,
  validarUUID,
  validarBusca,
};
