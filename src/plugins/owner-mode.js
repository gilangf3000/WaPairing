/*
 * Owner: gilangf3000
 * Project: WaPairing Bot
 * Website: https://wapairing.dpdns.org
 * Year: 2026
 * License: Free distribution allowed with source and credit
 * Prohibited: Sell or resell
 */

import { config } from '../config.js';

export async function handler({ m, args }) {
    const mode = args[0]?.toLowerCase();

    if (mode === 'public') {
        config.selfMode = false;
        return m.reply('Bot mode has been set to PUBLIC.');
    }

    if (mode === 'self') {
        config.selfMode = true;
        return m.reply('Bot mode has been set to SELF.');
    }

    return m.reply(
        `Current mode: *${config.selfMode ? 'SELF' : 'PUBLIC'}*\n\n` +
        `Usage: .mode public | self`
    );
}

handler.command = ['mode'];
handler.tags = ['owner'];
handler.owner = true;