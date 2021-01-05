import { TokenStoreInterface } from './TokenStoreInterface';
import Cookies from 'universal-cookie';
import { AbstractTokenStore } from './AbstractTokenStore';

export class CookieTokenStore extends AbstractTokenStore implements TokenStoreInterface {
    constructor(
        protected cookies: Cookies,
        keyName: string,
        protected cookieDomain = '',
        protected cookiePath = '',
        protected cookieSecure = true,
    ) {
        super(keyName);
    }

    public getToken(): string | null {
        return this.cookies.get(this.keyName) || null;
    }

    public setToken(token: string | null): void {
        const expires = new Date();
        if (!token) {
            expires.setFullYear(expires.getFullYear() - 5);
        } else {
            expires.setFullYear(expires.getFullYear() + 5);
        }

        const cookies = new Cookies();
        cookies.set(
            this.keyName,
            token,
            {
                domain: this.cookieDomain,
                expires,
                path: this.cookiePath,
                secure: this.cookieSecure,
            },
        );
    }
}
