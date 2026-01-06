/*
 * Owner: gilangf3000
 * Project: WaPairing
 * Website: https://wapairing.dpdns.org
 * Year: 2026
 * License: Free distribution allowed with source and credit
 * Prohibited: Sell or resell
 */

import { createCanvas, loadImage } from 'canvas';
import { config } from '../config.js';

export async function handler({ socket, m, msg }) {
    const ownerInfo = config.owner[0];
    if (!ownerInfo) return m.reply("Owner data is not set in config.js");

    const ownerNumber = config.owner[0].jid.split('@')[0];
    const ownerJid = config.owner[0].jid;
    const ownerName = ownerInfo.name || "Owner";

    try {
        const canvas = createCanvas(800, 300);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 800, 300);

        let ppUrl;
        try {
            ppUrl = await socket.profilePictureUrl(ownerJid, 'image');
        } catch {
            ppUrl = 'https://files.catbox.moe/499dkx.jpeg';
        }

        try {
            const background = await loadImage('https://files.catbox.moe/gpnpea.png');
            ctx.drawImage(background, 0, 0, 800, 300);

            const pp = await loadImage(ppUrl);
            ctx.save();
            ctx.beginPath();
            ctx.arc(136, 150, 90.5, 0, 2 * Math.PI);
            ctx.lineWidth = 8;
            ctx.strokeStyle = 'white';
            ctx.stroke();
            ctx.clip();
            ctx.drawImage(pp, 45, 59, 181, 181);
            ctx.restore();
        } catch (err) {
            console.log('Image failed:', err.message);
        }

        ctx.save();
        ctx.translate(775, 150);
        ctx.rotate(90 * Math.PI / 180);
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#3D4CF5';
        ctx.fillText(`${config.botName}`, 0, 0);
        ctx.restore();

        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = '#3D4CF5';
        ctx.fillText(`Powered by WaPairing`, 400, 285);

        ctx.fillStyle = '#3D4CF5';
        ctx.font = 'bold 35px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ownerName, 425, 125);

        ctx.font = '25px sans-serif';
        ctx.fillStyle = '#3D4CF5';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Developer of ${config.botName}`, 425, 165);

        ctx.font = 'italic 20px sans-serif';
        ctx.fillStyle = '#3D4CF5';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ownerNumber, 425, 195);

        const buffer = canvas.toBuffer('image/png');
        await socket.sendMessage(m.chat, {
            image: buffer,
            mimetype: 'image/png',
            caption: `*Owner Information!*\nChat Owner: @${ownerNumber}`,
            mentions: [`${ownerInfo.jid}`]
        }, { quoted: msg });
    } catch (e) {
        console.error("Error creating owner card:", e);
        m.reply("Failed to create the owner info card.");
    }
}

handler.command = ['owner', 'infoowner'];
handler.tags = ["main"]
handler.owner = false