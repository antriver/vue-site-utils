import LRUCache from 'lru-cache';
import { TokenStoreInterface } from '../../token-stores/TokenStoreInterface';
import { ApiRequestOptions } from './ApiRequestOptions';

export abstract class AbstractApi {
    protected authTokenStore: TokenStoreInterface;

    protected readonly url: string;

    protected headers: any = {};

    protected cache?: LRUCache<string, any>;

    protected constructor(
        apiUrl: string,
        authTokenStore: TokenStoreInterface
    ) {
        this.url = apiUrl;
        this.authTokenStore = authTokenStore;
    }

    createUrl(endpoint: string): string {
        return `${this.url}/${endpoint}`;
    }

    get(endpoint: string, params?: object, options?: ApiRequestOptions): Promise<any> {
        return this.request('GET', endpoint, params, options);
    }

    post(endpoint: string, data: object, options?: ApiRequestOptions): Promise<any> {
        return this.request('POST', endpoint, data, options);
    }

    patch(endpoint: string, data: object, options?: ApiRequestOptions): Promise<any> {
        return this.request('PATCH', endpoint, data, options);
    }

    delete(endpoint: string, data: object, options?: ApiRequestOptions): Promise<any> {
        return this.request('DELETE', endpoint, data, options);
    }

    /**
     * Make a request to the API.
     *
     * @param {String} method
     * @param {String} endpoint
     * @param {object} [data]
     * @param {ApiRequestOptions} [options]
     *
     * @return {Promise}
     */
    abstract request(method: string, endpoint: string, data?: object, options?: ApiRequestOptions): Promise<any>;
}
