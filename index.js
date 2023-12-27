const {
  default: WaPairing,
  useMultiFileAuthState,
  PHONENUMBER_MCC,
} = require('@whiskeysockets/baileys')
const pino = require('pino')
const path = require('path')
const fs = require('fs-extra')
const readline = require('readline')

// Session
global.session = 'auth'
// PairingCode
let pairingCode = true //false

// Untuk Memasukan Nomer Telepon
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})
const question = (text) => new Promise((resolve)=>rl.question(text, resolve));

// Connection
async function WaConnect() {
  const {state, saveCreds} = await useMultiFileAuthState(session);
  try{
    const socket = WaPairing({
      printQRInTerminal: !pairingCode,
      logger: pino({
        level: "silent"
      }),
      browser: ['Chrome (Linux)','',''],
      auth: state
    })
    if (pairingCode && !socket.authState.creds.registered){
      let phoneNumber;
      phoneNumber = await question('Masukan Nomer Telepon : ')
      phoneNumber = phoneNumber.replace(/[^0-9]/g, "")
      
      // Logika Cek Nomer Telepon Jika Error Menampilkan Console Log
      if (
        !Object.keys(PHONENUMBER_MCC).some((v) => phoneNumber.startsWith(v))
      ) {
        console.log('Masukan Nomer Telepon Sesuai Code Negara Anda Misalnya +628XXXXXXXX')
        phoneNumber = await question('Masukan Nomer Telepon : ')
        phoneNumber = phoneNumber.replace(/[^0-9]/g, "")
        rl.close();
      }
      
      setTimeout(async () => {
        let code = await socket.requestPairingCode(phoneNumber)
        code = code.match(/.{1,4}/g).join("-") || code;
        console.log('Code Pairing Anda : \n' + code)
      }, 3000)
    }
    
    socket.ev.on("connection.update", async ({connection, lastDisconnect})=>{
      if (connection === "open"){
        console.log('Berhasil Terhubung Ke WhatsApps!')
      } else if (
        connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode && lastDisconnect.error.output.statusCode !== 40
      ){
         WaConnect()
      }
    })
    socket.ev.on("creds.update", saveCreds)
    socket.ev.on('messages.upsert', async ({messages}) => {
      const m = messages[0];
        function reply(text) {
            socket.sendMessage(
                m.key.remoteJid,
                { text: text },
                { quoted: m }
            );
        }
        /* Menambahkan switch case command */
        /*console.log(msg);*/
        if (!m.message) return;
        const msgType = Object.keys(m.message)[0];
        const msgText =
            msgType === "conversation"
                ? m.message.conversation
                : msgType === "extendedTextMessage"
                ? m.message.extendedTextMessage.text
                : msgType === "imageMessage"
                ? m.message.imageMessage.caption
                : "";
        if (!msgText.startsWith(".")) return;
        const command = msgText.replace(/^\./g, "");
        const from = m.key.remoteJid;

        switch (command.toLowerCase()) {
            case "ping":
                reply("Pong!");
                break;
            case "image":
                socket.sendMessage(
                    from,
                    { image: { url: "./thumb.jpg" }, mimeType: "image/png", caption: '             Jangan Lupa Subscribe @gilangf3000\n                             Creator @6285786340290', mentions: ['6285786340290@s.whatsapp.net'] },
                    { quoted: m }
                );
                break;
        }
    })
  }catch(err){
    console.log(err)
  }
}

WaConnect()