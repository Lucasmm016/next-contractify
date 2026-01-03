# next-contractify

> Type-safe contract-based API client para Next.js com validação Zod

Biblioteca que fornece contratos de API fortemente tipados entre cliente e servidor, garantindo type-safety end-to-end e validação em runtime com Zod.

## 📦 Instalação

```bash
npm install github:Lucasmm016/next-contractify
```

## ✨ Features

- ✅ **Type-safe completo** - Do cliente ao servidor
- ✅ **Validação automática** - Com Zod em runtime
- ✅ **IntelliSense perfeito** - Autocomplete em todos os níveis
- ✅ **Contratos compartilhados** - Uma única fonte de verdade
- ✅ **Erros tipados** - Tratamento de erros type-safe
- ✅ **Zero config** - Funciona out-of-the-box

## 🚀 Uso Rápido

### 1. Defina um contrato

```typescript
// contracts/user.ts
import { contract } from 'next-contractify'
import { z } from 'zod'

export const userContract = contract('/api/users/[id]', {
  GET: {
    params: z.object({
      id: z.string().uuid(),
    }),
    response: {
      success: z.object({
        id: z.string().uuid(),
        name: z.string(),
        email: z.string().email(),
      }),
    },
  },
  PUT: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: z.object({
      name: z.string().min(3),
      email: z.string().email(),
    }),
    response: {
      success: z.object({ success: z.boolean() }),
      error: z.object({ message: z.string() }),
    },
  },
})
```

### 2. Configure o client (uma vez)

```typescript
// lib/api.ts
import { createApiClient } from 'next-contractify/client'

export const api = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
})
```

### 3. Use no cliente

```typescript
// app/users/[id]/page.tsx
'use client'

import { api } from '@/lib/api'
import { userContract } from '@/contracts/user'

export default function UserPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Type-safe! IntelliSense completo
    api(userContract.GET, {
      params: { id: params.id },
    }).then(response => {
      setUser(response.data) // Tipado automaticamente!
    })
  }, [params.id])

  return <div>{user?.name}</div>
}
```

### 4. Use no servidor (Route Handler)

```typescript
// app/api/users/[id]/route.ts
import { route } from 'next-contractify/server'
import { userContract } from '@/contracts/user'
import { db } from '@/lib/db'

export const GET = route(userContract.GET, async (req, res, args) => {
  const userId = args.params.id // Tipado!

  const user = await db.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    return res.error(
      { message: 'Usuário não encontrado' },
      { status: 404 }
    )
  }

  // TypeScript valida que você está retornando o formato correto!
  return res.success({
    id: user.id,
    name: user.name,
    email: user.email,
  })
})

export const PUT = route(userContract.PUT, async (req, res, args) => {
  const { id } = args.params // Tipado!
  const { name, email } = args.body // Tipado!

  await db.user.update({
    where: { id },
    data: { name, email },
  })

  return res.success({ success: true })
})
```

## 📖 Exemplos Avançados

### Múltiplas APIs

```typescript
// lib/api.ts
import { createApiClient } from 'next-contractify/client'

// API principal
export const apiMain = createApiClient({
  baseURL: 'https://api.principal.com',
})

// API de pagamentos
export const apiPayments = createApiClient({
  baseURL: 'https://api.pagamentos.com',
  headers: {
    'X-API-Key': process.env.PAYMENTS_API_KEY,
  },
})
```

### Query Params

```typescript
const listContract = contract('/api/users', {
  GET: {
    query: z.object({
      page: z.coerce.number().positive().default(1),
      limit: z.coerce.number().positive().max(100).default(20),
      search: z.string().optional(),
    }),
    response: {
      success: z.object({
        users: z.array(z.object({
          id: z.string(),
          name: z.string(),
        })),
        total: z.number(),
      }),
    },
  },
})

// Uso
const response = await api(listContract.GET, {
  query: {
    page: 1,
    limit: 20,
    search: 'João',
  },
})
```

### Tratamento de Erros

```typescript
import axios from 'axios'

try {
  const response = await api(userContract.GET, {
    params: { id: '123' },
  })
  console.log(response.data)
} catch (error) {
  if (axios.isAxiosError(error)) {
    // Erro tipado se definido no contrato!
    console.error(error.response?.data.message)
  }
}
```

## 🔧 API Reference

### `contract(path, definition)`

Cria um contrato de API.

**Parâmetros:**
- `path` - Caminho da rota (ex: `/api/users/[id]`)
- `definition` - Objeto com métodos HTTP e seus schemas

**Retorna:** Contrato tipado

### `createApiClient(config)`

Cria um cliente HTTP configurado.

**Parâmetros:**
- `config` - Configuração do Axios (`baseURL`, `headers`, `timeout`, etc)

**Retorna:** Função `api` para fazer requisições

### `route(definition, handler)`

Cria um route handler Next.js type-safe.

**Parâmetros:**
- `definition` - Definição do contrato da rota
- `handler` - Função assíncrona `(req, res, args) => Promise<NextResponse>`

**Retorna:** Route handler Next.js

## 🤝 Peer Dependencies

- `next` >= 15
- `axios` >= 1.0.0
- `zod` >= 3.0.0

## 📝 License

MIT © Lucas Moreira de Matos

## 🐛 Issues

Encontrou um bug ou tem uma sugestão? Abra uma issue no GitHub!
