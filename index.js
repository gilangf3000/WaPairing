const {
  default: WaPairing,
  useMultiFileAuthState,
  PHONENUMBER_MCC,
} = require('@whiskeysockets/baileys')
const pino = require('pino')
const path = require('path')
const fs = require('fs-extra')
const readline = require('readline')
const glob = require("glob");

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
        const command = msgText.replace(/^\./g, '').trim().split(/ +/).shift().toLowerCase()
        const full_args = msgText.replace(command, '').slice(1).trim()
        const args = msgText.trim().split(/ +/).slice(1)
        const from = m.key.remoteJid;
       
        function loadPlugins() {
            const pluginFiles = glob.sync(path.join(__dirname, 'plugin', '**/*.js'));
            const plugins = {};
        
            pluginFiles.forEach((file) => {
                const plugin = require(file);
        
                // Check if plugin.cmd is an array
                if (Array.isArray(plugin.cmd)) {
                    // If it's an array, iterate through each command and add it to the plugins object
                    plugin.cmd.forEach((cmd) => {
                        plugins[cmd] = plugin;
                    });
                } else {
                    // Use plugin.cmd as a key in the plugins object
                    plugins[plugin.cmd] = plugin;
                }
            });
        
            return plugins;
        }
        
        const plugins = loadPlugins();
        
        // Check if the command exists in the plugins object
        if (Array.isArray(plugins[command])) {
            // If it's an array, you might want to handle each command in the array
            plugins[command].forEach((plugin) => {
                console.log(plugin)
            });
        } else if (plugins[command]) {
            // Execute the code for the corresponding plugin
            const {
              name,
              cmd, 
              details,
              
            } = plugins[command]
            
            const isPrivate = plugins[command].isPrivate ? plugins[command].isPrivate : false;
            const isGroup = plugins[command].isGroup ? plugins[command].isGroup : false;
            // console.log(isPrivate, from.endsWith('@g.us'))
            
            if (isPrivate === true && from.endsWith('@g.us')) {
              socket.sendMessage(from, {text :'Fitur Ini Hanya Bisa Di Gunakan Di Private!'}, {quoted: m})
              return
            }
            if(isGroup === true && from.endsWith('@s.whatsapp.net')){
              socket.sendMessage(from, {text : 'Fitur Ini Hanya Bisa Di Gunakan Di Group!'}, {quoted: m})
              return
            }
            // console.log(from)

            plugins[command].code({
              socket,
              details,
              from,
              m,
              full_args,
              args
            })
            // console.log(plugins[command])
        } else {
            console.log('Command Not Found!');
        }
    

        // switch (command.toLowerCase()) {
//             case "ping":
//                 reply("Pong!");
//                 break;
//             case "image":
//                 socket.sendMessage(
//                     from,
//                     { image: { url: "./thumb.jpg" }, mimeType: "image/png", caption: '             Jangan Lupa Subscribe @gilangf3000\n                             Creator @6285786340290', mentions: ['6285786340290@s.whatsapp.net'] },
//                     { quoted: m }
//                 );
//                 break;
//         }
    })
  }catch(err){
    console.log(err)
  }
}

WaConnect()
