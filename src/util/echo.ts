// @ts-nocheck
/* eslint-disable */

import config from '@/config';
import LaravelEcho from 'laravel-echo';

/**
 * @param authToken
 * @return {Echo}
 */
export function createEchoInstance(authToken: string): LaravelEcho {
    return new LaravelEcho(
        {
            auth: {
                headers: {
                    Authorization: (authToken ? `Bearer ${authToken}` : ''),
                },
            },
            broadcaster: 'socket.io',
            host: `${config.socketHost}/`,
        },
    );
}
