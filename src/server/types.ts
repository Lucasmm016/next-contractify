import type { NextResponse } from 'next/server'
import type { InferErrorResponse, InferSuccessResponse, RouteDefinition } from '../core/types'

export type NextResponseInit = Parameters<typeof NextResponse.json>[1]

/**
 * Tipo utilitário para impor "Excess Property Check" recursivo.
 * Garante que o retorno não contenha propriedades não definidas no contrato.
 */
export type DeepStrict<T, Expected> = T extends Date
  ? T
  : T extends (infer U)[]
  ? Expected extends (infer V)[]
  ? DeepStrict<U, V>[]
  : never
  : T extends object
  ? Expected extends object
  ? // Verifica se há chaves em T que não existem em Expected
  Exclude<keyof T, keyof Expected> extends never
  ? {
    [K in keyof T]: K extends keyof Expected ? DeepStrict<T[K], Expected[K]> : never
  }
  : {
    [K in Exclude<
      keyof T,
      keyof Expected
    >]: `Error: Property '${K & string}' does not exist in contract`
  }
  : never
  : T

export type ResponseHelper<T extends RouteDefinition> = {
  success: <Data extends InferSuccessResponse<T>>(
    body: DeepStrict<Data, InferSuccessResponse<T>>,
    init?: NextResponseInit,
  ) => NextResponse<InferSuccessResponse<T>>

  error: <Data extends InferErrorResponse<T>>(
    body: DeepStrict<Data, InferErrorResponse<T>>,
    init?: NextResponseInit,
  ) => NextResponse<InferErrorResponse<T>>
}