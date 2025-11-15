# Configuração de Conexão com Supabase

## ✅ Arquivo .env Configurado

O arquivo `.env` já está configurado com a conexão do Supabase:

```env
DATABASE_URL="postgresql://postgres:s%2FE7qn%23A7%25qnfrL@db.nymharsizolizxpheyjv.supabase.co:5432/postgres?sslmode=prefer"
```

**Nota:** A senha foi codificada em URL para caracteres especiais:
- `/` → `%2F`
- `#` → `%23`
- `%` → `%25`

## ❌ Problema: "Can't reach database server"

Se você está recebendo este erro, pode ser devido a:

### 1. **IP não autorizado no Supabase**

O Supabase pode estar bloqueando conexões do seu IP. Para resolver:

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Vá em **Settings** → **Database**
3. Na seção **Connection Pooling** ou **Network Restrictions**
4. Adicione seu IP atual à whitelist
5. Ou habilite "Allow all IPs" temporariamente para testes

### 2. **Usar Connection Pooler (Recomendado)**

O Supabase oferece uma connection string diferente para pooling que pode funcionar melhor:

1. No Dashboard do Supabase, vá em **Settings** → **Database**
2. Copie a **Connection String** da seção **Connection Pooling**
3. Use essa string no `.env` ao invés da connection string direta

Formato geral:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### 3. **Verificar Firewall/Antivírus**

- Verifique se seu firewall ou antivírus está bloqueando conexões na porta 5432
- Tente desabilitar temporariamente para testar

### 4. **Testar Conexão Manualmente**

Você pode testar a conexão usando o `psql`:

```bash
psql "postgresql://postgres:s/E7qn#A7%qnfrL@db.nymharsizolizxpheyjv.supabase.co:5432/postgres?sslmode=require"
```

Ou usando uma ferramenta gráfica como:
- **pgAdmin**
- **DBeaver**
- **TablePlus**

### 5. **Alternativas de SSL Mode**

Se `sslmode=prefer` não funcionar, tente:

- `sslmode=require` (mais seguro, obrigatório)
- `sslmode=allow` (tenta SSL, mas permite sem)
- Sem parâmetro SSL (não recomendado para Supabase)

## 🔧 Comandos Úteis

Após resolver o problema de conexão:

```bash
# Gerar Prisma Client
cd backend
npx prisma generate

# Aplicar schema ao banco
npx prisma db push

# Testar conexão
node scripts/test-db-connection.js

# Executar migrations (se houver)
npx prisma migrate deploy
```

## 📝 Notas Importantes

- A senha no `.env` está codificada em URL para caracteres especiais
- O Supabase geralmente requer SSL (`sslmode=require` ou `prefer`)
- Certifique-se de que o banco de dados está ativo no Supabase
- Verifique se não há limites de conexão no seu plano do Supabase

## 🆘 Ainda com Problemas?

1. Verifique os logs do Supabase no dashboard
2. Confirme que o projeto está ativo
3. Verifique se há quotas ou limites atingidos
4. Entre em contato com o suporte do Supabase se necessário

