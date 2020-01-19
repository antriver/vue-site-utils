import config from '@/config';
import { encodeQueryString } from '@/util/utils';

export const MODAL_EVENTS = {
    OPENED: 'MODAL.OPENED',
    REJECT: 'MODAL.REJECT',
    RESOLVE: 'MODAL.RESOLVE'
};

export class ModalFactory {
    /**
     * @param {Store} store
     */
    constructor(store) {
        this.store = store;

        window.addEventListener('message', ({ data }) => {
            if (!data.modalId) {
                return;
            }
            const openModal = this.store.state.openModals[data.modalId];
            if (openModal) {
                switch (data.type) {
                    case MODAL_EVENTS.OPENED:
                        this.hideLoadingSpinner(data.modalId);
                        if (typeof openModal.onReady === 'function') {
                            // The modal is now open. Call the onReady handler.
                            openModal.onReady();
                        }
                        break;

                    case MODAL_EVENTS.RESOLVE:
                        openModal.resolve(data.data);
                        this.close(data.modalId);
                        break;

                    case MODAL_EVENTS.REJECT:
                        openModal.reject(data.data);
                        this.close(data.modalId);
                        break;
                }
            }
        });
    }

    close(modalId) {
        this.store.commit('setOpenModal', { modalId });
    }

    /**
     * @param {string} path
     * @param {object} [params]
     * @param {function} [onReady]
     *
     * @return {Promise}
     */
    open(path, params = {}, onReady) {
        return new Promise((resolve, reject) => {
            const modalId = ModalFactory.generateId();
            const query = {

                ...params,
                modalId,
                token: this.store.state.auth.token
            };

            const url = `${config.modalUrl + path}?${encodeQueryString(query)}`;

            this.store.commit('setOpenModal', {
                modalId,
                value: {
                    component: 'IframeModal',
                    props: {
                        url,
                        loading: true
                    },
                    resolve: d => resolve(d),
                    reject: d => reject(d),
                    onReady
                }
            });
        });
    }

    openComponent(component, props = {}) {
        const modalId = ModalFactory.generateId();

        const promise = new Promise((resolve, reject) => {
            this.store.commit('setOpenModal', {
                modalId,
                value: {
                    component,
                    props: Object.assign(
                        props,
                        {
                            modalId,
                            resolve,
                            reject
                        }
                    )
                }
            });
        });

        promise.finally(() => {
            this.close(modalId);
        });

        return promise;
    }

    hideLoadingSpinner(modalId) {
        const openModal = this.store.state.openModals[modalId];
        if (openModal) {
            openModal.props.loading = false;
            this.store.commit('setOpenModal', openModal);
        }
    }

    static generateId() {
        return (new Date()).getTime();
    }
}
