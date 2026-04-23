
import fs from 'fs'
import path from 'path'

const handler = async (m, { reply, isOwner }) => {
  try {
    if (!isOwner) return reply('❌ Khusus Owner')

    const sessionFolder = './session'

    if (!fs.existsSync(sessionFolder)) {
      return reply('❌ Folder session tidak ditemukan.')
    }

    const files = fs.readdirSync(sessionFolder)
    let deletedFiles = 0

    for (const file of files) {
      if (file !== 'creds.json') {
        const filePath = path.join(sessionFolder, file)
        fs.unlinkSync(filePath)
        deletedFiles++
      }
    }

    reply(`✅ Berhasil membersihkan session\n🗑️ File dihapus: ${deletedFiles}\n📄 creds.json tetap aman`)
  } catch (err) {
    console.error(err)
    reply('❌ Gagal membersihkan session')
  }
}

handler.help = ['clearsession']
handler.tags = ['owner']
handler.command = ['clearsession']
handler.desc = 'Hapus semua file session kecuali creds.json (khusus owner)'

export default handler