import type { Contract, ContractDefinition, Method, RouteDefinition } from './types'

/**
 * Cria um contrato de API fortemente tipado.
 *
 * @param path - O caminho da rota (ex: '/api/users/[id]')
 * @param definition - A definição dos métodos HTTP e seus schemas Zod
 */
export function contract<
  T extends ContractDefinition & {
    [K in Exclude<keyof T, Method>]: never
  },
>(path: string, definition: T): Contract<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contract = {} as any

  for (const method in definition) {
    const routeDef = definition[method] as RouteDefinition

    contract[method] = {
      ...routeDef,
      path,
      method,
    }
  }

  return contract
}
