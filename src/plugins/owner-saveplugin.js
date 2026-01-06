/*
 * Owner: gilangf3000
 * Project: WaPairing
 * Website: https://wapairing.dpdns.org
 * Year: 2026
 * License: Free distribution allowed with source and credit
 * Prohibited: Sell or resell
 */

import { writeFile } from 'fs/promises';
import path from 'path';
import { reloadPlugins } from '../handler.js';
import { format } from 'util';

export async function handler({ m, args, prefix, command }) {
    if (!args[0]) {
        return m.reply(`Usage: ${prefix + command} <filename> <code>`);
    }

    let filename = args[0];
    if (!filename.endsWith('.js')) filename += '.js';

    let code = args.slice(1).join(' ');

    if (!code) {
        if (m.quoted?.text) {
            code = m.quoted.text;
        } else {
            return m.reply('No code found. Provide code or reply to a message.');
        }
    }

    const pluginsDir = path.resolve('./src/plugins');
    const filepath = path.join(pluginsDir, filename);

    try {
        await writeFile(filepath, code, 'utf8');
        await m.reply(`Plugin *${filename}* saved successfully.`);

        await reloadPlugins();
    } catch (e) {
        console.error('Error saving plugin:', e);
        await m.reply(`Failed to save plugin:\n${format(e)}`);
    }
}

handler.command = ['saveplugin', 'sfp'];
handler.tags = ['owner'];
handler.owner = true;