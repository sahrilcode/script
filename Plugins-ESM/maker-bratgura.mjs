import { createCanvas, loadImage } from "@napi-rs/canvas"
import axios from "axios"
import https from "https"
import sharp from "sharp"

const BG_URL = "https://files.catbox.moe/trfgwb.png"

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function getBuffer(url) {
  const res = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 20000,
    httpsAgent: new https.Agent({ keepAlive: true })
  })
  return Buffer.from(res.data)
}

async function generate(text) {
  const bratURL = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}`
  const bratBuffer = await getBuffer(bratURL)

  await delay(3000)

  const bgBuffer = await getBuffer(BG_URL)

  const backgroundImg = await loadImage(bgBuffer)
  const inputImg = await loadImage(bratBuffer)

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

  const pngBuffer = canvas.toBuffer("image/png")

  const webpBuffer = await sharp(pngBuffer)
    .resize(512, 512, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .webp({ quality: 90 })
    .toBuffer()

  return webpBuffer
}

const handler = async (m, { sock, text }) => {
  if (!text) return m.reply("Contoh:\n.bratgura hi guys")

  try {
    await sock.sendMessage(m.chat, {
      react: { text: "🎨", key: m.key }
    })

    const result = await generate(text)

    await sock.sendMessage(
      m.chat,
      {
        sticker: result
      },
      { quoted: m }
    )

  } catch (err) {
    console.error(err)
    m.reply(`❌ Error:\n${err.message}`)
  }
}

handler.help = ["bratgura <text>"]
handler.tags = ["maker"]
handler.command = ["bratgura"]
handler.limit = true
export default handler