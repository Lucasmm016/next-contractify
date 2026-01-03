import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { contract } from '../src/core'
import { route } from '../src/server'

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
	POST: {
		body: z.object({ name: z.string() }),
		response: {
			success: z.object({ id: z.string() }),
		},
	},
})

describe('route()', () => {
	it('deve criar handler válido', () => {
		const handler = route(userContract.GET, async (req, res, args) => {
			return res.success({ id: args.params.id, name: 'Test' })
		})

		expect(typeof handler).toBe('function')
	})

	it('deve validar e parsear params', async () => {
		const handler = route(userContract.GET, async (req, res, args) => {
			return res.success({
				id: args.params.id,
				name: 'João Silva',
			})
		})

		const request = new NextRequest('http://localhost/api/users/123')
		const context = { params: { id: '123' } }

		const response = await handler(request, context)
		const data = await response.json()

		expect(data.id).toBe('123')
		expect(data.name).toBe('João Silva')
	})

	it('deve rejeitar params inválidos', async () => {
		const handler = route(userContract.GET, async (req, res, args) => {
			return res.success({
				id: args.params.id,
				name: 'Test',
			})
		})

		const request = new NextRequest('http://localhost/api/users/123')
		const context = { params: {} } // Falta 'id'

		const response = await handler(request, context)
		const data = await response.json()

		expect(response.status).toBe(400)
		expect(data.error).toBe('Invalid route params')
	})

	it('deve validar body em POST', async () => {
		const handler = route(userContract.POST, async (req, res) => {
			return res.success({ id: '123' })
		})

		const request = new NextRequest('http://localhost/api/users/123', {
			method: 'POST',
			body: JSON.stringify({ name: 'João' }),
		})
		const context = { params: { id: '123' } }

		const response = await handler(request, context)
		const data = await response.json()

		expect(response.status).toBe(200)
		expect(data.id).toBe('123')
	})

	it('deve rejeitar body inválido', async () => {
		const handler = route(userContract.POST, async (req, res) => {
			return res.success({ id: '123' })
		})

		const request = new NextRequest('http://localhost/api/users/123', {
			method: 'POST',
			body: JSON.stringify({}), // Falta 'name'
		})
		const context = { params: { id: '123' } }

		const response = await handler(request, context)
		const data = await response.json()

		expect(response.status).toBe(400)
		expect(data.error).toBe('Invalid body')
	})
})
