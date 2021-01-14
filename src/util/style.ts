import { Store } from 'vuex';
import { AuthStore } from './auth';

/**
 * Reset the background to the current user's selection, or the default.
 *
 * @param store
 * @param ssrContext
 */
export function resetBg(store: Store<AuthStore>, ssrContext: any = null): void {
    if (store.state.auth.currentUserGlobalOptions) {
        const opts = store.state.auth.currentUserGlobalOptions;
        setBg(
            ssrContext,
            opts.bgColor,
            opts.bgColorTheme,
            opts.bgPattern,
            opts.darkMode,
        );
    } else {
        setBg();
    }
}

/**
 * Change the background colour / theme.
 * Can be called during SSR or in the client.
 *
 * @param ssrContext
 * @param bgColor
 * @param bgColorTheme
 * @param bgPattern
 * @param darkMode
 */
export function setBg(
    ssrContext?: any,
    bgColor?: string,
    bgColorTheme?: string,
    bgPattern?: string,
    darkMode?: boolean,
):void {
    const bgColorStyle = bgColor
        ? `<style id="bg-color-style">.bg-color { background: #${bgColor}; }</style>`
        : '';

    if (ssrContext) {
        // Things in ssrContext get output in the index.html template.
        ssrContext.bgColorStyle = bgColorStyle;
        ssrContext.bgColorTheme = bgColor ? 'none' : bgColorTheme;
        ssrContext.bgPattern = bgPattern;
        ssrContext.darkModeClass = darkMode ? 'dark-mode' : '';
    } else {
        if (bgColor) {
            // Set to an empty value so the theme element get hidden.
            document.body.setAttribute('data-bg-color-theme', 'none');
        } else {
            document.body.setAttribute('data-bg-color-theme', bgColorTheme || null);
        }
        document.body.setAttribute('data-bg-pattern', bgPattern || null);

        const bgColorStyleEl = document.getElementById('bg-color-style');
        if (bgColorStyleEl) {
            bgColorStyleEl.remove();
        }

        if (bgColor) {
            document.getElementsByTagName('head')[0].innerHTML += bgColorStyle;
        }

        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }
}
