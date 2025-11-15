const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');

// Criar aplicação Express
const app = express();

// Middlewares globais
// Configurar CORS para aceitar produção e previews do Vercel
const allowedOrigins = [
  config.cors.origin,
  'https://front-naildiary.vercel.app',
  /^https:\/\/front-naildiary.*\.vercel\.app$/, // Aceita todos os previews do Vercel
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem origin (ex: Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    // Verifica se a origin está na lista de permitidas
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin || origin === allowedOrigin + '/';
      }
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Log de requisições em desenvolvimento
if (config.server.nodeEnv === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Rotas da API
app.use('/api', routes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API NailDiary - Sistema de Agendamento de Unhas',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      servicos: '/api/servicos',
      agendamentos: '/api/agendamentos',
      dicas: '/api/dicas',
      health: '/api/health',
    },
  });
});

// Middleware para rotas não encontradas
app.use(notFoundHandler);

// Middleware de tratamento de erros
app.use(errorHandler);

// Iniciar servidor
const PORT = config.server.port;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Frontend: ${config.cors.origin}`);
  console.log(`🌍 Ambiente: ${config.server.nodeEnv}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Middleware para capturar erros não tratados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rejeitada não tratada:', {
    reason: reason,
    promise: promise,
    timestamp: new Date().toISOString()
  });
  // Não encerrar o processo, apenas logar
});

process.on('uncaughtException', (err) => {
  console.error('Exceção não capturada:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  // Não encerrar o processo, apenas logar
});

// Middleware para capturar erros de rotas assíncronas
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Aplicar asyncHandler a todas as rotas automaticamente
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    try {
      return originalSend.call(this, data);
    } catch (err) {
      console.error('Erro ao enviar resposta:', err);
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          error: 'Erro interno do servidor',
          code: 'RESPONSE_ERROR'
        });
      }
    }
  };
  next();
});

module.exports = app;
