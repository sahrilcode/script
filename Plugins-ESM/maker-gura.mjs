import { createCanvas, loadImage } from "@napi-rs/canvas"
import axios from "axios"
import fs from "fs"
import https from "https"

const BG_URL = "https://raw.githubusercontent.com/whatsapp-media/whatsapp-media/main/uploads/1772558420379_undefined.png"

async function loadBackground() {
  const res = await axios.get(BG_URL, {
    responseType: "arraybuffer",
    timeout: 15000,
    httpsAgent: new https.Agent({ keepAlive: true })
  })
  return Buffer.from(res.data)
}

async function gura(imageBuffer) {
  const bgBuffer = await loadBackground()
  const backgroundImg = await loadImage(bgBuffer)
  const inputImg = await loadImage(imageBuffer)

  const canvas = createCanvas(backgroundImg.width, backgroundImg.height)
  const ctx = canvas.getContext("2d")

  ctx.drawImage(backgroundImg, 0, 0)

  const boxX = 395
  const boxY = 200
  const boxWidth = 310
  const boxHeight = 310

  const imgAspectRatio = inputImg.width / inputImg.height

  let sourceX, sourceY, sourceWidth, sourceHeight

  if (imgAspectRatio > 1) {
    sourceHeight = inputImg.height
    sourceWidth = inputImg.height
    sourceX = (inputImg.width - sourceWidth) / 2
    sourceY = 0
  } else {
    sourceWidth = inputImg.width
    sourceHeight = inputImg.width
    sourceX = 0
    sourceY = (inputImg.height - sourceHeight) / 2
  }

  ctx.drawImage(
    inputImg,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    boxX,
    boxY,
    boxWidth,
    boxHeight
  )

  return canvas.toBuffer("image/png")
}

const handler = async (m, { sock }) => {
  try {
    const quoted = m.quoted ? m.quoted : m
    const mime = (quoted.msg || quoted).mimetype || ""

    if (!/image/.test(mime)) {
      return m.reply("Balas foto dengan perintah *.togura*")
    }

    await sock.sendMessage(m.chat, {
      react: { text: "🎨", key: m.key }
    })

    const mediaPath = await sock.downloadAndSaveMediaMessage(quoted)
    const buffer = fs.readFileSync(mediaPath)

    const result = await gura(buffer)

    fs.unlinkSync(mediaPath)

    await sock.sendMessage(
      m.chat,
      {
        image: result,
        caption: "Done.",
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
    console.error(err)
    m.reply(`❌ Error:\n${err.message}`)
  }
}

handler.help = ["togura"]
handler.tags = ["maker"]
handler.command = ["togura"]
handler.limit = true
export default handler