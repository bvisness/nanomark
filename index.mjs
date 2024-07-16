/**
 * @typedef TokenText
 * @type {object}
 *
 * @property {"text"} type
 * @property {string} content
 */

/**
 * @typedef TokenRun
 * @type {object}
 *
 * @property {"run"} type
 * @property {string} char
 * @property {number} length
 *
 * @property {CharKind} precededBy
 * @property {?CharKind} followedBy
 */

/**
 * @typedef Token
 * @type {(TokenText|TokenRun)}
 */

/**
 * @typedef CharKind
 * @type {("whitespace"|"punctuation"|"backslash")}
 */

/**
 * Converts a string of Markdown to HTML, albeit only an extremely small subset of Markdown.
 *
 * @param {string} markdown The Markdown string to process.
 * @returns {string} The rendered HTML.
 */
export function parse(markdown) {
    /*
     * The implementation of this function follows directly from the CommonMark spec and uses
     * terminology from the spec such as "left-flanking" and "right-flanking". You should read and
     * understand this section of the spec before reading this code:
     *
     * https://spec.commonmark.org/0.31.2/#emphasis-and-strong-emphasis
     *
     * Other general notes about the implementation:
     *
     * - We iterate through the Markdown string using for...of so that we leverage the iterator
     *   protocol on JS strings, which iterates by Unicode code points. Other APIs for accessing
     *   strings in JS (such as `charAt` or the `[]` operator) yield UTF-16 code units, _not_
     *   Unicode code points as required by CommonMark. (`codePointAt` could work but the need to
     *   explicitly handle trailing surrogates makes it too much of a pain.)
     *
     *   Thankfully, very little state machine logic is required during this parsing process, so
     *   being constrained to a single for...of loop with no cursor control is not a big deal. If
     *   in the future we did want the ability to advance or rewind the "cursor" within the loop,
     *   we could perhaps call the iterator protocol's `next()` directly along with a small buffer
     *   of previous code points.
     */

    /*
     * Step 1: Tokenize the Markdown text, separating raw text and delimiter runs.
     */

    /** @type {Token[]} */
    const tokens = [];

    /** @returns {Token} */
    function top() {
        if (tokens.length === 0) {
            throw new Error("top token does not exist");
        }
        return tokens[tokens.length-1];
    }
    function topText() { return assertText(top()); }
    function topRun() { return assertRun(top()); }

    /** @returns {?Token["type"]} */
    function peekType() {
        return tokens.length > 0 ? tokens[tokens.length-1].type : null;
    }

    /** @param {string} c */
    function appendChar(c) {
        if (peekType() !== "text") {
            tokens.push({
                type: "text",
                content: "",
            });
        }
        topText().content += c;
    }

    /**
     * @param {TokenRun} run
     * @param {string} followingChar
     */
    function endRun(run, followingChar) {
        run.followedBy = categorize(followingChar);
    }

    /** @type {?CharKind} */
    let precedingKind = "whitespace"; // beginning of line counts as whitespace for flanking
    for (const c of markdown) {
        if ((c === "*" || c === "_") && precedingKind !== "backslash") {
            // Starting or continuing a delimiter run
            let currentRun = peekType() === "run" ? /** @type {TokenRun} */(top()) : null;
            if (!currentRun || currentRun.char !== c) {
                if (currentRun) {
                    endRun(currentRun, c);
                }
                currentRun = {
                    type: "run",
                    char: c,
                    length: 0,

                    precededBy: precedingKind,
                    followedBy: null,
                }
                tokens.push(currentRun);
            }
            currentRun.length += 1;
            precedingKind = "punctuation"; // * and _ are Unicode punctuation
        } else if (c === "\\") {
            precedingKind = "backslash";
        } else {
            if (peekType() === "run") {
                // Ending a delimiter run
                endRun(topRun(), c);
            }
            precedingKind = precedingKind === "backslash" ? null : categorize(c);
            appendChar(c);
        }
    }

    if (peekType() === "run") {
        topRun().followedBy = "whitespace"; // end of line counts as whitespace for flanking
    }

    /*
     * Step 2: Iterate through the tokens, converting ranges of emphasis to text.
     */

    /**
     * @param {number} istart
     * @param {number} iend
     * @param {number} n
     * @param {string} open
     * @param {string} close
     * @returns {number} The new value for iend.
     */
    function render(istart, iend, n, open, close) {
        const start = assertRun(tokens[istart]);
        const end = assertRun(tokens[iend]);

        let rendered = open;
        for (let i = istart + 1; i < iend; i++) {
            rendered += toText(tokens[i]);
        }
        rendered += close;

        /** @type {Token[]} */
        const newTokens = [];
        if (start.length > n) {
            newTokens.push({
                ...start,
                length: start.length - n,
            });
        }
        newTokens.push({
            type: "text",
            content: rendered,
        });
        if (end.length > n) {
            newTokens.push({
                ...end,
                length: end.length - n,
            });
        }

        tokens.splice(istart, iend - istart + 1, ...newTokens);

        // setting iend to istart will cause iend to increment to the token after the render on
        // next iteration
        return istart;
    }

    for (let iend = 0; iend < tokens.length; iend++) {
        const end = tokens[iend];
        if (end.type !== "run") {
            continue;
        }

        for (let istart = iend - 1; istart >= 0; istart--) {
            const start = tokens[istart];

            if (canOpenStrong(start) && canCloseStrong(end) && compatible(start, end)) {
                iend = render(istart, iend, 2, "<strong>", "</strong>");
                break;
            }
            if (canOpen(start) && canClose(end) && compatible(start, end)) {
                iend = render(istart, iend, 1, "<em>", "</em>");
                break;
            }
        }
    }

    /*
     * Step 3: Render the final text.
     */
    let output = "<p>";
    for (const t of tokens) {
        output += toText(t);
    }
    output += "</p>"

    return output;
}

