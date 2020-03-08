import config from '@/config';
import { showAlert } from './dialogs';
import { readSessionToken, storeSessionToken } from './token-store';
import { Component } from 'vue/types/umd';
import { TokenStoreInterface } from '@/token-stores/TokenStoreInterface';

export function redirectToLogin(component: Component, next: string) {
    const url = `/login${next ? `?next=${encodeURIComponent(next)}` : ''}`;
    if (component.$router) {
        component.$router.push(url);
    } else {
        window.location = url;
    }
}

export function requireAuth(component, next) {
    return new Promise((resolve, reject) => {
        if (component.$store.state.auth.currentUser) {
            resolve();
        } else {
            redirectToLogin(component, next);
            reject();
        }
    });
}

export function requireAccount(component, action) {
    if (component.$store.state.auth.currentUser) {
        return Promise.resolve(component.$store.state.auth.currentUser);
    }
    return component.$root.$options.$modalFactory.openComponent(
        'SignupModal',
        {
            action
        }
    ).then((user) => {
        if (user) {
            // TODO: Return here if the user was recently created.
            return user;
        }
        return Promise.reject();
    });
}

/**
 *
 * @param component
 * @param user
 * @param {string} [text] Optional text to override the default text in the modal.
 *
 * @return {Promise}
 */
export function showSignupCompleteModal(component, user, text) {
    const root = component ? component.$root : window.rootVue;
    return root.$options.$modalFactory.openComponent(
        'SignupCompleteModal',
        {
            user,
            text
        }
    ).then(() => {
    });
}

/**
 *
 * @param component
 * @param user
 * @param {ApiError} error
 */
export function showApiErrorWithPotentialDraftContent(component, user, error) {
    if (error && error.response && error.response.draftReason === 'unverified' && error.response.draftReasonText) {
        showSignupCompleteModal(component, user, error.response.draftReasonText);
    } else {
        showAlert(error.message);
    }
}

export const loginFromResponse = (
    tokenStore: TokenStoreInterface,
    component: Component,
    response: any,
    redirect: boolean
): void => {
    component.$store.commit('auth/setUser', response);

    tokenStore.setToken(response.token);

    /* global Raven */
    if (typeof Raven !== 'undefined') {
        Raven.setUserContext({
            username: response.user.username,
            id: response.user.id
        });
    }

    if (redirect) {
        const next = component.$store.state.loginRedirect ? component.$store.state.loginRedirect : '/';
        component.$router.replace(next);
    }
};

export const logout = (component) => {
    const existingToken = component.$store.state.auth.token;

    // Tell API to end the session.
    component.$root.$options.$api.delete('auth', { token: existingToken });

    // Delete user from store.
    component.$store.commit('auth/setUser', null);

    storeSessionToken(null);

    if (typeof Raven !== 'undefined') {
        Raven.setUserContext();
    }

    component.$router.push('/');
};

/**
 *
 * @param cookies
 * @param store
 * @param {Api} api
 *
 * @return {Promise<any>}
 */
export function checkUserCookie(cookies, store, api) {
    return new Promise((resolve, reject) => {
        try {
            // Check for session cookie in request. If there is one check the current user.
            const sessionTokenCookie = readSessionToken(cookies);

            if (sessionTokenCookie && !store.state.auth.currentUser) {
                console.log(`${config.sessionCookieName} cookie found`, sessionTokenCookie);
                api.get(
                    'auth',
                    {
                        token: sessionTokenCookie,
                        extraAuthInfo: 1
                    }
                )
                    .then((response) => {
                        if (response.user) {
                            // Use this token for future requests.
                            api.setAuthToken(response.token);

                            // Set the user in vuex.
                            store.commit('auth/setUser', {
                                user: response.user,
                                token: response.token,
                                userGlobalOptions: response.userGlobalOptions,
                                rightColBox: response.rightColBox
                            });

                            resolve(response);
                        }
                    })
                    .catch(() => {
                        // No user. But this isn't an error, just resolve null.
                        // TODO: Must reject if there is an error communicating!
                        resolve(null);
                    });
            } else {
                resolve(null);
            }
        } catch (e) {
            resolve(null);
        }
    });
}

export const addUnverifiedEmailAlert = (store, userGlobalOptions) => {
    if (userGlobalOptions.emailVerified === false) {
        store.commit('addAlert', {
            dismissible: false,
            href: '/verification',
            id: 'unverified-user',
            type: 'info',
            btnText: 'Help',
            text: '<i class="fa fa-envelope"></i> You need to verify your email address before you can use all the features. We\'ve emailed you a link to do this.'
        });
    }
};
