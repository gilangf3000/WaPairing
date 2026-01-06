/*
 * Owner: gilangf3000
 * Project: WaPairing
 * Website: https://wapairing.dpdns.org
 * Year: 2026
 * License: Free distribution allowed with source and credit
 * Prohibited: Sell or resell
 */

import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { config } from '../config.js';

export async function handler({ socket, m }) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `backup-${timestamp}.zip`
  const filepath = path.resolve(filename)

  const cmd = `
zip -r "${filename}" . \
-x "node_modules/*" \
-x "session/*" \
-x "package-lock.json" \
-x ".git/*" \
-x ".npm/*"
`.trim()

  exec(cmd, async (err) => {
    if (err) return m.reply('Backup failed. An error occurred while creating the archive.')

    try {
      if (!fs.existsSync(filepath)) return m.reply('Backup file not found.')
      const stats = fs.statSync(filepath)

      if (stats.size > 50 * 1024 * 1024) {
        fs.unlinkSync(filepath)
        return m.reply('Backup too large, maximum 50MB.')
      }

      const buffer = fs.readFileSync(filepath)
      await socket.sendMessage(
        config.owner[0].jid,
        {
          document: buffer,
          fileName: filename,
          mimetype: 'application/zip',
          caption: 'Backup completed successfully.'
        }
      )

      await m.reply('Backup completed. The archive has been sent to the owner.')
    } catch (e) {
      console.error(e)
      await m.reply('Failed to send the backup file.')
    } finally {
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
    }
  })
}

handler.command = ['backup']
handler.tags = ['owner']
handler.owner = true
