/*
 * Owner: gilangf3000
 * Project: WaPairing Bot
 * Website: https://wapairing.dpdns.org
 * Year: 2026
 * License: Free distribution allowed with source and credit
 * Prohibited: Sell or resell
 */

import { config } from '../config.js';

export async function handler({ m, args, prefix, command }) {
    if (!args[0]) {
        return m.reply(`Current prefix: *${config.prefix}*\nUsage: ${prefix + command} <new_prefix>`);
    }

    config.prefix = args[0];
    m.reply(`Prefix successfully changed to: *${config.prefix}*`);
}

handler.command = ['setprefix'];
handler.tags = ['owner'];
handler.owner = true;