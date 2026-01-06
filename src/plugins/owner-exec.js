/*
 * Owner: gilangf3000
 * Project: WaPairing
 * Website: https://wapairing.dpdns.org
 * Year: 2026
 * License: Free distribution allowed with source and credit
 * Prohibited: Sell or resell
 */

import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export async function handler({ m, args }) {
    const command = args.join(' ');
    if (!command) return m.reply('Please provide a shell command.');

    try {
        const { stdout, stderr } = await execPromise(command, {
            timeout: 60_000,
            maxBuffer: 1024 * 1024
        });

        const output =
            (stdout ? `${stdout}` : '') +
            (stderr ? `${stderr}` : '');

        m.reply(output.trim() || 'Command executed successfully with no output.');
    } catch (e) {
        m.reply(`${e.message || e}`);
    }
}

handler.command = ['$'];
handler.tags = ['owner'];
handler.owner = true;