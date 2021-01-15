import { TokenStoreInterface } from '../token-stores/TokenStoreInterface';
import { NavigationGuard, NavigationGuardNext, VueRouter } from 'vue-router/types/router';
import { Store } from 'vuex';
import { Api } from '../classes/Api/Api';
import { User, UserGlobalOptions } from '../models/User';
import { Route } from 'vue-router';

export interface AuthStore {
    auth: {
        currentUser?: User;
        token?: string;
        loginRedirect?: string;
        currentUserGlobalOptions?: UserGlobalOptions;
    }
}

export function redirectToLogin(next: string, router?: VueRouter): void {
    const url = `/login${next ? `?next=${encodeURIComponent(next)}` : ''}`;
    if (router) {
        router.replace(url);
    } else {
        window.location.href = url;
    }
}

export function getCurrentUser(store: Store<AuthStore>): User|null {
    return store.state.auth.currentUser || null;
}

export function ensureLoggedInOrRedirectToLogin(
    store: Store<AuthStore>,
    router: VueRouter,
    next: string,
):Promise<User> {
    return new Promise((resolve, reject) => {
        const user = getCurrentUser(store);
        if (user) {
            resolve(user);
            return;
        }

        redirectToLogin(next, router);
        reject();
    });
}

export const loginFromResponse = (
    tokenStore: TokenStoreInterface,
    store: Store<AuthStore>,
    response: any,
    router?: VueRouter,
    redirect = true,
): void => {
    store.commit('auth/setUser', response);

    tokenStore.setToken(response.token);

    // @ts-ignore
    if (typeof window.Raven !== 'undefined') {
        // @ts-ignore
        window.Raven.setUserContext({
            username: response.user.username,
            id: response.user.id,
        });
    }

    if (redirect && router) {
        const next = store.state.auth.loginRedirect ? store.state.auth.loginRedirect : '/';
        router.replace(next);
    }
};

export const logout = (
    api: Api,
    store: Store<AuthStore>,
    tokenStore: TokenStoreInterface,
): void => {
    const existingToken = tokenStore.getToken();

    // Tell the API to end the session so the token is no longer valid.
    api.delete('auth', { token: existingToken });

    // Clear the current user in the store.
    store.commit('auth/setUser', null);

    // Clear saved session token.
    tokenStore.setToken(null);

    // @ts-ignore
    if (typeof window.Raven !== 'undefined') {
        // @ts-ignore
        window.Raven.setUserContext();
    }
};

export function loadUserFromStoredToken(
    tokenStore: TokenStoreInterface,
    store: Store<AuthStore>,
    api: Api,
): Promise<User|null> {
    return new Promise((resolve, reject) => {
        // User is already set.
        // This was probably set by SSR.
        if (store.state.auth.currentUser) {
            console.debug('[Auth]', 'User already set');
            resolve(store.state.auth.currentUser);
            return;
        }

        // Check for session cookie in request. If there is one check the current user.
        const authToken = tokenStore.getToken();
        if (!authToken) {
            console.debug('[Auth]', 'No existing auth token');
            // This resolves will null because it is not an error. Having no user is valid.
            resolve(null);
            return;
        }

        try {
            console.debug('[Auth]', 'Loaded existing token', authToken);

            api.get(
                'auth',
                {
                    token: authToken,
                    extraAuthInfo: 1,
                },
            )
                .then((response: any) => {
                    if (response.user) {
                        console.debug('[Auth]', 'Auth response', response);
                        loginFromResponse(
                            tokenStore,
                            store,
                            response,
                            undefined,
                            false,
                        );

                        resolve(response);
                    }
                })
                .catch((err) => {
                    console.debug('[Auth]', 'Existing auth token no good', err);

                    // Remove the saved token.
                    tokenStore.setToken(null);

                    // No user. But this isn't an error, just resolve null.
                    resolve(null);
                });
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * Returns a function that can be used as a beforeEnter filter in Vue router.
 */
export function createAuthGuard(store: Store<AuthStore>): NavigationGuard {
    return (to: Route, from: Route, next: NavigationGuardNext): void => {
        const promise = (window as any).existingAuthPromise || Promise.resolve();
        promise.finally(() => {
            if (getCurrentUser(store)) {
                console.log('[AuthGuard] Logged in');
                next();
            } else {
                console.log('[AuthGuard] Not logged in. Redirecting to login.');
                next(`/login?next=${encodeURIComponent(to.fullPath)}`);
            }
        });
    };
}
