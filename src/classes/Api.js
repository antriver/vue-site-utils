import axios from 'axios';
import qs from 'qs';
import cloneDeep from 'lodash/cloneDeep';
import { AbstractApi } from './AbstractApi';
import { showAlert } from '../util/dialogs';

/**
 * @param {string} message
 * @param {object} [response]
 * @param {{method: string, url: string, params: object, headers: object}} [request]
 */
export function ApiError(message, response, request) {
    /**
     * @type {string}
     */
    this.message = message;
    // if (request) {
    //     this.message += ' ' + request.method + ' ' + request.url;
    // }

    this.name = 'ApiError';

    /**
     * @type {?Object}
     */
    this.response = response;

    /**
     * @type {?{method: string, url: string, params: Object, headers: Object}}
     */
    this.request = request;

    this.stack = (new Error(this.message)).stack;
}

ApiError.prototype = Object.create(Error.prototype);
ApiError.prototype.constructor = ApiError;

/**
 * @param {ApiError} err
 */
const logApiError = (err) => {
    /* global Raven */
    if (typeof Raven !== 'undefined') {
        const responseStatus = err.response ? parseInt(err.response.status) : null;
        if (responseStatus === 403) {
            return;
        }
        if (err.message === 'Network Error') {
            return;
        }
        Raven.captureException(
            err,
            {
                level: 'error',
                extra: {
                    method: err.request.method,
                    url: err.request.url,
                    params: err.request.params,
                    headers: err.request.headers,
                    response: err.response
                }
            }
        );
    }
};

export class Api extends AbstractApi {
    /**
     * @param {?string} [authToken]
     * @param {string} url
     * @param {object} [headers]
     * @param {LRUCache} [cache]
     */
    constructor(authToken, url, headers, cache) {
        super(authToken);
        this.url = url;
        this.headers = headers;
        this.cache = cache;

        this.axios = axios.create();
    }

    /**
     * @param {String} method
     * @param {String} endpoint
     * @param {object} [data]
     * @param {Function} [success] FIXME: This all needs to be changed to use promises because it screws up Sentry.
     * @param {Function} [error]
     * @param {Function} [complete]
     * @param {boolean} [cache]
     * @return {Promise<any>}
     */
    request(method, endpoint, data, success, error, complete, cache) {
        const startedAt = Date.now();

        let url = this.createUrl(endpoint);

        let params;
        if (data) {
            // Copy data to a new object so we don't accidentally modify the original during SSR.
            params = {

                ...data
            };
        } else {
            params = {};
        }

        cache = method === 'GET' && cache === true;

        const headers = { ...this.headers };

        if (method !== 'GET') {
            // headers['content-type'] = 'application/x-www-form-urlencoded';

            if (method !== 'POST') {
                // Spoof PATCH and DELETE
                params._method = method; // eslint-disable-line no-underscore-dangle
                method = 'POST';
            }
        }

        if (this.authToken && !params.token) {
            if (method === 'GET') {
                params.token = this.authToken;
            } else {
                url += `?token=${this.authToken}`;
            }
        }

        const jsonParams = JSON.stringify(params);

        let cacheKey;
        if (cache === true) {
            cacheKey = url + jsonParams;
        }

        return new Promise((resolve, reject) => {
            /**
             * @param {object} response
             * @param {boolean} [fromCache]
             */
            const onSuccess = (response, fromCache) => {
                if (response.error) {
                    // Handle cases where the server returns an error response with a 200 status.
                    onError(response.error, response);
                    return;
                }

                // Store in the cache.
                if (!fromCache && cache === true && this.cache) {
                    this.cache.set(cacheKey, response);
                }

                if (typeof success === 'function') {
                    success(response);
                }
                resolve(response);
            };

            /**
             * @param {string} message
             * @param {?object} response
             */
            let onError = (message, response) => {
                if (!response) {
                    // response will always be an object to avoid having to check everywhere.
                    response = {};
                }

                console.error('[API] Error', method, url, jsonParams, message, response);

                const err = new ApiError(message, response, {
                    method, url, params, headers
                });
                logApiError(err);

                if (typeof error === 'function') {
                    error(message, response);
                } else if (error === true) {
                    // Set the error callback to boolean true to use the default error handler.
                    showAlert(message);
                }

                reject(err);
            };

            const onComplete = () => {
                console.log(`[API] Request took ${Date.now() - startedAt}ms`, method, url, jsonParams);
                if (typeof complete === 'function') {
                    complete();
                }
            };

            // Check the cache for an existing result.
            if (cache === true && this.cache) {
                // Check for a cached copy of this request.
                const cachedResult = this.cache.get(cacheKey);
                if (cachedResult) {
                    console.log('[API] Cached Result', method, url);
                    onSuccess(cloneDeep(cachedResult), true);
                    onComplete();
                    return;
                }
            }

            console.log('[API] Request', method, url); // , jsonParams, headers);

            this.axios({
                method,
                url,
                headers,
                timeout: 20000, // 20 seconds

                // If data is an object it will be sent as application/json.
                // So we convert it to a string and it is sent as application/x-www-form-urlencoded
                data: method !== 'GET' ? qs.stringify(params) : null,
                // data: method !== 'GET' ? params : null,

                // `params` are the URL parameters (query string) to be sent with the request
                // Must be a plain object or a URLSearchParams object
                params: method === 'GET' ? params : {},

                responseType: 'json'
            })
                .then((response) => {
                    if (response && typeof response.data === 'object' && response.data) {
                        onSuccess(response.data);
                    } else {
                        onError('Unexpected API response.', response.data);
                    }
                })
                .catch((err) => {
                    let message;
                    let responseJson;

                    if (err) {
                        if (err.response && err.response.data) {
                            responseJson = err.response.data;
                        }

                        if (responseJson && responseJson.hasOwnProperty('error')) {
                            message = responseJson.error;
                        } else {
                            message = err.message ? err.message : err.toString();
                        }
                    }

                    if (!message) {
                        message = 'API Error';
                    }

                    onError(message, responseJson);
                })
                .finally(onComplete);
        });
    }
}
