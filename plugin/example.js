module.exports = {
  name: 'example', // Untuk nama menunya
  cmd: ['example'], // Untuk Menambah beberapa cmd dalam 1 fitur
  details: {}, // Belum Tersedia Cuman Klo dh Paham pakai aja
  isGroup: true, // gunakan satu satu kalo ingin isGroup Jangan Pakai is Private
  code: async ({ socket, from, m }) => {
    socket.sendMessage(from, {text: 'ini adalah example'}, {qouted: m})
    //masukan fitur disini terserah lu 
  }
}
