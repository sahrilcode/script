
import axios from 'axios'

async function tiktokSearchVideo(query) {
  try {
    const res = await axios("https://tikwm.com/api/feed/search", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        cookie: "current_language=en",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
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
  } catch (err) {
    throw new Error("Gagal mencari video TikTok: " + err.message)
  }
}

const handler = async (m, { sock, text, reply, command, https }) => {
  if (!text) return reply(
    `⚠️ Eits, kakak lupa kasih kata kunci!\n` +
    `Contoh: *.${command} jj epep*`
  )

  try {

    let query = text
    let index = 0

    if (text.includes("--next")) {
      let split = text.split("--next")
      query = split[0].trim()
      index = parseInt(split[1]) || 0
    }

    const search = await tiktokSearchVideo(query)
    if (!search.videos.length) return reply("❌ Video tidak ditemukan")

    if (index >= search.videos.length) index = 0

    const v = search.videos[index]

    const caption =
`🎥 *${v.title || "No Title"}*

👤 *Username* : ${v.author.unique_id}
🕒 *Durasi* : ${v.duration} detik
❤️ *Like* : ${v.digg_count}
💬 *Comment* : ${v.comment_count}
🔁 *Share* : ${v.share_count}

🔗 https://www.tiktok.com/@${v.author.unique_id}/video/${v.video_id}`

    await sock.sendMessage(m.chat, {
      video: { url: `https://tikwm.com${v.play}` },
      mimetype: "video/mp4",
      caption,
      buttons: [
        {
          buttonId: `.${command} ${query} --next ${index + 1}`,
          buttonText: { displayText: "➡️ Next" },
          type: 1
        }
      ],
      headerType: 4,
      annotations: [
        {
          polygonVertices: [
            { x: 0, y: 0 },
            { x: 1000, y: 0 },
            { x: 1000, y: 1000 },
            { x: 0, y: 1000 }
          ],
          shouldSkipConfirmation: true,
          embeddedContent: {
            embeddedMusic: {
              musicContentMediaId: "1409620227516822",
              songId: "244215252974958",
              author: "SahrilX7",
              title: caption,
              artistAttribution: "https://whatsapp.com/channel/0029Vb6ogsdAzNbyNcFpYf2g",
              countryBlocklist: "",
              isExplicit: false,
              artworkMediaKey: ""
            }
          },
          embeddedAction: true
        }
      ]
    }, { quoted: m })

  } catch (e) {
    console.log(e)
    reply("❌ Terjadi kesalahan saat mengambil video")
  }
}

handler.command = ["tiktoksearch", "ttsearch", "tts"]
handler.tags = ["downloader"]
handler.desc = "Cari video TikTok dan kirim langsung ke chat dengan tombol Next"

export default handler