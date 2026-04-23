import fs from "fs"
import axios from "axios"
import FormData from "form-data"

async function TelegraPh(path) {
  return new Promise(async (resolve, reject) => {
    if (!fs.existsSync(path)) return reject(new Error("File not Found"))

    try {
      const form = new FormData()
      form.append("file", fs.createReadStream(path))

      const { data } = await axios({
        url: "https://telegra.ph/upload",
        method: "POST",
        headers: form.getHeaders(),
        data: form
      })

      resolve("https://telegra.ph" + data[0].src)
    } catch (err) {
      reject(new Error(String(err)))
    }
  })
}

let handler = async (m, { sock }) => {
  try {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ""

    if (!mime) throw "Reply media / dokumen"

    const media = await sock.downloadAndSaveMediaMessage(q)
    const url = await TelegraPh(media)

    await sock.sendMessage(
      m.chat,
      { text: `✅ Upload berhasil\n\n${url}` },
      { quoted: m }
    )

    fs.unlinkSync(media)
  } catch (e) {
    m.reply(`❌ Error:\n${e}`)
  }
}

handler.command = ["telegra"]

export default handler