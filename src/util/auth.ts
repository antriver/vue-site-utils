import { TokenStoreInterface } from '../token-stores/TokenStoreInterface';
import { VueRouter } from 'vue-router/types/router';
import { Store } from 'vuex';
import { Api } from '../classes/Api/Api';

export function redirectToLogin(next: string, router?: VueRouter): void {
    const url = `/login${next ? `?next=${encodeURIComponent(next)}` : ''}`;
    if (router) {
        router.push(url);
    } else {
        window.location.href = url;
    }
}

export function requireAuth(store: Store<any>, router: VueRouter, next: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (store.state.auth.currentUser) {
            resolve();
        } else {
            redirectToLogin(next, router);
            reject();
        }
    });
}

export const loginFromResponse = (
    tokenStore: TokenStoreInterface,
    store: Store<any>,
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
    store: Store<any>,
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

export function loadUserFromStoredToken(tokenStore: TokenStoreInterface, store: Store<any>, api: Api): Promise<any> {
    return new Promise((resolve, reject) => {
        try {
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
                resolve(null);
                return;
            }

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
                .catch(() => {
                    // No user. But this isn't an error, just resolve null.
                    // TODO: Must reject if there is an error communicating!
                    resolve(null);
                });
        } catch (e) {
            resolve(null);
        }
    });
}
