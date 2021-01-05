import { Route } from 'vue-router';

/**
 * Normally you would load data for a page in the mounted or created method of a component.
 * When using SSR you need to do things differently so that the data is loaded on the server and is available on the
 * client without the client having to fetch it again.
 * See https://ssr.vuejs.org/guide/data.html#data-store
 * Even if not using SSR it's a good idea to do it this way to make it easy to switch to SSR in future.
 *
 * The component should provide a function called asyncData that does the fetching of its necessary data and stores
 * it in vuex.
 * On the server fetching the data for a component happens in router.onReady
 * On the client this happens in the component's beforeMount.
 * Accessing that data from Vuex is where this mixin comes in. This provides a computed property, 'pd' that contains
 * the data loaded from the asyncData method.
 *
 * A component using this should have an function in its options called pageDataKey which accepts
 * a Route as an argument.
 * The function should return a string which is a key in vuex that will be used to store the data for that page.
 */
export const pageDataMixin = {
    beforeRouteLeave(to: Route, from: Route|null, next: Function) {
        if (!!this.$options.pageDataKey && this.$options.clearPageDataOnRouteLeave !== false) {
            const key = this.$options.pageDataKey(from);
            this.$store.dispatch('scheduleClearPageData', { key });
        }
        next();
    },

    beforeRouteUpdate(to: Route, from: Route|null, next: Function) {
        if (
            typeof this.$options.clearPageDataOnRouteUpdate === 'function'
            && this.$options.clearPageDataOnRouteUpdate(to, from) === true
        ) {
            const key = this.$options.pageDataKey(from);
            this.$store.dispatch('scheduleClearPageData', { key });
        }
        next();
    },

    computed: {
        pageDataKey(): string|null {
            const route = typeof this.$route !== 'undefined' ? this.$route : {};

            return this.$options.pageDataKey ? this.$options.pageDataKey(route) : null;
        },

        pd(): object|null {
            return this.pageDataKey ? this.$store.state.pageData[this.pageDataKey] : null;
        },

        pdError(): object|null {
            return this.pd && this.pd.error ? this.pd.error : null;
        },
    },
};
