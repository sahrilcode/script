import axios from "axios"
import FormData from "form-data"

const API_KEY = "AIzaBj7z2z3xBjsk"

const handler = async (m, { sock }) => {
  try {
    if (!m.quoted) {
      return m.reply("Reply media yang ingin diupload.")
    }

    const quoted = m.quoted
    const mime = quoted.mimetype || quoted.msg?.mimetype

    if (!mime) {
      return m.reply("Media tidak valid.")
    }

    await m.reply("⏳ Mengupload ke Termai...")

  
    const buffer = await quoted.download()
    if (!buffer) return m.reply("Gagal download media.")

    const form = new FormData()
    form.append("file", buffer, {
      filename: "file",
      contentType: mime
    })

    const response = await axios.post(
      `https://c.termai.cc/api/upload?key=${API_KEY}`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Accept: "application/json, text/plain, */*"
        }
      }
    )

    const res = response.data

    if (!res.status) {
      return m.reply("Upload gagal.")
    }

    await sock.sendMessage(
      m.chat,
      {
        text:
`✅ *Upload Berhasil*

📁 URL: ${res.path}
📦 Size: ${res.size} bytes
🧾 Mime: ${res.mimetype}`,
        contextInfo: {
          externalAdReply: {
            title: "Upload Berhasil",
            body: "Klik untuk membuka file",
            thumbnailUrl: res.path,
            sourceUrl: res.path,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      },
      { quoted: m }
    )

  } catch (error) {
    console.error(error)
    m.reply("❌ Upload gagal:\n" + (error.response?.data?.message || error.message))
  }
}

handler.help = ["termai"]
handler.tags = ["tools"]
handler.command = ["termai"]

export default handler