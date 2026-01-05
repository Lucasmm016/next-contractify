import { NextRequest, NextResponse } from 'next/server';
import type { InferRequest, InferResponse, RouteDefinition } from '../core/types';
import type { ResponseHelper } from './types';
/**
 * Cria um handler de rota Next.js type-safe baseado em um contrato Zod.
 *
 * @param definition - O contrato da rota
 * @param handler - Função assíncrona que recebe (request, response, args)
 */
export declare function route<T extends RouteDefinition>(definition: T, handler: (request: NextRequest, response: ResponseHelper<T>, args: InferRequest<T>) => Promise<NextResponse<InferResponse<T>>>): (request: NextRequest, context: {
    params?: Promise<Record<string, string>> | Record<string, string>;
}) => Promise<any>;
//# sourceMappingURL=index.d.ts.map