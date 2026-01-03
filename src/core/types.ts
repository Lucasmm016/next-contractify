import { z } from 'zod'

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export type RouteDefinition = {
  query?: z.ZodType
  body?: z.ZodType
  params?: z.ZodType
  headers?: z.ZodType
  response:
  | {
    success: z.ZodType
    error?: z.ZodType
  }
  | {
    success?: z.ZodType
    error: z.ZodType
  }
}

export type ContractDefinition = Partial<Record<Method, RouteDefinition>>

export type Contract<T extends ContractDefinition> = {
  [K in keyof T]: T[K] & {
    path: string
    method: K
  }
}

// --- Tipos de Inferência ---

export type InferRequest<T extends RouteDefinition> = (T['query'] extends z.ZodType
  ? { query: z.infer<T['query']> }
  : unknown) &
  (T['body'] extends z.ZodType ? { body: z.infer<T['body']> } : unknown) &
  (T['params'] extends z.ZodType ? { params: z.infer<T['params']> } : unknown)

export type InferSuccessResponse<T extends RouteDefinition> = T['response'] extends {
  success: z.ZodType
}
  ? z.infer<T['response']['success']>
  : unknown

export type InferErrorResponse<T extends RouteDefinition> = T['response'] extends {
  error: z.ZodType
}
  ? z.infer<T['response']['error']>
  : unknown

export type InferResponse<T extends RouteDefinition> =
  | InferSuccessResponse<T>
  | InferErrorResponse<T>
