
import fetch from "node-fetch"

const handler = async (m, { sock, text, reply }) => {
  try {
    if (!text)
      return reply("Contoh:\n.lirik falling")

    await sock.sendMessage(m.chat, {
      react: { text: "🔎", key: m.key }
    })

    const url = `${global.fapi}/lyrics?q=${encodeURIComponent(text.trim())}`

    const res = await fetch(url, {
      headers: {
        "accept": "application/json"
      }
    })

    if (!res.ok) {
      const errText = await res.text()
      return reply(`❌ API Error:\n${errText}`)
    }

    const json = await res.json()

    if (!json?.status || !json?.result) {
      return reply("❌ Lirik tidak ditemukan atau API tidak merespon dengan benar.")
    }

    const data = json.result

    const caption = `
🎵 *${data.title}*
👤 ${data.artist}
💿 ${data.album}
🎼 ${data.genre}

📖 *Lirik:*
${data.lyrics.slice(0, 3500)}
${data.lyrics.length > 3500 ? "\n\n... (terpotong)" : ""}
`.trim()

    await sock.sendMessage(
      m.chat,
      {
        text: caption,
        contextInfo: {
          externalAdReply: {
            title: `${data.title} - ${data.artist}`,
            body: data.album,
            thumbnailUrl: data.cover?.medium || data.cover?.large,
            mediaType: 1,
            renderLargerThumbnail: true,
            sourceUrl: data.share_url
          }
        }
      },
      { quoted: m }
    )

    await sock.sendMessage(m.chat, {
      react: { text: "✅", key: m.key }
    })

  } catch (err) {
    console.log(err)
    reply("❌ Terjadi kesalahan saat mengambil lirik.")
    await sock.sendMessage(m.chat, {
      react: { text: "❌", key: m.key }
    })
  }
}

handler.command = ["lirik", "lyrics"]
handler.tags = ["search"]
handler.desc = "Cari lirik lagu"

export default handler