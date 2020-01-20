import LRUCache from 'lru-cache';

export abstract class AbstractApi {
    protected authToken: string|null;

    protected readonly url: string;

    protected headers: any = {};

    protected cache?: LRUCache<string, any>;

    protected constructor(apiUrl: string, authToken: string|null) {
        /**
         * @type {?string}
         */
        this.authToken = null;
        if (authToken) {
            this.setAuthToken(authToken);
        }

        this.url = apiUrl;
    }

    setAuthToken(authToken: string|null): void {
        this.authToken = authToken || null;
    }

    createUrl(endpoint: string): string {
        return `${this.url}/${endpoint}`;
    }

    get(endpoint: string, params: object, cache: boolean): Promise<any> {
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
     *
     * @return {Promise}
     */
    abstract request(method: string, endpoint: string, data: object, cache?: boolean): Promise<any>;
}