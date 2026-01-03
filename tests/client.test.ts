import axios from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { createApiClient } from '../src/client'
import { ApiError } from '../src/client/types'
import { contract } from '../src/core'

// Mock do axios
vi.mock('axios')

// Cria contrato de teste
const userContract = contract('/api/users/[id]', {
	GET: {
		params: z.object({ id: z.string() }),
		response: {
			success: z.object({
				id: z.string(),
				name: z.string(),
				email: z.string().email(),
			}),
		},
	},
	POST: {
		body: z.object({ name: z.string(), email: z.string() }),
		response: {
			success: z.object({ id: z.string() }),
			error: z.object({ message: z.string() }),
		},
	},
})

describe('createApiClient()', () => {
	// Mock da instância do axios
	const mockAxiosInstance = {
		request: vi.fn(),
	}

	beforeEach(() => {
		vi.clearAllMocks()
		// Configura o mock do axios.create para retornar nossa instância mockada
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any)
	})

	it('deve criar client com configuração customizada', () => {
		const api = createApiClient({
			baseURL: 'https://api.test.com',
			timeout: 5000,
		})

		expect(api).toBeDefined()
		expect(typeof api).toBe('function')
		expect(axios.create).toHaveBeenCalledWith({
			headers: {
				'Content-Type': 'application/json',
			},
			baseURL: 'https://api.test.com',
			timeout: 5000,
		})
	})

	it('deve fazer requisição GET com sucesso', async () => {
		const api = createApiClient({
			baseURL: 'https://api.test.com',
		})

		// Mock da resposta
		mockAxiosInstance.request.mockResolvedValueOnce({
			data: {
				id: '123',
				name: 'João Silva',
				email: 'joao@test.com',
			},
			status: 200,
			statusText: 'OK',
			headers: {},
			config: {},
		})

		const response = await api(userContract.GET, {
			params: { id: '123' },
		})

		expect(response.data.id).toBe('123')
		expect(response.data.name).toBe('João Silva')
		expect(response.data.email).toBe('joao@test.com')
		expect(mockAxiosInstance.request).toHaveBeenCalledWith(
			expect.objectContaining({
				url: '/api/users/123',
				method: 'GET',
			}),
		)
	})

	it('deve substituir params dinâmicos na URL', async () => {
		const api = createApiClient({
			baseURL: 'https://api.test.com',
		})

		mockAxiosInstance.request.mockResolvedValueOnce({
			data: {
				id: '456',
				name: 'Maria',
				email: 'maria@test.com',
			},
			status: 200,
			statusText: 'OK',
			headers: {},
			config: {},
		})

		await api(userContract.GET, {
			params: { id: '456' },
		})

		// Verifica se a URL foi substituída corretamente
		expect(mockAxiosInstance.request).toHaveBeenCalledWith(
			expect.objectContaining({
				url: '/api/users/456',
				method: 'GET',
			}),
		)
	})

	it('deve validar resposta de sucesso com Zod', async () => {
		const api = createApiClient({
			baseURL: 'https://api.test.com',
		})

		mockAxiosInstance.request.mockResolvedValueOnce({
			data: {
				id: '123',
				name: 'João',
				email: 'joao@test.com',
			},
			status: 200,
			statusText: 'OK',
			headers: {},
			config: {},
		})

		const response = await api(userContract.GET, {
			params: { id: '123' },
		})

		// Se passou pela validação Zod, dados estão corretos
		expect(response.data).toMatchObject({
			id: expect.any(String),
			name: expect.any(String),
			email: expect.any(String),
		})
	})

	it('deve rejeitar resposta inválida', async () => {
		const api = createApiClient({
			baseURL: 'https://api.test.com',
		})

		mockAxiosInstance.request.mockResolvedValueOnce({
			data: {
				id: '123',
				name: 'João',
				// email faltando - inválido!
			},
			status: 200,
			statusText: 'OK',
			headers: {},
			config: {},
		})

		await expect(
			api(userContract.GET, {
				params: { id: '123' },
			}),
		).rejects.toThrow()
	})

	it('deve passar query params corretamente', async () => {
		const listContract = contract('/api/users', {
			GET: {
				query: z.object({ page: z.number(), limit: z.number() }),
				response: {
					success: z.array(z.object({ id: z.string() })),
				},
			},
		})

		const api = createApiClient({
			baseURL: 'https://api.test.com',
		})

		mockAxiosInstance.request.mockResolvedValueOnce({
			data: [{ id: '1' }],
			status: 200,
			statusText: 'OK',
			headers: {},
			config: {},
		})

		await api(listContract.GET, {
			query: { page: 1, limit: 10 },
		})

		expect(mockAxiosInstance.request).toHaveBeenCalledWith(
			expect.objectContaining({
				url: '/api/users',
				method: 'GET',
				params: { page: 1, limit: 10 },
			}),
		)
	})

	it('deve passar body em requisições POST', async () => {
		const api = createApiClient({
			baseURL: 'https://api.test.com',
		})

		mockAxiosInstance.request.mockResolvedValueOnce({
			data: { id: '789' },
			status: 201,
			statusText: 'Created',
			headers: {},
			config: {},
		})

		await api(userContract.POST, {
			body: { name: 'Pedro', email: 'pedro@test.com' },
		})

		expect(mockAxiosInstance.request).toHaveBeenCalledWith(
			expect.objectContaining({
				url: '/api/users/[id]',
				method: 'POST',
				data: { name: 'Pedro', email: 'pedro@test.com' },
			}),
		)
	})

	it('deve passar headers customizados', async () => {
		const api = createApiClient({
			baseURL: 'https://api.test.com',
		})

		mockAxiosInstance.request.mockResolvedValueOnce({
			data: {
				id: '123',
				name: 'João',
				email: 'joao@test.com',
			},
			status: 200,
			statusText: 'OK',
			headers: {},
			config: {},
		})

		await api(userContract.GET, {
			params: { id: '123' },
			headers: {
				Authorization: 'Bearer token123',
				'X-Custom': 'valor',
			},
		})

		expect(mockAxiosInstance.request).toHaveBeenCalledWith(
			expect.objectContaining({
				headers: {
					Authorization: 'Bearer token123',
					'X-Custom': 'valor',
				},
			}),
		)
	})

	it('deve lidar com erros de requisição', async () => {
		const api = createApiClient({
			baseURL: 'https://api.test.com',
		})

		const error = {
			isAxiosError: true,
			response: {
				data: { message: 'Erro do servidor' },
				status: 500,
			},
		}

		mockAxiosInstance.request.mockRejectedValueOnce(error)

		await expect(
			api(userContract.GET, {
				params: { id: '123' },
			}),
		).rejects.toMatchObject({
			response: {
				status: 500,
			},
		})
	})

	it('deve parsear erros definidos no contrato', async () => {
		const api = createApiClient({
			baseURL: 'https://api.test.com',
		})

		const axiosError = {
			isAxiosError: true,
			response: {
				data: { message: 'Email já existe' },
				status: 400,
			},
		}

		// Mock do axios.isAxiosError
		vi.mocked(axios.isAxiosError).mockReturnValue(true)

		mockAxiosInstance.request.mockRejectedValueOnce(axiosError)

		try {
			await api(userContract.POST, {
				body: { name: 'João', email: 'joao@test.com' },
			})
		} catch (err) {
			const error = err as ApiError<typeof userContract.POST>
			expect(error.response?.data).toEqual({ message: 'Email já existe' })
		}
	})

	it('deve substituir múltiplos params na URL', async () => {
		const multiParamContract = contract('/api/users/[userId]/posts/[postId]', {
			GET: {
				params: z.object({
					userId: z.string(),
					postId: z.string(),
				}),
				response: {
					success: z.object({ id: z.string() }),
				},
			},
		})

		const api = createApiClient({
			baseURL: 'https://api.test.com',
		})

		mockAxiosInstance.request.mockResolvedValueOnce({
			data: { id: 'post-1' },
			status: 200,
			statusText: 'OK',
			headers: {},
			config: {},
		})

		await api(multiParamContract.GET, {
			params: { userId: 'user-123', postId: 'post-456' },
		})

		expect(mockAxiosInstance.request).toHaveBeenCalledWith(
			expect.objectContaining({
				url: '/api/users/user-123/posts/post-456',
			}),
		)
	})
})
