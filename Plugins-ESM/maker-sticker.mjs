import fs from "fs"

const handler = async (m, { sock, quoted, reply }) => {
  try {
    if (!quoted) return reply("Reply foto / video!")
    const mime = quoted.mimetype || quoted.msg?.mimetype
    if (!/image|video/.test(mime))
      return reply("Kirim foto nya!")
    if (/video/.test(mime)) {
      const seconds = quoted.msg?.seconds || quoted.msg?.duration || 0
      if (seconds > 15)
        return reply("Durasi video maksimal 15 detik!")
    }
    const mediaPath = await sock.downloadAndSaveMediaMessage(quoted)
    await sock.sendImageAsSticker(
      m.chat,
      mediaPath,
      m,
      {
        packname: `sahril muach muach🤭`,
        author: ""
      }
    )
    fs.unlinkSync(mediaPath)
  } catch (e) {
    console.error(e)
    reply("❌ Gagal membuat sticker: " + e.message)
  }
}
handler.help = ["sticker (reply media)"]
handler.tags = ["sticker"]
handler.command = ["sticker", "stiker", "s", "sgif"]

export default handler