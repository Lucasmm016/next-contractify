import { NextRequest, NextResponse } from 'next/server';
function searchParamsToObject(searchParams) {
    const result = {};
    for (const [key, value] of searchParams.entries()) {
        if (result[key]) {
            if (Array.isArray(result[key])) {
                ;
                result[key].push(value);
            }
            else {
                result[key] = [result[key], value];
            }
        }
        else {
            result[key] = value;
        }
    }
    return result;
}
/**
 * Cria um handler de rota Next.js type-safe baseado em um contrato Zod.
 *
 * @param definition - O contrato da rota
 * @param handler - Função assíncrona que recebe (request, response, args)
 */
export function route(definition, handler) {
    return async (request, context) => {
        const args = {};
        // Validação de Query Params
        if (definition.query) {
            const queryObj = searchParamsToObject(request.nextUrl.searchParams);
            const parsed = definition.query.safeParse(queryObj);
            if (!parsed.success) {
                return NextResponse.json({ error: 'Invalid query params', details: parsed.error.format() }, { status: 400 });
            }
            // @ts-expect-error - Validado pelo Zod
            args.query = parsed.data;
        }
        // Validação de Body
        if (definition.body) {
            try {
                const json = await request.json();
                const parsed = definition.body.safeParse(json);
                if (!parsed.success) {
                    return NextResponse.json({ error: 'Invalid body', details: parsed.error.format() }, { status: 400 });
                }
                // @ts-expect-error - Validado pelo Zod
                args.body = parsed.data;
            }
            catch {
                return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
            }
        }
        // Validação de Route Params
        if (definition.params) {
            const rawParams = await (context.params instanceof Promise ? context.params : context.params);
            const parsed = definition.params.safeParse(rawParams);
            if (!parsed.success) {
                return NextResponse.json({ error: 'Invalid route params', details: parsed.error.format() }, { status: 400 });
            }
            // @ts-expect-error - Validado pelo Zod
            args.params = parsed.data;
        }
        const response = {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            success: (body, init) => NextResponse.json(body, init),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            error: (body, init) => NextResponse.json(body, init),
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return handler(request, response, args);
    };
}
//# sourceMappingURL=index.js.map