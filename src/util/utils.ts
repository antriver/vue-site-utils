/**
 * If the given 'func' is a function, calls it and returns the value.
 * If not it just returns it.
 *
 * @param {Function|String} funcOrString
 * @param {Array} [funcArgs]
 *
 * @return {*}
 */
import Vue from 'vue/types/umd';

export function callOrReturn(funcOrString: Function|string, funcArgs = []) {
    if (typeof funcOrString === 'function') {
        return funcOrString(...funcArgs);
    }
    return funcOrString;
}

//
// Depending on where/when a method call is made on a Vue component we need to access it differently.
// When calling asyncData during the route.beforeResolve method the component is not created so other options
// are accessed as 'this.func'
// Once a Vue component is created and you want to access an option from a methods such as beforeMount you need
// to access it as 'this.$options.func'
//
// @param funcName
// @param instance
// @param funcArgs
//
export function callVueOptionFunc(instance: Vue, funcName: string, funcArgs = []) {
    if (instance && instance.$options && instance.$options[funcName]) {
        return instance.$options[funcName](...funcArgs);
    }
    return instance[funcName](...funcArgs);
}

export const encodeQueryString = (obj: object) => Object.keys(obj).map((k) => `${k}=${encodeURIComponent(obj[k])}`).join('&');
