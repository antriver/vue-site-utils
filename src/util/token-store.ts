import cfg from '@/config';
import Cookies from 'universal-cookie';

/**
 * @param {Cookies|null} cookies Universal cookies instance
 */
export function readSessionToken(cookies) {
    if (cookies) {
        return cookies.get(cfg.sessionCookieName) || null;
    }

    return null;
}

export function storeSessionToken(token) {
    const expires = new Date();
    if (!token) {
        expires.setFullYear(expires.getFullYear() - 5);
    } else {
        expires.setFullYear(expires.getFullYear() + 5);
    }

    const cookies = new Cookies();
    cookies.set(
        cfg.sessionCookieName,
        token,
        {
            domain: cfg.cookieDomain,
            expires,
            path: cfg.sessionCookiePath,
            secure: cfg.sessionCookieSecure
        }
    );
}
