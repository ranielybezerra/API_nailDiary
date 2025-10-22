const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamento.controller');
const { verificarToken, verificarAdmin } = require('../middlewares/auth.middleware');
const { 
  validarCriarAgendamento, 
  validarUUID, 
  validarBusca 
} = require('../middlewares/validation.middleware');

// GET /api/agendamentos - Listar agendamentos (admin)
router.get('/', verificarToken, verificarAdmin, validarBusca, agendamentoController.listar);

// GET /api/agendamentos/:id - Obter agendamento por ID (admin)
router.get('/:id', verificarToken, verificarAdmin, validarUUID('id'), agendamentoController.obterPorId);

// POST /api/agendamentos - Criar agendamento (público)
router.post('/', validarCriarAgendamento, agendamentoController.criar);

// PUT /api/agendamentos/:id - Atualizar agendamento (admin)
router.put('/:id', verificarToken, verificarAdmin, validarUUID('id'), agendamentoController.atualizar);

// PATCH /api/agendamentos/:id/confirmar - Confirmar agendamento (admin)
router.patch('/:id/confirmar', verificarToken, verificarAdmin, validarUUID('id'), agendamentoController.confirmar);

// PATCH /api/agendamentos/:id/cancelar - Cancelar agendamento (admin)
router.patch('/:id/cancelar', verificarToken, verificarAdmin, validarUUID('id'), agendamentoController.cancelar);

// GET /api/agendamentos/verificar-disponibilidade - Verificar disponibilidade (público)
router.get('/verificar-disponibilidade', agendamentoController.verificarDisponibilidade);

module.exports = router;



