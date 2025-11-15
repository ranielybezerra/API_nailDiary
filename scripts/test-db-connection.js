/**
 * Script para testar conexão com o banco de dados
 * Execute: node scripts/test-db-connection.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  console.log('🔍 Testando conexão com o banco de dados...\n');
  
  try {
    // Tentar conectar
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!\n');
    
    // Testar uma query simples
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query de teste executada com sucesso!');
    console.log('   Resultado:', result);
    
    // Verificar se o banco existe e tem as tabelas
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('\n📊 Tabelas encontradas no banco:');
    if (tables.length === 0) {
      console.log('   ⚠️  Nenhuma tabela encontrada. Execute: npm run db:push');
    } else {
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }
    
    console.log('\n✅ Teste de conexão concluído com sucesso!');
    console.log('💡 Você pode executar: npm run db:seed');
    
  } catch (error) {
    console.error('\n❌ Erro ao conectar com o banco de dados:\n');
    
    if (error.message.includes('Authentication failed')) {
      console.error('🔐 Erro de autenticação!');
      console.error('   Verifique as credenciais no arquivo .env');
      console.error('   Formato: DATABASE_URL="postgresql://usuario:senha@localhost:5432/naildiary?schema=public"');
    } else if (error.message.includes('does not exist')) {
      console.error('📦 Banco de dados não existe!');
      console.error('   Crie o banco com: CREATE DATABASE naildiary;');
    } else if (error.message.includes('Connection')) {
      console.error('🔌 Erro de conexão!');
      console.error('   Verifique se o PostgreSQL está rodando:');
      console.error('   sudo systemctl status postgresql');
    } else {
      console.error('   Erro:', error.message);
    }
    
    console.error('\n📖 Consulte o arquivo README_DATABASE.md para mais informações.');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();


