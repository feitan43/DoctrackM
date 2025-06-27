// utils.js

/**
 * Inserts commas into a number as a string.
 * @param {number|string|null} value - The number to format, or null/empty.
 * @returns {string} - The formatted number as a string with commas.
 */
export function insertCommas(value) {
    if (!value && value !== 0) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
