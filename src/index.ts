/**
 * next-contractify
 * Type-safe API contracts for Next.js with Zod validation
 *
 * @module next-contractify
 */

// Core exports (usado tanto no client quanto no server)
export { contract } from './core'
export type {
	Contract,
	ContractDefinition,
	InferErrorResponse,
	InferRequest,
	InferResponse,
	InferSuccessResponse,
	Method,
	RouteDefinition,
} from './core/types'

// Para usar server: import { route } from 'next-contractify/server'
// Para usar client: import { createApiClient } from 'next-contractify/client'
