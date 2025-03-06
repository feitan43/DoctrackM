// utils.js

/**
 * Inserts commas into a number as a string.
 * @param {number|null} value - The number to format, or null.
 * @returns {string} - The formatted number as a string with commas.
 */
export function insertCommas(value) {
    if (value === null) {
        return '';
    }
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
