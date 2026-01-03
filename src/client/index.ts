import type { ClientRoute, HasRequiredKeys, RequestOptions } from './types'
import axios, { type AxiosResponse } from 'axios'
import { apiAxios } from '../axios'
import type {
  InferRequest,
  InferSuccessResponse,
} from '../core/types'

/**
 * Realiza chamadas de API type-safe baseadas no contrato.
 *
 * @param route - O contrato da rota (ex: contract.GET)
 * @param options - Argumentos (query, body, params)
 */
export async function api<T extends ClientRoute>(
  route: T,
  ...args: HasRequiredKeys<InferRequest<T>> extends true
    ? [options: RequestOptions<T>]
    : [options?: RequestOptions<T>]
): Promise<AxiosResponse<InferSuccessResponse<T>>> {
  const [options = {}] = args
  let url = route.path

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { params, query, body, headers, config } = options as any

  if (params) {
    for (const key in params) {
      url = url.replaceAll(`[${key}]`, String(params[key]))
    }
  }

  try {
    const response = await apiAxios.request({
      ...config,
      url,
      method: route.method,
      params: query,
      data: body,
      headers: {
        ...config?.headers,
        ...headers,
      },
    })

    // Parse automático de sucesso
    if (route.response && 'success' in route.response && route.response.success) {
      response.data = route.response.success.parse(response.data)
    }

    return response
  } catch (error) {
    // Tenta parsear o erro se o contrato definir
    if (axios.isAxiosError(error) && error.response && route.response) {
      if ('error' in route.response && route.response.error) {
        try {
          error.response.data = route.response.error.parse(error.response.data)
        } catch {
          // Falha no parse do erro é ignorada
        }
      }
    }
    throw error
  }
}
