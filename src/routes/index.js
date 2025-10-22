const express = require('express');
const router = express.Router();

// Importar rotas
const authRoutes = require('./auth.routes');
const servicoRoutes = require('./servico.routes');
const agendamentoRoutes = require('./agendamento.routes');
const dicaRoutes = require('./dica.routes');

// Montar rotas
router.use('/auth', authRoutes);
router.use('/servicos', servicoRoutes);
router.use('/agendamentos', agendamentoRoutes);
router.use('/dicas', dicaRoutes);

// Rota de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API NailDiary funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

module.exports = router;



