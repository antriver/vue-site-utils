/**
 * @param {HTMLElement} element
 * @return {{top: number, left: number}}
 */
export function getElementOffset(element) {
    const de = document.documentElement;
    const box = element.getBoundingClientRect();
    const top = box.top + window.pageYOffset - de.clientTop;
    const left = box.left + window.pageXOffset - de.clientLeft;
    return { top, left };
}

function scrollOffsetTop() {
    return window.innerWidth < 992 ? 62 : 72;
}

export function scrollToElement(id) {
    const domElement = document.getElementById(id);
    if (domElement) {
        document.getElementsByTagName('html')[0].scrollTop = getElementOffset(domElement).top - scrollOffsetTop();
        return true;
    }
    return false;
}

/**
 * Scroll the page to the given element smoothly.
 *
 * @param {Element|HTMLElement} element
 * @param {function} [callback]
 */
export function smoothScrollToElement(element, callback) {
    const targetY = getElementOffset(element).top - scrollOffsetTop();
    const scrollEl = document.getElementsByTagName('html')[0];
    const currentDiff = scrollEl.scrollTop - targetY;

    if (Math.abs(currentDiff) < 10) {
        // Already there. Jiggle the page a little.
        scrollElementTo(
            scrollEl,
            targetY + 30,
            150,
            () => {
                scrollElementTo(
                    scrollEl,
                    targetY,
                    150,
                    callback
                );
            }
        );
    } else {
        scrollElementTo(
            scrollEl,
            targetY,
            300,
            callback
        );
    }
}

/**
 * Scroll the given element to the given y position smoothly.
 *
 * @param element
 * @param to
 * @param duration
 * @param callback
 */
export function scrollElementTo(element, to, duration, callback) {
    if (duration <= 0) return;
    const difference = to - element.scrollTop;
    const perTick = difference / duration * 10;

    setTimeout(() => {
        element.scrollTop += perTick;
        if (element.scrollTop === to) {
            callback && callback();
            return;
        }
        scrollElementTo(element, to, duration - 10, callback);
    }, 10);
}
