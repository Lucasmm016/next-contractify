import { type AxiosResponse, type CreateAxiosDefaults } from 'axios';
import type { InferRequest, InferSuccessResponse } from '../core/types';
import type { ClientRoute, HasRequiredKeys, RequestOptions } from './types';
export declare function createApiClient(config?: CreateAxiosDefaults): <T extends ClientRoute>(route: T, ...args: HasRequiredKeys<InferRequest<T>> extends true ? [options: RequestOptions<T>] : [options?: RequestOptions<T>]) => Promise<AxiosResponse<InferSuccessResponse<T>>>;
//# sourceMappingURL=index.d.ts.map