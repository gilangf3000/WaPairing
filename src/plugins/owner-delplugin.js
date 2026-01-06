/*
 * Owner: gilangf3000
 * Project: WaPairing
 * Website: https://wapairing.dpdns.org
 * Year: 2026
 * License: Free distribution allowed with source and credit
 * Prohibited: Sell or resell
 */

import fs from 'fs'
import path from 'path'

const pluginsDir = path.resolve('./src/plugins')

export async function handler({ m, args, prefix, command }) {
  if (!args.length) {
    return m.reply(
      `Usage: ${prefix + command} <filename>`
    )
  }

  const filename = args[0].endsWith('.js') ? args[0] : args[0] + '.js'
  const filePath = path.join(pluginsDir, filename)

  if (!fs.existsSync(filePath)) {
    return m.reply(`Plugin not found: ${filename}`)
  }

  try {
    fs.unlinkSync(filePath)
    m.reply(`Plugin deleted: ${filename}`)
  } catch (e) {
    m.reply(`Failed to delete plugin:\n${e.message}`)
  }
}

handler.command = ['delplugin', 'deleteplugin', 'rmplugin']
handler.tags = ['owner']
handler.owner = true