/**
 * Cria um contrato de API fortemente tipado.
 *
 * @param path - O caminho da rota (ex: '/api/users/[id]')
 * @param definition - A definição dos métodos HTTP e seus schemas Zod
 */
export function contract(path, definition) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contract = {};
    for (const method in definition) {
        const routeDef = definition[method];
        contract[method] = {
            ...routeDef,
            path,
            method,
        };
    }
    return contract;
}
//# sourceMappingURL=index.js.map