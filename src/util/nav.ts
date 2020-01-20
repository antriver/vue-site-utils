import { scrollToElement } from './dom';

export function set404(component) {
    component.$root.$options.$shouldReloadOnNavigation = true;
    if (component.$ssrContext) {
        // Tell SSR to set response code to 404 (this is custom, also see server.js)
        component.$ssrContext.responseCode = 404;
    }
}

export function handleClicksWithVue(component) {
    document.addEventListener('click', (event) => {
        const { target } = event;

        const aTarget = target.closest('a');
        if (aTarget) {
            const lightboxUrl = aTarget.getAttribute('data-lightbox');
            if (lightboxUrl) {
                component.$root.$options.$modalFactory.openComponent('LightboxModal', { src: lightboxUrl });
                event.preventDefault();
                event.stopPropagation();
                return;
            }
        }

        // Listen for clicks on <a>s that should be intercepted and managed with vue-router
        // https://dennisreimann.de/articles/delegating-html-links-to-vue-router.html
        const hrefTarget = target.closest('a:not([href*=\'://\'])');
        if (hrefTarget && hrefTarget.href && hrefTarget.getAttribute('rel') !== 'external') {
            const hrefAttr = hrefTarget.getAttribute('href');

            const hrefParts = hrefAttr.split('#');
            if (hrefParts[1] && (!hrefParts[0] || hrefParts[0] === window.location.pathname)) {
                if (scrollToElement(hrefParts[1])) {
                    console.log('Handled link by scrolling', hrefAttr);
                    event.preventDefault();
                    event.stopPropagation();
                    component.$router.push(hrefAttr);
                    return;
                }
            }

            if (hrefParts[0].indexOf('javascript') === 0) {
                // Don't handle javascript links.
                return;
            }

            // some sanity checks taken from vue-router:
            // https://github.com/vuejs/vue-router/blob/dev/src/components/link.js#L106
            const {
                altKey, ctrlKey, metaKey, shiftKey, button, defaultPrevented
            } = event;
            // don't handle with control keys
            if (metaKey || altKey || ctrlKey || shiftKey) return;
            // don't handle when preventDefault called
            if (defaultPrevented) return;
            // don't handle right clicks
            if (button !== undefined && button !== 0) return;
            // don't handle if `target="_blank"`
            if (hrefTarget && hrefTarget.getAttribute) {
                const linkTarget = hrefTarget.getAttribute('target');
                if (/\b_blank\b/i.test(linkTarget)) return;
            }
            // don't handle same page links/anchors
            if (window.location.pathname !== hrefAttr && event.preventDefault) {
                event.preventDefault();
                console.log('Handling link with router', hrefAttr);
                component.$router.push(hrefAttr);
            }
        }
    });
}
