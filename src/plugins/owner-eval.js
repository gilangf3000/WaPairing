/*
 * Owner: gilangf3000
 * Project: WaPairing
 * Website: https://wapairing.dpdns.org
 * Year: 2026
 * License: Free distribution allowed with source and credit
 * Prohibited: Sell or resell
 */

import syntaxError from 'syntax-error';
import { format } from 'util';
import { config } from '../config.js';

class CustomArray extends Array {
  constructor(...args) {
    if (typeof args[0] === 'number') {
      super(Math.min(args[0], 10000));
    } else {
      super(...args);
    }
  }
}

export async function handler({ socket, m, msg, args }) {
  const code = args.join(' ');
  if (!code) return m.reply("Please enter the JavaScript code you want to execute.");

  const sock = socket;
  let _return;
  let _syntax = '';

  const _text = (m.text.startsWith(config.prefix + '>') ? 'return ' : '') + code;

  const print = (...text) =>
    socket.sendMessage(m.chat, { text: format(...text) }, { quoted: msg });

  try {
    let i = 15;
    const f = { exports: {} };

    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const exec = new AsyncFunction(
      'print', 'm', 'msg', 'handler', 'require', 'sock', 'CustomArray',
      'process', 'args', 'config', 'module', 'exports', _text
    );

    _return = await exec.call(
      sock,
      (...args) => {
        if (--i < 1) return; // stop printing after 15 times
        console.log(...args);
        return print(...args);
      },
      m,
      msg,
      handler,
      typeof require !== 'undefined' ? require : undefined,
      sock,
      CustomArray,
      process,
      args,
      config,
      f,
      f.exports
    );

  } catch (e) {
    const err = syntaxError(_text, 'Execution Function', {
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true,
      sourceType: 'module'
    });
    if (err) _syntax = '```' + err + '```\n\n';
    _return = e;
  } finally {
    await socket.sendMessage(m.chat, { text: _syntax + format(_return) }, { quoted: msg });
  }
}

handler.command = ['>', '=>'];
handler.tags = ['owner'];
handler.owner = true;