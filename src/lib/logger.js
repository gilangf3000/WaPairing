/*
 * Owner: gilangf3000
 * Project: WaPairing
 * Website: https://wapairing.dpdns.org
 * Year: 2026
 * License: Free distribution allowed with source and credit
 * Prohibited: Sell or resell
 */

import chalk from 'chalk';

const log = console.log;

function toBoldUnicode(text) {
    return text
        .split('')
        .map(c => {
            const code = c.charCodeAt(0);
            if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D400 + (code - 65));
            if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D41A + (code - 97));
            return c;
        })
        .join('');
}

function fancyLabel(label, color = 'white') {
    const boldLabel = toBoldUnicode(label.toUpperCase());
    if (chalk[color]) {
        return chalk[color](`[${boldLabel}]`);
    }
    return `[${boldLabel}]`;
}

export function info(text) {
    log(fancyLabel('INFO', 'magenta'), text);
}

export function success(text) {
    log(fancyLabel('SUCCESS', 'green'), text);
}

export function warn(text) {
    log(fancyLabel('WARNING', 'yellow'), text);
}

export function error(text) {
    log(fancyLabel('ERROR', 'red'), text);
}

export function custom(text, label = '', color = 'white') {
    if (label) {
        log(fancyLabel(label, color), text);
    } else {
        log(chalk[color](text));
    }
}