/** @param {string} c */
function isWhitespace(c) {
    return /\s/.test(c);
}

/** @param {string} c */
function isPunctuation(c) {
    // @ts-ignore: The /u flag is valid under ES2015, but TS is confused.
    return /(\p{P}|\p{S})/u.test(c);
}

/** @param {string} c */
function categorize(c) {
    if (isWhitespace(c)) {
        return "whitespace";
    } else if (isPunctuation(c)) {
        return "punctuation";
    } else {
        return null;
    }
}

/**
 * @param {Token} t
 * @returns {TokenText}
 */
function assertText(t) {
    if (t.type !== "text") {
        throw new Error("expected text token");
    }
    return t;
}

/**
 * @param {Token} t
 * @returns {TokenRun}
 */
function assertRun(t) {
    if (t.type !== "run") {
        throw new Error("expected run token");
    }
    return t;
}

/** @param {TokenRun} run */
function isLeftFlanking(run) {
    return run.followedBy !== "whitespace" && (run.followedBy !== "punctuation" || run.precededBy === "whitespace" || run.precededBy === "punctuation");
}

/** @param {TokenRun} run */
function isRightFlanking(run) {
    return run.precededBy !== "whitespace" && (run.precededBy !== "punctuation" || run.followedBy === "whitespace" || run.followedBy === "punctuation");
}

/** @param {Token} t */
function canOpen(t) {
    if (t.type !== "run") {
        return false;
    }

    if (t.char === "*") {
        return isLeftFlanking(t);
    } else if (t.char === "_") {
        return isLeftFlanking(t) && (!isRightFlanking(t) || t.precededBy === "punctuation");
    } else {
        throw new Error(`bad run char ${t.char}`);
    }
}

/** @param {Token} t */
function canClose(t) {
    if (t.type !== "run") {
        return false;
    }

    if (t.char === "*") {
        return isRightFlanking(t);
    } else if (t.char === "_") {
        return isRightFlanking(t) && (!isLeftFlanking(t) || t.followedBy === "punctuation");
    } else {
        throw new Error(`bad run char ${t.char}`);
    }
}

/** @param {Token} t */
function canOpenStrong(t) {
    if (t.type !== "run") {
        return false;
    }
    return canOpen(t) && t.length >= 2;
}

/** @param {Token} t */
function canCloseStrong(t) {
    if (t.type !== "run") {
        return false;
    }
    return canClose(t) && t.length >= 2;
}

/**
 * @param {Token} start
 * @param {Token} end
 */
function compatible(start, end) {
    if (start === end) {
        throw new Error("the same token should not be compared with itself for compatibility");
    }
    if (start.type !== "run" || end.type !== "run") {
        return false;
    }

    let sumOk = true;
    if ((canOpen(start) && canClose(start)) || (canOpen(end) && canClose(end))) {
        sumOk = ((start.length + end.length) % 3 !== 0 || (start.length % 3 === 0 && end.length % 3 === 0));
    }
    return start.char === end.char && sumOk;
}

/** @param {Token} t */
function toText(t) {
    switch (t.type) {
        case "text":
            return t.content;
        case "run":
            return t.char.repeat(t.length);
        default:
            throw new Error(`bad token type ${/** @type {any} */(t).type}`);
    }
}
