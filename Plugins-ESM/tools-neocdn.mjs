import axios from "axios"
import FormData from "form-data"

const handler = async (m, { conn }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ""

  if (!mime) return m.reply("Reply media yang ingin diupload")

  try {
    const media = await q.download()

    const form = new FormData()
    form.append("file", media, {
      filename: "upload",
      contentType: mime
    })

    const { data } = await axios.post(
      "https://neocdn.vercel.app/api/upload",
      form,
      {
        headers: {
          ...form.getHeaders()
        }
      }
    )

    if (!data.success) return m.reply("Upload gagal")

    let teks = `*Upload Berhasil*\n\n`
    teks += `URL: ${data.url}\n`
    teks += `Filename: ${data.filename}\n`
    teks += `Size: ${data.size}\n`
    teks += `Expiry: ${data.expiry}`

    await conn.sendMessage(m.chat, {
      text: teks,
      previewType: "PHOTO",
      contextInfo: {
        externalAdReply: {
          title: "NeoCDN Upload",
          body: data.filename,
          sourceUrl: data.url,
          mediaUrl: data.url,
          renderLargerThumbnail: false,
          showAdAttribution: false,
          mediaType: 1
        }
      }
    }, { quoted: m })

  } catch (e) {
    m.reply("Error upload\n" + e.message)
  }
}

handler.help = ["upload"]
handler.tags = ["tools"]
handler.command = ["neocdn"]

export default handler