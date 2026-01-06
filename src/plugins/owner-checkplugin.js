/*
 * Owner: gilangf3000
 * Project: WaPairing
 * Website: https://wapairing.dpdns.org
 * Year: 2026
 * License: Free distribution allowed with source and credit
 * Prohibited: Sell or resell
 */

export async function handler({ m, plugins, pluginErrors }) {
  if (!plugins || plugins.size === 0) {
    return m.reply('No plugins loaded.')
  }

  const tagMap = new Map()
  const used = new Set()

  for (const plugin of plugins.values()) {
    if (!plugin.command) continue

    const mainCommand = Array.isArray(plugin.command)
      ? plugin.command[0]
      : plugin.command

    if (used.has(mainCommand)) continue
    used.add(mainCommand)

    const tags = Array.isArray(plugin.tags) && plugin.tags.length
      ? plugin.tags
      : ['untagged']

    for (const tag of tags) {
      if (!tagMap.has(tag)) tagMap.set(tag, [])
      tagMap.get(tag).push(mainCommand)
    }
  }

  let text = 'Plugin Status\n\n'
  text += `Total Tags : ${tagMap.size}\n`
  text += `Total Commands : ${used.size}\n\n`

  let i = 1
  for (const [tag, commands] of tagMap.entries()) {
    text += `${i}. ${tag}\n`
    for (const cmd of commands) {
      text += `   └─ ${cmd}\n`
    }
    text += '\n'
    i++
  }

  if (pluginErrors && pluginErrors.length) {
    text += 'Plugin Errors\n\n'
    let j = 1
    for (const file of pluginErrors) {
      text += `${j}. ${file}\n`
      j++
    }
  }

  m.reply(text.trim())
}

handler.command = ['cekplugin', 'plg']
handler.tags = ['owner']
handler.owner = true