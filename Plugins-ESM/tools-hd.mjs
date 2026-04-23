import fs from 'fs'
import path from 'path'
import axios from 'axios'

const handler = async (m, { sock, reply, quoted }) => {
  try {
    if (!quoted) return reply("❌ Reply foto atau video")

    const mime = quoted.mimetype || quoted.msg?.mimetype
    if (!mime) return reply("❌ Tidak bisa deteksi tipe media")

    if (!mime.startsWith('image/') && !mime.startsWith('video/')) {
      return reply("❌ Media harus foto atau video")
    }

    reply("⏳ Sedang upload ke server...")

    const media = await sock.downloadAndSaveMediaMessage(quoted)
    const githubUrl = await global.UpGithuB(media)

    if (mime.startsWith('image/')) {

      const response = await axios.get(
        `${global.fapi}/hdv3?image=${encodeURIComponent(githubUrl)}`,
        { responseType: 'arraybuffer' }
      )
      await sock.sendMessage(m.chat, { image: Buffer.from(response.data), caption: '✅ Foto HD',
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
            title: '✅ Foto HD',
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

    } else if (mime.startsWith('video/')) {

      const res = await axios.get(`${global.fapi}/hdvid?url=${encodeURIComponent(githubUrl)}`)
      if (!res.data?.status) throw new Error("Gagal memproses HD video")

      const videoBuff = Buffer.from(await axios.get(res.data.result.download_url, { responseType: 'arraybuffer' }).then(r => r.data))
      await sock.sendMessage(m.chat, { video: videoBuff, caption: '✅ Video HD',
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
            title: '✅ Video HD',
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
    }

  } catch (err) {
    console.error(err)
    reply("❌ Gagal memproses media HD: " + err.message)
  }
}

handler.help = ['hd']
handler.tags = ['tools']
handler.command = ['hd']
handler.limit = true
export default handler