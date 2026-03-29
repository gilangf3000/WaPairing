/*
 * Owner: gilangf3000
 * Project: WaPairing
 * Website: https://wapairing.dpdns.org
 * Year: 2026
 * License: Free distribution allowed with source and credit
 * Prohibited: Sell or resell
 */

import { config } from '../config.js'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import { Buffer } from 'buffer'

function normalizeJid(jid) {
  if (!jid) return null
  return jid.replace(/:\d+(?=@)/, '')
}

function isLidJid(jid) {
  return typeof jid === 'string' && jid.endsWith('@lid')
}

function pickPreferredJid(primary, alternate) {
  if (primary && !isLidJid(primary)) return primary
  if (alternate && !isLidJid(alternate)) return alternate
  return primary || alternate || null
}

function isOwner(sender) {
  if (!sender) return false
  const senderJid = normalizeJid(sender)
  return config.owner.some(user => {
    const ownerJid = user.jid?.includes('@')
      ? user.jid
      : `${user.jid}@s.whatsapp.net`
    return normalizeJid(ownerJid) === senderJid
  })
}

async function downloadMedia(message) {
  if (!message) throw new Error('No media message to download')

  const type = Object.keys(message)[0]
  const contentType = type.replace('Message', '').toLowerCase()

  const stream = await downloadContentFromMessage(message[type], contentType)
  let buffer = Buffer.from([])
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk])
  }
  return buffer
}

export default async function serialize(m, socket) {
  if (!m) return m

  const M = {}

  if (m.key) {
    M.id = m.key.id
    M.isBaileys = M.id?.startsWith('BAE5') && M.id.length === 16

    M.chat = pickPreferredJid(m.key.remoteJid, m.key.remoteJidAlt)
    M.fromMe = m.key.fromMe
    M.isGroup = M.chat?.endsWith('@g.us')
    M.pushName = m.pushName || ''

    const participant = pickPreferredJid(
      m.key.participant || m.key.remoteJid,
      m.key.participantAlt || m.key.remoteJidAlt
    )

    M.sender = M.fromMe
      ? normalizeJid(socket.user.id)
      : normalizeJid(participant)
  }

  if (m.message) {
    M.message = m.message
    M.msg = m.message
    M.mtype = Object.keys(M.msg)[0]

    M.text =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      m.message.imageMessage?.caption ||
      m.message.videoMessage?.caption ||
      m.message.documentMessage?.caption ||
      m.message.stickerMessage?.caption ||
      ''

    M.reply = (text, chatId = M.chat, options = {}) =>
      socket.sendMessage(chatId, { text }, { quoted: m, ...options })

    M.download = async () => downloadMedia(M.message)

    const quotedCtx = m.message.extendedTextMessage?.contextInfo
    const quotedMsg = quotedCtx?.quotedMessage

    if (quotedMsg) {
      const qType = Object.keys(quotedMsg)[0]
      const qContent = quotedMsg[qType]

      M.quoted = {
        message: quotedMsg,
        mtype: qType,
        id: quotedCtx.stanzaId,
        sender: normalizeJid(quotedCtx.participant),
        mimetype: qContent?.mimetype || null,
        seconds: qContent?.seconds || 0,
        width: qContent?.width || 0,
        height: qContent?.height || 0,
        download: async () => downloadMedia(quotedMsg)
      }
    } else {
      M.quoted = null
    }
  }

  M.isOwner = isOwner(M.sender)
  M.isAdmin = false
  M.isBotAdmin = false

  if (M.isGroup) {
    const metadata = await socket.groupMetadata(M.chat).catch(() => null)
    const participants = metadata?.participants || []
    const adminIds = new Set(
      participants
        .filter(member => member.admin)
        .map(member => normalizeJid(member.id))
    )
    M.isAdmin = adminIds.has(normalizeJid(M.sender))
    M.isBotAdmin = adminIds.has(normalizeJid(socket.user?.id))
  }

  return M
}
