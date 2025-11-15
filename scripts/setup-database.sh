#!/bin/bash

# Script para configurar o banco de dados PostgreSQL

echo "🔧 Configuração do Banco de Dados PostgreSQL"
echo "=============================================="
echo ""

# Verificar se o PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL não está instalado!"
    echo "   Instale com: sudo apt-get install postgresql postgresql-contrib"
    exit 1
fi

echo "✅ PostgreSQL encontrado"
echo ""

# Verificar se o PostgreSQL está rodando
if ! sudo systemctl is-active --quiet postgresql; then
    echo "⚠️  PostgreSQL não está rodando. Tentando iniciar..."
    sudo systemctl start postgresql
    sleep 2
fi

if sudo systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL está rodando"
else
    echo "❌ Não foi possível iniciar o PostgreSQL"
    exit 1
fi

echo ""
echo "📋 Informações necessárias para configurar o banco:"
echo ""

# Solicitar informações
read -p "Digite o usuário do PostgreSQL (padrão: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -sp "Digite a senha do PostgreSQL: " DB_PASS
echo ""

read -p "Digite o nome do banco de dados (padrão: naildiary): " DB_NAME
DB_NAME=${DB_NAME:-naildiary}

read -p "Digite o host (padrão: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Digite a porta (padrão: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

echo ""
echo "🔍 Testando conexão..."

# Tentar conectar
export PGPASSWORD="$DB_PASS"
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "\q" 2>/dev/null; then
    echo "✅ Conexão bem-sucedida!"
    
    # Verificar se o banco existe
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        echo "✅ Banco de dados '$DB_NAME' já existe"
    else
        echo "📦 Criando banco de dados '$DB_NAME'..."
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "✅ Banco de dados '$DB_NAME' criado com sucesso!"
        else
            echo "❌ Erro ao criar banco de dados"
            exit 1
        fi
    fi
    
    # Criar arquivo .env com as credenciais
    echo ""
    echo "📝 Criando/atualizando arquivo .env..."
    
    DATABASE_URL="postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME?schema=public"
    
    # Se o .env já existe, atualizar apenas a DATABASE_URL
    if [ -f .env ]; then
        if grep -q "DATABASE_URL" .env; then
            # Substituir a linha existente
            sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"$DATABASE_URL\"|" .env
            echo "✅ Arquivo .env atualizado"
        else
            # Adicionar no final
            echo "DATABASE_URL=\"$DATABASE_URL\"" >> .env
            echo "✅ DATABASE_URL adicionado ao .env"
        fi
    else
        # Criar novo arquivo .env
        cat > .env << EOF
# Configurações do Banco de Dados
DATABASE_URL="$DATABASE_URL"

# Configurações JWT
JWT_SECRET="seu_jwt_secret_super_seguro_aqui_$(openssl rand -hex 32)"

# Configurações do Servidor
PORT=3001
NODE_ENV=development

# Configurações CORS
FRONTEND_URL="http://localhost:5173"
EOF
        echo "✅ Arquivo .env criado"
    fi
    
    echo ""
    echo "🎉 Configuração concluída!"
    echo ""
    echo "📋 Próximos passos:"
    echo "   1. Execute: npm run db:push"
    echo "   2. Execute: npm run db:seed"
    echo ""
    
else
    echo "❌ Erro de autenticação!"
    echo ""
    echo "💡 Possíveis soluções:"
    echo "   1. Verifique se o usuário e senha estão corretos"
    echo "   2. Verifique se o PostgreSQL aceita conexões locais"
    echo "   3. Tente criar um novo usuário:"
    echo "      sudo -u postgres psql"
    echo "      CREATE USER seu_usuario WITH PASSWORD 'sua_senha';"
    echo "      ALTER USER seu_usuario CREATEDB;"
    exit 1
fi

unset PGPASSWORD


