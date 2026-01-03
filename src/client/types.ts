import type { AxiosError, AxiosRequestConfig } from 'axios'
import type { InferErrorResponse, InferRequest, Method, RouteDefinition } from '../core/types'

export type ClientRoute = RouteDefinition & {
  path: string
  method: Method
}

export type CommonOptions = {
  headers?: Record<string, string>
  config?: Omit<AxiosRequestConfig, 'params' | 'data' | 'headers'>
}

export type RequestOptions<T extends ClientRoute> = InferRequest<T> & CommonOptions

export type HasRequiredKeys<T> = Partial<T> extends T ? false : true

export type ApiError<T extends RouteDefinition> = AxiosError<InferErrorResponse<T>>