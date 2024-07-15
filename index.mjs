/**
 * Converts a string of Markdown to HTML, albeit only an extremely small subset of Markdown.
 *
 * @param {string} markdown The Markdown string to process.
 * @returns {string} The rendered HTML.
 */
export function parse(markdown) {
    return `<p>${markdown}</p>`;
}
