# Configuração do Supabase - Passo a Passo

## 🔑 Obter a Connection String Correta

O Supabase oferece diferentes tipos de connection strings. Para aplicações Node.js/Prisma, você precisa:

### 1. Acesse o Dashboard do Supabase
- Vá para: https://app.supabase.com
- Selecione seu projeto

### 2. Obter Connection String
- Vá em **Settings** → **Database**
- Role até a seção **Connection string**
- Você verá várias opções:

#### Opção A: Direct Connection (Recomendado para desenvolvimento local)
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```
**Nota:** Pode precisar adicionar seu IP na whitelist em **Settings** → **Database** → **Network Restrictions**

#### Opção B: Connection Pooler (Recomendado para produção)
- Vá em **Settings** → **Database** → **Connection Pooling**
- Copie a string de **Session mode** ou **Transaction mode**
- Formato geral:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### 3. Configurar o .env

1. Copie a connection string do Supabase
2. **IMPORTANTE:** Se a senha contém caracteres especiais (`/`, `#`, `%`), você precisa codificá-los em URL:
   - `/` → `%2F`
   - `#` → `%23`
   - `%` → `%25`
   - `@` → `%40`
   - `:` → `%3A`

3. Cole no arquivo `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:s%2FE7qn%23A7%25qnfrL@db.nymharsizolizxpheyjv.supabase.co:5432/postgres?sslmode=require"
```

### 4. Liberar IP (se necessário)

Se estiver usando Direct Connection e receber erro "Can't reach database server":

1. No Dashboard do Supabase: **Settings** → **Database**
2. Na seção **Network Restrictions** ou **IP Allowlist**
3. Adicione seu IP atual ou habilite "Allow all IPs" temporariamente
4. Salve as alterações

### 5. Testar Conexão

```bash
cd backend
node scripts/test-db-connection.js
```

### 6. Aplicar Schema

Após a conexão funcionar:

```bash
# Gerar Prisma Client
npx prisma generate

# Aplicar schema ao banco
npx prisma db push

# Ou executar migrations
npx prisma migrate deploy
```

## 🔍 Troubleshooting

### Erro: "Can't reach database server"
- ✅ Verifique se o IP está na whitelist do Supabase
- ✅ Tente usar Connection Pooler (porta 6543)
- ✅ Verifique firewall/antivírus local

### Erro: "Tenant or user not found"
- ✅ Verifique o formato do usuário (deve ser `postgres` ou `postgres.[PROJECT-REF]`)
- ✅ Confirme que está usando a connection string correta do dashboard

### Erro: "Authentication failed"
- ✅ Verifique se a senha está correta
- ✅ Verifique se a senha está codificada em URL se tiver caracteres especiais
- ✅ Tente resetar a senha no Supabase

### Erro: "SSL required"
- ✅ Adicione `?sslmode=require` na connection string
- ✅ Ou use `?sslmode=prefer`

## 📝 Exemplo Completo

Connection string do Supabase:
```
postgresql://postgres:s/E7qn#A7%qnfrL@db.nymharsizolizxpheyjv.supabase.co:5432/postgres
```

No `.env` (com senha codificada):
```env
DATABASE_URL="postgresql://postgres:s%2FE7qn%23A7%25qnfrL@db.nymharsizolizxpheyjv.supabase.co:5432/postgres?sslmode=require"
```

## 🆘 Ainda com Problemas?

1. Verifique os logs do Supabase no dashboard
2. Confirme que o projeto está ativo e não pausado
3. Verifique se há quotas ou limites atingidos
4. Tente usar uma ferramenta gráfica (pgAdmin, DBeaver) para testar a conexão primeiro

