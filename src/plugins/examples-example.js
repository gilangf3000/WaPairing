/*
 * Owner: gilangf3000
 * Project: WaPairing
 * Website: https://wapairing.dpdns.org
 * Year: 2026
 * License: Free distribution allowed with source and credit
 * Prohibited: Sell or resell
 */

/**
 * This is an example plugin file.
 * Use this as a template for creating new commands.
 */

export async function handler({
    socket,   // The Baileys socket connection
    m,        // The message object (contains text, sender, etc.)
    args,     // Array of arguments (words after command)
    prefix,   // The prefix used (e.g. '.')
    command   // The command name used
}) {
    // Your code goes here
    // Example: Reply to the user
    m.reply('This is an example command.');
}

// The commands that trigger this plugin (can be string or array)
handler.command = ['example'];

// The category for the menu
handler.tags = ['examples'];

// If true, only the owner can use this command
handler.owner = false;