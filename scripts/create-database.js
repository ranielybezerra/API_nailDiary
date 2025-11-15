/**
 * Script para criar o banco de dados
 * Execute: node scripts/create-database.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function createDatabase() {
  console.log('🔍 Verificando conexão e criando banco de dados...\n');
  
  // Conectar ao banco postgres (banco padrão) para criar o naildiary
  const postgresUrl = process.env.DATABASE_URL.replace(/\/[^\/]+(\?|$)/, '/postgres$1');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: postgresUrl,
      },
    },
  });

  try {
    // Tentar conectar ao postgres
    await prisma.$connect();
    console.log('✅ Conectado ao PostgreSQL\n');
    
    // Verificar se o banco já existe
    const databases = await prisma.$queryRaw`
      SELECT datname FROM pg_database WHERE datname = 'naildiary'
    `;
    
    if (databases.length > 0) {
      console.log('✅ Banco de dados "naildiary" já existe!\n');
      console.log('💡 Você pode executar:');
      console.log('   npm run db:push');
      console.log('   npm run db:seed');
    } else {
      // Criar o banco
      console.log('📦 Criando banco de dados "naildiary"...');
      await prisma.$executeRawUnsafe('CREATE DATABASE naildiary');
      console.log('✅ Banco de dados "naildiary" criado com sucesso!\n');
      console.log('💡 Próximos passos:');
      console.log('   npm run db:push');
      console.log('   npm run db:seed');
    }
    
  } catch (error) {
    console.error('\n❌ Erro ao criar banco de dados:\n');
    
    if (error.message.includes('already exists')) {
      console.log('✅ Banco de dados "naildiary" já existe!\n');
      console.log('💡 Você pode executar:');
      console.log('   npm run db:push');
      console.log('   npm run db:seed');
    } else if (error.message.includes('permission denied')) {
      console.error('🔐 Erro de permissão!');
      console.error('   O usuário não tem permissão para criar bancos de dados.');
      console.error('   Execute no PostgreSQL:');
      console.error('   ALTER USER admin CREATEDB;');
    } else {
      console.error('   Erro:', error.message);
      console.error('\n💡 Tente criar manualmente:');
      console.error('   Conecte ao PostgreSQL e execute:');
      console.error('   CREATE DATABASE naildiary;');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createDatabase();


