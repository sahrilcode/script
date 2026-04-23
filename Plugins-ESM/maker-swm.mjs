import { Sticker } from "wa-sticker-formatter"

const handler = async (m, { sock, quoted, text, reply }) => {
  try {
    if (!quoted) return reply("Reply sticker dengan command:\n.swm Sahril Ganteng🌜")

    const mime = quoted.mimetype || quoted.msg?.mimetype
    if (!/webp/.test(mime))
      return reply("Reply sticker!")

    const packname = text?.trim()
    if (!packname) return reply("Contoh: .swm Sahril Ganteng🌜")

    const buffer = await quoted.download()

    const sticker = new Sticker(buffer, {
      pack: packname,
      author: "", // ← author dikosongkan
      type: "full",
      quality: 100
    })

    const result = await sticker.toBuffer()

    await sock.sendMessage(
      m.chat,
      { sticker: result },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    reply("❌ Gagal membuat sticker wm: " + e.message)
  }
}

handler.help = ["swm <packname> (reply sticker)"]
handler.tags = ["sticker"]
handler.command = ["stikerwm", "swm"]

export default handler