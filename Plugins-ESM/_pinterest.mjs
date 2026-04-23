import axios from "axios"

async function pinterestDownloader(url) {
  try {
    const params = new URLSearchParams({
      action: "process_pinterest_url",
      url,
      nonce: "89bdd9a2af"
    })

    const { data } = await axios.post(
      "https://pintdownloader.com/wp-admin/admin-ajax.php",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "Accept": "*/*",
          "X-Requested-With": "XMLHttpRequest",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36",
          "Referer": "https://pintdownloader.com/"
        }
      }
    )

    return data
  } catch (e) {
    return { success: false }
  }
}

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply("Contoh:\n.pindl https://pin.it/xxxx")

  let res = await pinterestDownloader(text)

  if (!res || !res.success) return m.reply("Gagal mengambil media.")

  let media = res.data.mediaUrl
  let isVideo = res.data.isVideo

  if (isVideo) {
    await conn.sendMessage(
      m.chat,
      { video: { url: media }, caption: "Pinterest Downloader",
    annotations: [
      {
        polygonVertices: [
          { x: 0, y: 0 },
          { x: 1000, y: 0 },
          { x: 1000, y: 1000 },
          { x: 0, y: 1000 }
        ],
        embeddedAction: true
      }
    ]
  },
      { quoted: m }
    )
  } else {
    await conn.sendMessage(
      m.chat,
      { image: { url: media }, caption: "Pinterest Downloader",
    annotations: [
      {
        polygonVertices: [
          { x: 0, y: 0 },
          { x: 1000, y: 0 },
          { x: 1000, y: 1000 },
          { x: 0, y: 1000 }
        ],
        embeddedAction: true
      }
    ]
  },
      { quoted: m }
    )
  }
}

handler.help = ["pindl", "pinterest"]
handler.tags = ["downloader"]
handler.command = ["pindl", "pinterest"]

export default handler