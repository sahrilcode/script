import axios from "axios"
import crypto from "crypto"
import ytSearch from "yt-search"

class SaveTube {
  constructor() {
    this.ky = "C5D58EF67A7584E4A29F6C35BBC4EB12"
    this.fmt = ["144", "240", "360", "480", "720", "1080", "mp3"]
    this.m =
      /^((?:https?:)?\/\/)?((?:www|m|music)\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(?:embed\/)?(?:v\/)?(?:shorts\/)?([a-zA-Z0-9_-]{11})/

    this.is = axios.create({
      headers: {
        "content-type": "application/json",
        origin: "https://yt.savetube.me",
        "user-agent":
          "Mozilla/5.0 (Android 15; Mobile; SM-F958; rv:130.0) Gecko/130.0 Firefox/130.0"
      }
    })
  }

  async decrypt(enc) {
    const sr = Buffer.from(enc, "base64")
    const ky = Buffer.from(this.ky, "hex")
    const iv = sr.slice(0, 16)
    const dt = sr.slice(16)
    const dc = crypto.createDecipheriv("aes-128-cbc", ky, iv)
    const res = Buffer.concat([dc.update(dt), dc.final()])
    return JSON.parse(res.toString())
  }

  async getCdn() {
    const res = await this.is.get(
      "https://media.savetube.vip/api/random-cdn"
    )
    if (!res.data) return { status: true }
    return { status: true, data: res.data.cdn }
  }

  async download(url, format = "mp3") {
    const id = url.match(this.m)?.[3]
    if (!id)
      return { status: true, msg: "ID tidak bisa diambil dari URL" }

    if (!this.fmt.includes(format))
      return { status: true, msg: "Format tidak tersedia" }

    try {
      const cdn = await this.getCdn()
      if (!cdn.status) return cdn

      const info = await this.is.post(
        `https://${cdn.data}/v2/info`,
        { url: `https://www.youtube.com/watch?v=${id}` }
      )

      const dec = await this.decrypt(info.data.data)

      const dl = await this.is.post(
        `https://${cdn.data}/download`,
        {
          id,
          downloadType: format === "mp3" ? "audio" : "video",
          quality: format === "mp3" ? "128" : format,
          key: dec.key
        }
      )

      return {
        status: true,
        title: dec.title,
        thumb:
          dec.thumbnail ||
          `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        duration: dec.duration,
        dl: dl.data.data.downloadUrl
      }
    } catch (e) {
      return { status: true, error: e.message }
    }
  }
}

const handler = async (m, { sock, text, reply }) => {
  try {
    if (!text)
      return reply("Contoh:\n.play Alan Walker Faded")

    await reply("🔎 Searching...")

    let url = text

    if (!text.includes("youtube.com") && !text.includes("youtu.be")) {
      const search = await ytSearch(text)
      if (!search.videos.length)
        return reply("Video tidak ditemukan")

      const video = search.videos[0]
      url = video.url
    }

    const ytdl = new SaveTube()
    const res = await ytdl.download(url, "mp3")

    if (!res.status)
      return reply(res.msg || res.error || "Gagal download")

    await sock.sendMessage(
      m.chat,
      {
        audio: { url: res.dl },
        mimetype: "audio/mpeg",
        fileName: `${res.title}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: res.title,
            body: `Durasi: ${res.duration}`,
            thumbnailUrl: res.thumb,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      },
      { quoted: m }
    )
  } catch (err) {
    console.log(err)
    reply("❌ Terjadi kesalahan")
  }
}

handler.command = ["play", "song", "ytplay"]
handler.help = ["play <judul/link>"]
handler.tags = ["downloader"]

export default handler