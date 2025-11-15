const express = require('express');
const router = express.Router();
const configuracaoController = require('../controllers/configuracao.controller');
const { verificarToken, verificarAdmin } = require('../middlewares/auth.middleware');

// GET /api/configuracoes/disponibilidade - Obter configuração de disponibilidade (admin)
router.get('/disponibilidade', verificarToken, verificarAdmin, configuracaoController.obterDisponibilidade);

// PUT /api/configuracoes/disponibilidade - Salvar configuração de disponibilidade (admin)
router.put('/disponibilidade', verificarToken, verificarAdmin, configuracaoController.salvarDisponibilidade);

// GET /api/configuracoes - Listar todas as configurações (admin)
router.get('/', verificarToken, verificarAdmin, configuracaoController.listar);

module.exports = router;


