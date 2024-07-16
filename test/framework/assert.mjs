import { TestContext } from "./framework.mjs"

/**
 * @param {any} v
 * @returns {string}
 */
function str(v) {
    return JSON.stringify(v);
}

/**
 * @param {TestContext} t
 * @param {boolean} v
 * @returns {boolean}
 */
export function assertTrue(t, v) {
    if (!v) {
        t.fail("Expected value to be true");
    }
    return v;
}

/**
 * @param {TestContext} t
 * @param {boolean} v
 * @returns {boolean}
 */
export function assertFalse(t, v) {
    if (v) {
        t.fail("Expected value to be false");
    }
    return v;
}

/**
 * @template T
 * @param {TestContext} t
 * @param {T} actual
 * @param {T} expected
 * @param {string} [msg]
 * @returns {boolean}
 */
export function assertEqual(t, actual, expected, msg) {
    if (actual !== expected) {
        t.fail(`${msg ? msg + ": " : ""}Expected ${str(expected)} but got ${str(actual)}`);
        return false;
    }
    return true;
}

/**
 * @param {TestContext} t
 * @param {Array} v
 * @param {number} length
 * @returns {boolean}
 */
export function assertLength(t, v, length) {
    if (v.length !== length) {
        t.fail(`Expected array of length ${length}, but got length ${v.length} instead`);
        return false;
    }
    return true;
}
