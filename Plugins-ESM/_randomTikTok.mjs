import axios from "axios"

const handler = async (m, { sock, command }) => {
  try {
    const cmd = command.toLowerCase()

    const map = {
      tiktokbocil: "bocil",
      tiktokgheayubi: "gheayubi",
      tiktokkayes: "kayes",
      tiktoknotnot: "notnot",
      tiktokpanrika: "panrika",
      tiktoksantuy: "santuy",
      tiktoktiktokgirl: "tiktokgirl",
      tiktokukhty: "ukhty"
    }

    const file = map[cmd]
    if (!file) return

    await m.reply("Loading 🔁")

    const url = `https://raw.githubusercontent.com/rzkrohan/random/refs/heads/main/${file}.json`
    const { data } = await axios.get(url)

    if (!Array.isArray(data) || !data.length) {
      return m.reply("Video tidak ditemukan.")
    }

    const random = data[Math.floor(Math.random() * data.length)]
    const videoUrl = random.url

    if (!videoUrl) return m.reply("Format JSON tidak valid.")

    await sock.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        mimetype: "video/mp4",
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

  } catch (err) {
    m.reply("Terjadi kesalahan: " + err.message)
  }
}

handler.command = [
  "tiktokbocil",
  "tiktokgheayubi",
  "tiktokkayes",
  "tiktoknotnot",
  "tiktokpanrika",
  "tiktoksantuy",
  "tiktoktiktokgirl",
  "tiktokukhty"
]

handler.tags = ["random"]
handler.help = handler.command
handler.premium = false

export default handler