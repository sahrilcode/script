import { downloadContentFromMessage } from "@whiskeysockets/baileys"
import { createCanvas, loadImage } from "@napi-rs/canvas"

async function streamToBuffer(stream) {
  const chunks = []
  for await (const chunk of stream) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

const handler = async (m, { sock, reply }) => {
  try {
    if (!m.quoted)
      return reply("❌ Reply stiker foto yang ingin dijadikan gambar!")

    const mime = m.quoted.mimetype || ""

    if (!/webp/.test(mime))
      return reply("❌ Itu bukan stiker!")

    if (m.quoted.msg?.isAnimated)
      return reply("❌ Stiker animasi tidak didukung!")

    const stream = await downloadContentFromMessage(
      m.quoted.msg || m.quoted,
      "sticker"
    )

    const buffer = await streamToBuffer(stream)

    const img = await loadImage(buffer)

    const canvas = createCanvas(img.width, img.height)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(img, 0, 0)

    const result = canvas.toBuffer("image/png")

    await sock.sendMessage(
      m.chat,
      {
        image: result,
        caption: "✅ Berhasil convert sticker ke image",
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
    console.error("❌ ToImage Error:", err)
    reply("❌ Gagal convert stiker!")
  }
}

handler.help = ["toimage", "toimg"]
handler.tags = ["sticker"]
handler.command = ["toimage", "toimg"]

export default handler