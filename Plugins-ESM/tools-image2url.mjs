/* 
  Name : IMAGE2URL
  Type : ESM Plugin
  Base : https://www.image2url.com
  Credit : Kyzo Yamada
*/
import axios from "axios"
import FormData from "form-data"

const handler = async (m, { sock, reply }) => {
  try {
    const quoted = m.quoted ? m.quoted : m
    const mime = quoted.mimetype || quoted.msg?.mimetype

    if (!mime) return reply("Reply media/image/dokumen dengan perintah .tourl")

    const loading = await sock.sendMessage(
      m.chat,
      { text: "⏫ Mengupload file..." },
      { quoted: m }
    )

    const buffer = await quoted.download()
    if (!buffer) throw "Gagal download media"

    const form = new FormData()
    form.append("file", buffer, {
      filename: `file.${mime.split("/")[1] || "bin"}`,
      contentType: mime
    })

    const { data } = await axios.post(
      "https://www.image2url.com/api/upload",
      form,
      {
        headers: {
          ...form.getHeaders()
        }
      }
    )

    if (!data?.success) throw "Upload gagal"

    const url = data.url
    const filename = data.filename
    const originalName = data.originalName

    await sock.sendMessage(m.chat, {
      text: `✅ Upload berhasil!\n\n🔗 URL: ${url}\n📄 Filename: ${filename}\n📝 Original Name: ${originalName}`
    }, { quoted: m })

    await sock.sendMessage(m.chat, { delete: loading.key })

  } catch (e) {
    console.error(e)
    reply("❌ ToURL error: " + e)
  }
}

handler.help = ["tourl (reply media/image)"]
handler.tags = ["tools"]
handler.command = ["img2url"]

export default handler