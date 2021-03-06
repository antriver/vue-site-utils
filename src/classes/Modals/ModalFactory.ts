import { encodeQueryString } from '../../util/url';
import { ModalConfigInterface } from './ModalConfigInterface';
import { Store } from 'vuex';

export const MODAL_EVENTS = {
    OPENED: 'MODAL.OPENED',
    REJECT: 'MODAL.REJECT',
    RESOLVE: 'MODAL.RESOLVE',
};

export class ModalFactory {
    constructor(
        private config: ModalConfigInterface,
        private store: Store<any>,
    ) {
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

    close(modalId: string): void {
        this.store.commit('setOpenModal', { modalId });
    }

    /**
     * @param {string} path
     * @param {object} [params]
     * @param {function} [onReady]
     *
     * @return {Promise}
     */
    open(path: string, params = {}, onReady: Function): Promise<any> {
        return new Promise((resolve, reject) => {
            const modalId = ModalFactory.generateId();
            const query = {

                ...params,
                modalId,
                token: this.store.state.auth.token,
            };

            const url = `${this.config.remoteModalUrl + path}?${encodeQueryString(query)}`;

            this.store.commit('setOpenModal', {
                modalId,
                value: {
                    component: 'IframeModal',
                    props: {
                        url,
                        loading: true,
                    },
                    resolve: (d: any): void => resolve(d),
                    reject: (d: any): void => reject(d),
                    onReady,
                },
            });
        });
    }

    openComponent(component: string, props = {}): Promise<any> {
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
                            reject,
                        },
                    ),
                },
            });
        });

        promise.finally(() => {
            this.close(modalId);
        });

        return promise;
    }

    hideLoadingSpinner(modalId: string): void {
        const openModal = this.store.state.openModals[modalId];
        if (openModal) {
            openModal.props.loading = false;
            this.store.commit('setOpenModal', openModal);
        }
    }

    static generateId(): string {
        return (new Date()).getTime().toString();
    }
}
