
import ytSearch from "yt-search"
import baileys from "@whiskeysockets/baileys"

const {
  proto,
  generateWAMessageFromContent,
  prepareWAMessageMedia
} = baileys

const handler = async (m, { sock, text }) => {
  try {
    if (!text)
      return m.reply("Contoh: .yts kucing")

    const res = await ytSearch(text)
    const videos = res.videos.slice(0, 10)

    if (!videos.length)
      return m.reply("Video tidak ditemukan")

    let cards = []

    for (let v of videos) {
      cards.push({
        header: proto.Message.InteractiveMessage.Header.create({
          ...(await prepareWAMessageMedia(
            { image: { url: v.thumbnail } },
            { upload: sock.waUploadToServer }
          )),
          gifPlayback: false,
          hasMediaAttachment: true
        }),
        body: {
          text: `🎬 ${v.title}\n⏱ ${v.timestamp || "-"}`
        },
        nativeFlowMessage: {
          buttons: [
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "🎵 Download MP3",
                id: `.ytmp3 ${v.url}`
              })
            },
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "🎬 Download MP4",
                id: `.ytmp4 ${v.url}`
              })
            }
          ]
        }
      })
    }

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              body: {
                text: `🔎 *YouTube Search*\n\nQuery: *${text}*\n\nGeser slide untuk pilih video 👉`
              },
              footer: {
                text: "YouTube Search"
              },
              carouselMessage: {
                cards,
                messageVersion: 1
              }
            }
          }
        }
      },
      {}
    )

    await sock.relayMessage(
      msg.key.remoteJid,
      msg.message,
      { messageId: msg.key.id }
    )

  } catch (err) {
    console.log(err)
    m.reply("❌ Terjadi kesalahan saat mencari video.")
  }
}

handler.command = ["ytsearch", "youtubesearch", "yts"]
handler.tags = ["search"]
handler.desc = "Cari video YouTube dengan carousel"

export default handler