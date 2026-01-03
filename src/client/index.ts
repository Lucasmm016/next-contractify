import axios, { type AxiosResponse, type CreateAxiosDefaults } from 'axios'

import { createAxiosInstance } from '../axios'
import type { InferRequest, InferSuccessResponse } from '../core/types'

import type { ClientRoute, HasRequiredKeys, RequestOptions } from './types'

export function createApiClient(config?: CreateAxiosDefaults) {
	const axiosInstance = createAxiosInstance(config)

	async function api<T extends ClientRoute>(
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
			const response = await axiosInstance.request({
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

	return api
}
