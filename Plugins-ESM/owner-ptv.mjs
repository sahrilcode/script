import axios from "axios"

async function tiktokSearchVideo(query) {
  const res = await axios("https://tikwm.com/api/feed/search", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      cookie: "current_language=en",
      "User-Agent": "Mozilla/5.0"
    },
    data: new URLSearchParams({
      keywords: query,
      count: 12,
      cursor: 0,
      web: 1,
      hd: 1
    }).toString()
  })
  return res.data.data
}

const handler = async (m, { sock, text, command, reply }) => {
  if (!text) return reply(`Contoh:\n.${command} kucing | 1203630xxxx@newsletter`)

  let [query, channel] = text.split("|").map(v => v.trim())
  if (!channel) return reply("⚠️ Masukkan ID channel")

  const search = await tiktokSearchVideo(query)
  if (!search.videos.length) return reply("Video tidak ditemukan")

  const v = search.videos[0]

  await sock.sendMessage(channel, {
    video: { url: `https://tikwm.com${v.play}` },
    mimetype: "video/mp4",
    ptv: true // mode PTV
  })

  reply("✅ PTV terkirim")
}

handler.command = ["ptv"]
handler.tags = ["downloader"]
handler.owner = false

export default handler