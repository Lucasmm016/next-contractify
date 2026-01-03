import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { contract } from '../src/core'

describe('contract()', () => {
	it('deve criar um contrato com GET', () => {
		const userContract = contract('/api/users/[id]', {
			GET: {
				params: z.object({ id: z.string() }),
				response: {
					success: z.object({
						id: z.string(),
						name: z.string(),
					}),
				},
			},
		})

		expect(userContract.GET).toBeDefined()
		expect(userContract.GET.path).toBe('/api/users/[id]')
		expect(userContract.GET.method).toBe('GET')
		expect(userContract.GET.params).toBeDefined()
	})

	it('deve criar um contrato com múltiplos métodos', () => {
		const userContract = contract('/api/users', {
			GET: {
				response: {
					success: z.array(z.object({ id: z.string() })),
				},
			},
			POST: {
				body: z.object({ name: z.string() }),
				response: {
					success: z.object({ id: z.string() }),
				},
			},
		})

		expect(userContract.GET).toBeDefined()
		expect(userContract.POST).toBeDefined()
		expect(userContract.GET.method).toBe('GET')
		expect(userContract.POST.method).toBe('POST')
	})

	it('deve inferir tipos corretamente', () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const userContract = contract('/api/users/[id]', {
			GET: {
				params: z.object({ id: z.string() }),
				response: {
					success: z.object({
						id: z.string(),
						name: z.string(),
					}),
				},
			},
		})

		// Teste de tipos (se compilar, está correto)
		type Params = typeof userContract.GET.params extends z.ZodType
			? z.infer<typeof userContract.GET.params>
			: never

		const params: Params = { id: '123' }
		expect(params.id).toBe('123')
	})
})
