import { Method } from 'axios';

export interface ApiRequest {
    method: Method;
    url: string;
    params?: any;
    headers?: any;
}
