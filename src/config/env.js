require('dotenv').config();

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'PORT'
];

// Verificar se todas as variáveis de ambiente obrigatórias estão definidas
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`⚠️  Variável de ambiente não encontrada: ${envVar}. Usando valor padrão.`);
  }
}

const config = {
  database: {
    url: process.env.DATABASE_URL || 'postgresql://usuario:senha@localhost:5432/naildiary?schema=public',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'jwt_secret_padrao_para_desenvolvimento',
    expiresIn: '24h',
  },
  server: {
    port: parseInt(process.env.PORT, 10) || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
};

module.exports = config;
