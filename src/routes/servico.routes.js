const express = require('express');
const router = express.Router();
const servicoController = require('../controllers/servico.controller');
const { verificarToken, verificarAdmin } = require('../middlewares/auth.middleware');
const { 
  validarCriarServico, 
  validarUUID, 
  validarBusca 
} = require('../middlewares/validation.middleware');

// GET /api/servicos - Listar serviços (público)
router.get('/', validarBusca, servicoController.listar);

// GET /api/servicos/:id - Obter serviço por ID (público)
router.get('/:id', validarUUID('id'), servicoController.obterPorId);

// POST /api/servicos - Criar serviço (admin)
router.post('/', verificarToken, verificarAdmin, validarCriarServico, servicoController.criar);

// PUT /api/servicos/:id - Atualizar serviço (admin)
router.put('/:id', verificarToken, verificarAdmin, validarUUID('id'), servicoController.atualizar);

// PATCH /api/servicos/:id/inativar - Inativar serviço (admin)
router.patch('/:id/inativar', verificarToken, verificarAdmin, validarUUID('id'), servicoController.inativar);

// PATCH /api/servicos/:id/ativar - Ativar serviço (admin)
router.patch('/:id/ativar', verificarToken, verificarAdmin, validarUUID('id'), servicoController.ativar);

// DELETE /api/servicos/:id - Excluir serviço (admin)
router.delete('/:id', verificarToken, verificarAdmin, validarUUID('id'), servicoController.excluir);

module.exports = router;



