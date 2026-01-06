/*
 * Owner: gilangf3000
 * Project: WaPairing
 * Website: https://wapairing.dpdns.org
 * Year: 2026
 * License: Free distribution allowed with source and credit
 * Prohibited: Sell or resell
 */


import { config } from '../config.js';

export async function handler({ socket, m, msg, plugins }) {
    const thumbnailPath = 'https://files.catbox.moe/mv52cw.png';

    const categories = {};
    const processedCommands = new Set();

    plugins.forEach((plugin) => {
        if (processedCommands.has(plugin)) return;

        const category = Array.isArray(plugin.tags)
            ? plugin.tags[0]
            : plugin.tags || 'others';

        if (!categories[category]) categories[category] = [];

        categories[category].push(
            Array.isArray(plugin.command) ? plugin.command[0] : plugin.command
        );

        processedCommands.add(plugin);
    });

    let menuText = `Hello, *${m.pushName || 'User'}*\n`;
    menuText += `I am *${config.botName}*, your personal assistant.\n\n`;
    menuText += `*Prefix*: ${config.prefix}\n`;
    menuText += `*Mode*: ${config.selfMode ? 'Self' : 'Public'}\n\n`;

    const sortedCategories = Object.keys(categories).sort();

    for (const category of sortedCategories) {
        menuText += `┌─「 *${category.toUpperCase()}* 」\n`;
        menuText += `│ ${categories[category]
            .map(cmd => `${config.prefix}${cmd}`)
            .join('\n│ ')}\n`;
        menuText += `└────\n\n`;
    }

    menuText += `© ${config.botName} - ${new Date().getFullYear()}`;

    try {
        await socket.sendMessage(
            m.chat,
            {
                image: { url: thumbnailPath },
                caption: menuText,
                mimetype: 'image/jpeg'
            },
            { quoted: msg }
        );
    } catch (e) {
        console.error('Error sending menu:', e);
        m.reply('Failed to display menu. Make sure the file `thumbnail.png` exists.');
    }
}

handler.command = ['menu', 'help', '?'];
handler.tags = ['main'];
handler.owner = false;
