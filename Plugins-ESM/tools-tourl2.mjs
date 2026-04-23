import axios from "axios"
import fs from "fs"
import FormData from "form-data"
import path from "path"

const handler = async (m, { sock, reply }) => {
  try {
    const quoted = m.quoted ? m.quoted : m
    const mime = quoted.mimetype || quoted.msg?.mimetype

    if (!mime) return reply("Reply media / dokumen dengan perintah .tourl")

    const loading = await sock.sendMessage(
      m.chat,
      { text: "⏫ Mengupload file..." },
      { quoted: m }
    )

    const buffer = await quoted.download()

    if (!buffer) throw "Gagal download media"

    const ext = mime.split("/")[1] || "bin"
    const fileName = `upload_${Date.now()}.${ext}`
    const filePath = path.join(process.cwd(), fileName)

    fs.writeFileSync(filePath, buffer)

    const form = new FormData()
    form.append("file", fs.createReadStream(filePath))

    const { data } = await axios.post(
      "https://upload.theresav.biz.id/upload",
      form,
      {
        headers: {
          ...form.getHeaders()
        }
      }
    )

    fs.unlinkSync(filePath)

    if (!data?.status) throw "Upload gagal"

    const directUrl = data.data?.directUrl

    await sock.sendMessage(m.chat, {
      text: `✅ *Upload Berhasil!*\n\n🔗 ${directUrl}`
    }, { quoted: m })

    await sock.sendMessage(m.chat, { delete: loading.key })

  } catch (e) {
    console.error(e)
    reply("❌ ToURL error: " + e)
  }
}

handler.help = ["tourl (reply media)"]
handler.tags = ["tools"]
handler.command = ["tourl2"]

export default handler