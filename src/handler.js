/*
 * Owner: gilangf3000
 * Project: WaPairing
 * Website: https://wapairing.dpdns.org
 * Year: 2026
 * License: Free distribution allowed with source and credit
 * Prohibited: Sell or resell
 */

import fs from 'fs'
import { readdir } from 'fs/promises'
import path from 'path'
import serialize from './lib/serialize.js'
import { config } from './config.js'
import * as logger from './lib/logger.js'

const plugins = new Map()
const pluginsDir = path.resolve('./src/plugins')

async function loadPlugins() {
  plugins.clear()

  let loaded = 0
  let failed = 0
  let files = []

  try {
    files = await readdir(pluginsDir)
  } catch (e) {
    logger.error('Failed to read plugins directory:', e)
    return
  }

  for (const file of files) {
    if (!file.endsWith('.js')) continue

    const pluginPath = path.join(pluginsDir, file)

    try {
      const module = await import(`file://${pluginPath}?update=${Date.now()}`)
      const plugin = module.handler

      if (!plugin || !plugin.command) {
        continue
      }

      const commands = Array.isArray(plugin.command)
        ? plugin.command
        : [plugin.command]

      for (const cmd of commands) {
        plugins.set(cmd.toLowerCase(), plugin)
      }

      loaded++
    } catch (e) {
      failed++
      logger.error(`Failed to load plugin: ${file}`, e)
    }
  }

  logger.info(
    `Plugins loaded: ${loaded}, failed: ${failed}, total commands: ${plugins.size}`
  )
}

export async function reloadPlugins() {
  await loadPlugins()
  logger.info('Plugins manually reloaded')
}

loadPlugins()

export async function handler(m, socket) {
  if (m.type !== 'notify') return

  const msg = m.messages?.[0]
  if (!msg?.message) return

  const M = await serialize(msg, socket)

  if (!M.isOwner && config.bannedUsers.has(M.sender)) return
  if (M.isGroup && config.bannedGroups.has(M.chat)) return
  if (config.selfMode && !M.isOwner) return

  const prefix = config.prefix
  if (!M.text || !M.text.startsWith(prefix)) return

  const body = M.text.slice(prefix.length).trim()
  if (!body) return

  const [command, ...args] = body.split(/\s+/)
  const plugin = plugins.get(command.toLowerCase())
  if (!plugin) return

  if (plugin.owner && !M.isOwner) {
    return M.reply('This command is for the bot owner only.')
  }

  try {
    logger.info(`[CMD] ${command} by ${M.sender.split('@')[0]}`)
    await plugin({
      socket,
      m: M,
      msg,
      args,
      plugins,
      prefix,
      command
    })
  } catch (e) {
    logger.error(`Command error (${command}):`, e)
    M.reply(`Error in command *${command}*:\n${e.message}`)
  }
}
