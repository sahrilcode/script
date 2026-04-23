import axios from "axios"
import FormData from "form-data"

const UPLOAD_URL = "https://demo.dynamsoft.com/barcode-reader-api/UploadImg.ashx"
const READ_URL = "https://demo.dynamsoft.com/barcode-reader-api/ReadBarcode.ashx"

const handler = async (m, { sock }) => {
  try {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ""

    if (!mime.startsWith("image/")) {
      return m.reply("❌ Reply gambar QR / barcode")
    }

    const buffer = await q.download()
    const fileName = `${Date.now()}.jpg`

    const formUpload = new FormData()
    formUpload.append("imgBinary", buffer.toString("base64")) // FIX UTAMA
    formUpload.append("imgName", fileName)

    const uploadRes = await axios.post(UPLOAD_URL, formUpload, {
      headers: {
        ...formUpload.getHeaders()
      }
    })

    if (!uploadRes.data.success) {
      return m.reply(`❌ Upload gagal\n${JSON.stringify(uploadRes.data)}`)
    }

    const imgName = uploadRes.data.imgName

    const formRead = new FormData()
    formRead.append("imgName", imgName)

    const readRes = await axios.post(READ_URL, formRead, {
      headers: {
        ...formRead.getHeaders()
      }
    })

    const data = readRes.data

    if (!data.success) {
      return m.reply(`❌ Scan gagal\n${data.message}`)
    }

    if (!data.results?.length) {
      return m.reply("⚠️ Barcode tidak terdeteksi")
    }

    const r = data.results[0]

    let txt = `📦 *HASIL SCAN*\n\n`
    txt += `📌 Format: ${r.formatString}\n`
    txt += `📄 Isi:\n${r.text}\n`
    txt += `🎯 Confidence: ${r.confidence}%\n`

    await sock.sendMessage(m.chat, { text: txt }, { quoted: m })

  } catch (e) {
    console.error("FULL ERROR:", e)

    let msg = `❌ ERROR\n\n`

    if (e.response) {
      msg += `Status: ${e.response.status}\n`
      msg += `Data: ${JSON.stringify(e.response.data, null, 2)}`
    } else {
      msg += e.message
    }

    m.reply(msg)
  }
}

handler.command = ["readqr"]
export default handler