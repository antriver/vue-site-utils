import config from '@/config';

export class AbstractApi {
    /**
     * @param {?string} [authToken]
     */
    constructor(authToken) {
        /**
         * @type {?string}
         */
        this.authToken = null;
        if (authToken) {
            this.setAuthToken(authToken);
        }

        this.url = config.apiUrl;

        this.cache = {};
    }

    setAuthToken(authToken) {
        this.authToken = authToken || null;
    }

    createUrl(endpoint) {
        return `${this.url}/${endpoint}`;
    }

    get(endpoint, params, success, error, complete, cache) {
        return this.request('GET', endpoint, params, success, error, complete, cache);
    }

    post(endpoint, params, success, error, complete) {
        return this.request('POST', endpoint, params, success, error, complete);
    }

    patch(endpoint, params, success, error, complete) {
        return this.request('PATCH', endpoint, params, success, error, complete);
    }

    delete(endpoint, params, success, error, complete) {
        return this.request('DELETE', endpoint, params, success, error, complete);
    }

    //
    // Make a request to the API.
    // Returns a Promise, but the success/error/complete callbacks which are equivalent
    // can be supplied for backward compatibility.
    //
    // @param {String} method
    // @param {String} endpoint
    // @param {object} [params]
    // @param {Function} [success]
    // @param {Function} [error]
    // @param {Function} [complete]
    // @param {boolean} [cache]
    // @param endpoint
    // @param params
    // @param success
    // @param error
    // @param complete
    // @param cache
    // @return {Promise}
    //
    request(method, endpoint, params, success, error, complete, cache) {
    }
}
