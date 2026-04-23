import axios from "axios"
import * as cheerio from "cheerio"

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://www.mediafire.com/",
  "Upgrade-Insecure-Requests": "1"
}

async function mediafiredl(url) {
  const res = await axios.get(url, {
    headers,
    maxRedirects: 5
  })

  const $ = cheerio.load(res.data)

  const download =
    $("#download_link > a.input.popsok").attr("href") || null

  const filename =
    $(".dl-btn-label").first().text().trim() || null

  const filesize =
    $("#download_link > a.input.popsok")
      .text()
      .match(/\(([^)]+)\)/)?.[1] || null

  const filetype =
    $(".dl-info .filetype span")
      .first()
      .text()
      .trim() || null

  const uploaded =
    $(".details li")
      .eq(1)
      .find("span")
      .text()
      .trim() || null

  return {
    filename,
    filetype,
    filesize,
    uploaded,
    download
  }
}

const handler = async (m, { sock, text }) => {
  if (!text)
    return m.reply("Contoh:\n.mf https://www.mediafire.com/file/...")

  if (!text.includes("mediafire.com"))
    return m.reply("Link bukan MediaFire.")

  try {
    m.reply("⏳ Mengambil data...")

    const data = await mediafiredl(text)

    if (!data.download)
      return m.reply("❌ Gagal mendapatkan link download.")

    const head = await axios.head(data.download)
    const mime =
      head.headers["content-type"] || "application/octet-stream"

    const ext = data.download.split(".").pop().split("?")[0]

    let fileName = data.filename || "mediafire_file"
    if (!fileName.includes(".")) {
      fileName = `${fileName}.${ext}`
    }

    const caption = `📦 *MediaFire Downloader*

📄 Nama: ${fileName}
📁 Tipe: ${data.filetype || "-"}
📊 Size: ${data.filesize || "-"}
📅 Upload: ${data.uploaded || "-"}

🚀 Mengirim file...`

    await sock.sendMessage(
      m.chat,
      {
        document: { url: data.download },
        fileName,
        mimetype: mime,
        caption
      },
      { quoted: m }
    )
  } catch (err) {
    console.error(err)
    m.reply("❌ Gagal mendownload file.")
  }
}

handler.help = ["mf", "mfdl", "mediafire"]
handler.tags = ["downloader"]
handler.command = ["mf", "mfdl", "mediafire"]
handler.limit = true
export default handler