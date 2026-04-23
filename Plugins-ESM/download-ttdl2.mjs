import axios from "axios"

async function getTiktokMedia(input) {
  try {
    let id = input

    if (input.includes("tiktok.com")) {
      const res = await axios.get(input, {
        maxRedirects: 0,
        validateStatus: status => status >= 200 && status < 400
      }).catch(async (err) => {
        if (err.response?.headers?.location) {
          return { headers: { location: err.response.headers.location } }
        }
        throw err
      })

      const redirectUrl = res.headers.location || input

      const match = redirectUrl.match(/video\/(\d+)/)
      if (match) {
        id = match[1]
      } else {
        id = redirectUrl.split("/").filter(Boolean).pop()
      }
    }

    const { data } = await axios.get(
      "https://api.twitterpicker.com/tiktok/mediav2",
      {
        params: { id },
        headers: { Accept: "application/json" }
      }
    )

    return {
      id: data.id,
      username: data.user?.username,
      video_nowm: data.video_no_watermark?.url,
      video_wm: data.video_watermark?.url,
      audio: data.audio?.url,
      images: data.images || null
    }

  } catch (err) {
    return { error: err.response?.data || err.message }
  }
}

const handler = async (m, { sock, text, reply }) => {
  try {
    if (!text) {
      return reply("❌ Masukkan link TikTok.\nContoh:\n.tiktokdl https://vm.tiktok.com/xxxxx/")
    }

    reply("⏳ Mengambil media TikTok...")

    const result = await getTiktokMedia(text)

    if (!result) {
      return reply("❌ Tidak ada response dari server.")
    }

    if (result.error) {
      return reply("❌ Error:\n" + JSON.stringify(result.error, null, 2))
    }

    if (result.video_nowm || result.video_wm) {
      const videoUrl = result.video_nowm || result.video_wm

      await sock.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          caption: `🎵 Username: ${result.username || "-"}\n🆔 ID: ${result.id}`,
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
                  title: `🎵 Username: ${result.username || "-"}\n🆔 ID: ${result.id}`,
                  artistAttribution: "https://whatsapp.com/channel/0029Vb6ogsdAzNbyNcFpYf2g",
                  countryBlocklist: "",
                  isExplicit: false,
                  artworkMediaKey: ""
                }
              },
              embeddedAction: true
            }
          ]
        },
        { quoted: m }
      )
      return
    }

    if (result.images && Array.isArray(result.images)) {
      for (let img of result.images) {
        await sock.sendMessage(
          m.chat,
          {
            image: { url: img.url || img },
            caption: `📸 Username: ${result.username || "-"}`,
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
                    title: `📸 Username: ${result.username || "-"}`,
                    artistAttribution: "https://whatsapp.com/channel/0029Vb6ogsdAzNbyNcFpYf2g",
                    countryBlocklist: "",
                    isExplicit: false,
                    artworkMediaKey: ""
                  }
                },
                embeddedAction: true
              }
            ]
          },
          { quoted: m }
        )
      }
      return
    }

    reply("❌ Media tidak ditemukan.")
  } catch (e) {
    console.error(e)
    reply("❌ Terjadi kesalahan: " + e.message)
  }
}

handler.help = ["tt <url>"]
handler.tags = ["downloader"]
handler.command = ["tiktok", "tt"]

export default handler