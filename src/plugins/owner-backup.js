/*
 * Owner: gilangf3000
 * Project: WaPairing Bot
 * Website: https://wapairing.dpdns.org
 * Year: 2026
 * License: Free distribution allowed with source and credit
 * Prohibited: Sell or resell
 */

import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

export async function handler({ socket, m, prefix, command }) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `backup-${timestamp}.zip`
  const filepath = path.resolve(filename)

  const cmd = `
zip -r ${filename} . \
-x "node_modules/*" \
-x "session/*" \
-x "package-lock.json"
`.trim()

  exec(cmd, async (err) => {
    if (err) {
      return m.reply(
        'Backup failed.\nAn error occurred while creating the archive.'
      )
    }

    await socket.sendMessage(
      m.sender,
      {
        document: fs.readFileSync(filepath),
        fileName: filename,
        mimetype: 'application/zip',
        caption:
          'Backup completed successfully.'
      }
    )

    fs.unlinkSync(filepath)

    await m.reply(
      'Backup completed.\nThe archive has been sent to the owner.'
    )
  })
}

handler.command = ['backup']
handler.tags = ['owner']
handler.owner = true