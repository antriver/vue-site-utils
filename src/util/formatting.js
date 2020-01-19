/**
 * @param {Number} num
 * @return {String}
 */
export function formatNumber(num) {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 0;
}
