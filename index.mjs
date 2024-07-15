const debug = false;

/**
 * Converts a string of Markdown to HTML, albeit only an extremely small subset of Markdown.
 *
 * @param {string} markdown The Markdown string to process.
 * @returns {string} The rendered HTML.
 */
export function parse(markdown) {
    if (debug) {
        console.log(`====== ${markdown} ======`);
    }

    let tokens = []; // runs and plain text
    function peekType() {
        return tokens.length > 0 ? tokens[tokens.length-1].type : null;
    }
    function appendChar(c) {
        if (peekType() !== "text") {
            tokens.push({
                type: "text",
                content: "",
            });
        }
        tokens[tokens.length-1].content += c;
    }

    let runChar = null;
    let precedingKind = "whitespace"; // beginning of line counts as whitespace for flanking
    for (const c of markdown) {
        if ((c === "*" || c === "_") && precedingKind !== "backslash") {
            // Starting or continuing a delimiter run
            let currentRun = peekType() === "run" ? tokens[tokens.length-1] : null;
            if (!currentRun) {
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
        } else if (c === "\\") {
            precedingKind = "backslash";
        } else {
            if (peekType() === "run") {
                // Ending a delimiter run
                const currentRun = tokens[tokens.length-1];
                currentRun.followedBy = categorize(c);
            }
            precedingKind = precedingKind === "backslash" ? null : categorize(c);
            appendChar(c);
        }
    }

    if (peekType() === "run") {
        tokens[tokens.length-1].followedBy = "whitespace"; // end of line counts as whitespace for flanking
    }

    if (debug) {
        const printToks = [];
        for (const t of tokens) {
            if (t.type === "text") {
                printToks.push(t.content);
            } else if (t.type === "run") {
                printToks.push({
                    ...t,
                    leftFlanking: isLeftFlanking(t),
                    rightFlanking: isRightFlanking(t),
                    canOpen: canOpen(t),
                    canClose: canClose(t),
                    canOpenStrong: canOpenStrong(t),
                    canCloseStrong: canCloseStrong(t),
                });
            } else {
                printToks.push("???");
            }
        }
        console.log("parsed tokens:", printToks);
    }

    for (let iend = 0; iend < tokens.length; iend++) {
        function render(istart, open, close) {
            let rendered = open;
            for (let i = istart + 1; i < iend; i++) {
                rendered += toText(tokens[i]);
            }
            rendered += close;
            tokens.splice(istart, iend - istart + 1, {
                type: "text",
                content: rendered,
            });
            iend = istart; // will increment to the token after start again on next iteration
        }

        const end = tokens[iend];
        if (end.type !== "run") {
            continue;
        }

        if (canClose(end)) {
            for (let istart = iend - 1; istart >= 0; istart--) {
                const start = tokens[istart];
                if (canOpen(start)) {
                    render(istart, "<em>", "</em>")
                }
            }
        }
    }
    if (debug) {
        console.log("rendered tokens:", tokens);
    }

    let output = "<p>";
    for (const t of tokens) {
        output += toText(t);
    }
    output += "</p>"

    return output;
}

function isWhitespace(c) {
    return /\s/.test(c);
}

function isPunctuation(c) {
    return /(\p{P}|\p{S})/u.test(c);
}

function categorize(c) {
    if (isWhitespace(c)) {
        return "whitespace";
    } else if (isPunctuation(c)) {
        return "punctuation";
    } else {
        return null;
    }
}

function isLeftFlanking(run) {
    return run.followedBy !== "whitespace" && (run.followedBy !== "punctuation" || run.precededBy === "whitespace" || run.precededBy === "punctuation");
}

function isRightFlanking(run) {
    return run.precededBy !== "whitespace" && (run.precededBy !== "punctuation" || run.followedBy === "whitespace" || run.followedBy === "punctuation");
}

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

function canOpenStrong(run) {
    return canOpen(run) && run.length >= 2;
}

function canCloseStrong(run) {
    return canClose(run) && run.length >= 2;
}

function toText(t) {
    if (t.type === "text") {
        return t.content;
    } else if (t.type === "run") {
        return t.char.repeat(t.length);
    } else {
        throw new Error(`bad token type ${t.type}`);
    }
}