/*
 * Owner: gilangf3000
 * Project: WaPairing
 * Website: https://wapairing.dpdns.org
 * Year: 2026
 * License: Free distribution allowed with source and credit
 * Prohibited: Sell or resell
 */

import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import pino from 'pino'
import PinoPretty from 'pino-pretty'
import readline from 'readline/promises'
import { handler } from './handler.js'
import * as logger from './lib/logger.js'
import { sleep } from './lib/sleep.js'

const suppressLibsignalNoise = () => {
    const shouldIgnore = (arg) => typeof arg === 'string' && arg.startsWith('Closing session:')
    const wrap = (method) => (...args) => {
        if (args.length > 0 && shouldIgnore(args[0])) return
        method(...args)
    }

    console.log = wrap(console.log)
    console.info = wrap(console.info)
    console.warn = wrap(console.warn)
    console.error = wrap(console.error)
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (question) => rl.question(question)

const pinoStream = PinoPretty({ colorize: true, ignore: 'pid,hostname', translateTime: 'SYS:standard' })
const pinoLogger = pino({ level: 'silent' }, pinoStream)

async function connectWaPairing() {
    suppressLibsignalNoise()
    const { state, saveCreds } = await useMultiFileAuthState('session')
    const { version, isLatest } = await fetchLatestBaileysVersion()
    logger.info(`Using Baileys version ${version} isLatest ${isLatest}`)

    const socket = makeWASocket({
        version,
        printQRInTerminal: false,
        auth: state,
        logger: pinoLogger,
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        pairingCode: true,
    })

    if (!socket.authState.creds.registered) {
        try {
            logger.custom('Enter your WhatsApp number: ', 'blue')
            const phoneNumberInput = await question('')
            const phoneNumber = phoneNumberInput.replace(/[^0-9]/g, '')

            if (!phoneNumber) {
                logger.error('Invalid number.')
                process.exit(1)
            }

            logger.info('Requesting pairing code, please wait...')
            await sleep(3000)
            const code = await socket.requestPairingCode(phoneNumber, 'THEWPAIR')
            logger.success('Your Pairing Code: ' + (code?.match(/.{1,4}/g)?.join('-') || code))
        } catch (error) {
            logger.error('Failed to request pairing code.')
            process.exit(1)
        }
    }

    socket.ev.on('creds.update', saveCreds)

    socket.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut)
            logger.error('Connection closed. Reconnect:', shouldReconnect)
            if (shouldReconnect) connectWaPairing()
        } else if (connection === 'open') {
            logger.info('Connected successfully!')
        }
    })

    socket.ev.on('messages.upsert', (m) => {
        handler(m, socket)
    })
}

connectWaPairing()
