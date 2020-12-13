import LRUCache from 'lru-cache';
import { TokenStoreInterface } from '../../token-stores/TokenStoreInterface';

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

    get(endpoint: string, params?: object, cache?: boolean): Promise<any> {
        return this.request('GET', endpoint, params, cache);
    }

    post(endpoint: string, params: object): Promise<any> {
        return this.request('POST', endpoint, params);
    }

    patch(endpoint: string, params: object): Promise<any> {
        return this.request('PATCH', endpoint, params);
    }

    delete(endpoint: string, params: object): Promise<any> {
        return this.request('DELETE', endpoint, params);
    }

    /**
     * Make a request to the API.
     *
     * @param {String} method
     * @param {String} endpoint
     * @param {object} [data]
     * @param {boolean} [cache]
     * @param {object} [headers]
     *
     * @return {Promise}
     */
    abstract request(method: string, endpoint: string, data?: object, cache?: boolean, headers?: object): Promise<any>;
}
