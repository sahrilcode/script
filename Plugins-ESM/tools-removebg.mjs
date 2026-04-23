import axios from "axios"

const handler = async (m, { sock, quoted, reply, UpGithuB }) => {
  try {
    if (!quoted) return reply("❌ Reply foto")

    const mime = quoted.mimetype || quoted.msg?.mimetype
    if (!mime || !mime.startsWith("image/")) {
      return reply("❌ Media harus FOTO")
    }

    reply("⏳ Upload ke GitHub...")

    const media = await sock.downloadAndSaveMediaMessage(quoted)
    const githubUrl = await global.UpGithuB(media)

    reply("🎨 Remove background diproses...")

    const api = `${global.fapi}/removebg?url=${encodeURIComponent(githubUrl)}`
    const res = await axios.get(api)

    if (!res.data?.status) throw new Error("API gagal")

    const img = await axios.get(res.data.url, { responseType: "arraybuffer" })

    await sock.sendMessage(m.chat, {
      image: Buffer.from(img.data),
      caption: "✅ Background berhasil dihapus",
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
              title: "✅ Background berhasil dihapus",
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
    console.error(e)
    reply("❌ Error: " + e.message)
  }
}

handler.help = ["removebg", "rbg", "removebackground"]
handler.tags = ["tools"]
handler.command = ["removebg", "rbg", "removebackground"]

export default handler