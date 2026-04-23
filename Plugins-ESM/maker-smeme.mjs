import { Sticker } from "wa-sticker-formatter"
import createMemePkg from "../Library/meme.js" 
const { createMeme } = createMemePkg

const handler = async (m, { sock, quoted, text, reply }) => {
  try {
    if (!quoted) return reply("Reply foto/stiker")
    if (!text) return reply("Contoh: .smeme teks atas | teks bawah")

    let [top, bottom] = text.split("|").map(v => v?.trim() || "")

    const mime = quoted.mimetype || quoted.msg?.mimetype
    if (!mime || !mime.startsWith("image/")) return reply("Reply gambar!")

    reply("🖼️ Membuat meme...")

    const buffer = await quoted.download()
    const meme = await createMeme(buffer, top, bottom)

    const sticker = new Sticker(meme, {
      pack: "sahril muach muach🤭",
      author: "",
      type: "full",
      quality: 90
    })

    const stiker = await sticker.toMessage()
    await sock.sendMessage(m.chat, stiker, { quoted: m })

  } catch (e) {
    console.error(e)
    reply("❌ Gagal buat meme: " + e.message)
  }
}

handler.help = ["smeme <atas> | <bawah>"]
handler.tags = ["sticker"]
handler.command = ["smeme"]
handler.limit = true
export default handler