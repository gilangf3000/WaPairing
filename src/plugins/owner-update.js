/*
 * Owner: gilangf3000
 * Project: WaPairing Bot
 * Website: https://wapairing.dpdns.org
 * Year: 2026
 * License: Free distribution allowed with source and credit
 * Prohibited: Sell or resell
 */

import { reloadPlugins } from '../handler.js';

export async function handler({ m }) {
    try {
        await reloadPlugins();
        m.reply("All plugins have been successfully reloaded!");
    } catch(e) {
        m.reply(`Failed to reload plugins: ${e.message}`);
    }
}

handler.command = ['update', 'reload'];
handler.tags = ['owner'];
handler.owner = true;