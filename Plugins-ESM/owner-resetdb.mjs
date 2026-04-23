
import fs from 'fs'

const handler = async (m, { reply, isOwner }) => {
  try {
    if (!isOwner) return reply('❌ Khusus Owner')

    const path = './data/database.json'

    const defaultDB = {
      sticker: {},
      database: {},
      game: {},
      others: {},
      users: {},
      chats: {},
      erpg: {},
      settings: {}
    }

    global.db = defaultDB

    fs.writeFileSync(path, JSON.stringify(defaultDB, null, 2))

    reply('✅ Database berhasil di-reset\n\n📂 File tidak dihapus\n🧹 Isi database dikosongkan')
  } catch (err) {
    console.error(err)
    reply('❌ Gagal reset database')
  }
}

handler.help = ['resetdb', 'resetdatabase']
handler.tags = ['owner']
handler.command = ['resetdb', 'resetdatabase']
handler.desc = 'Mengosongkan database ke default (khusus owner)'

export default handler