import type { Contract, ContractDefinition, Method } from './types';
/**
 * Cria um contrato de API fortemente tipado.
 *
 * @param path - O caminho da rota (ex: '/api/users/[id]')
 * @param definition - A definição dos métodos HTTP e seus schemas Zod
 */
export declare function contract<T extends ContractDefinition & {
    [K in Exclude<keyof T, Method>]: never;
}>(path: string, definition: T): Contract<T>;
//# sourceMappingURL=index.d.ts.map