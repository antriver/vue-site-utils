/**
 * @param {object} component
 * @param {string} category
 * @param {string} action
 * @param {string} [label]
 * @param {number} [value]
 */
export function gaEvent(component, category, action, label, value) {
    try {
        if (component && component.$ga) {
            component.$ga.event(category, action, label, value);
        } else if (typeof window !== 'undefined' && window.ga) {
            window.ga('send', {
                hitType: 'event',
                eventCategory: category,
                eventAction: action,
                eventLabel: label
            });
        }
    } catch (e) {
        console.error('Failed to send ga event', e);
    }
}