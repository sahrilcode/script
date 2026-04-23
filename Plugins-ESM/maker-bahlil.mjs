import Canvas from "@napi-rs/canvas"
import { Sticker } from "wa-sticker-formatter"
const { createCanvas, loadImage } = Canvas

const IMG = "https://raw.githubusercontent.com/whatsapp-media/whatsapp-media/main/uploads/1770891834482_undefined.jpg"

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ")
  const lines = []
  let line = ""

  for (let w of words) {
    const test = line + w + " "
    if (ctx.measureText(test).width > maxWidth) {
      lines.push(line.trim())
      line = w + " "
    } else {
      line = test
    }
  }
  lines.push(line.trim())
  return lines
}

function fitText(ctx, text, maxWidth, maxHeight) {
  let fontSize = 55
  let lines = []

  while (fontSize > 15) {
    ctx.font = `bold ${fontSize}px Arial`
    lines = wrapText(ctx, text, maxWidth)
    const height = lines.length * (fontSize * 1.35)
    if (height < maxHeight) break
    fontSize -= 2
  }

  return { fontSize, lines }
}

export default async function handler(m, { text, conn }) {
  if (!text) return m.reply("Contoh: .bahlil halo dunia")

  try {
    const img = await loadImage(IMG)
    const canvas = createCanvas(img.width, img.height)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(img, 0, 0)

    const board = { 
      x: 420,
      y: 415,
      w: 270,
      h: 410
    }

    ctx.fillStyle = "black"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    const { fontSize, lines } = fitText(ctx, text, board.w, board.h)
    ctx.font = `bold ${fontSize}px Arial`

    const lineHeight = fontSize * 1.35
    const totalHeight = lines.length * lineHeight

    const centerX = board.x + board.w / 2
    const centerY = board.y + board.h / 2

    let startY = centerY - totalHeight / 2 + lineHeight / 2

    lines.forEach((line, i) => {
      ctx.fillText(line, centerX, startY + i * lineHeight)
    })

    const buffer = canvas.toBuffer("image/webp")

    const sticker = new Sticker(buffer, {
      pack: "sahril muach muach🤭",
      author: "",
      type: "full", 
      quality: 90
    })

    const stiker = await sticker.toMessage()

    await conn.sendMessage(m.chat, stiker, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply("Gagal membuat stiker.")
  }
}
handler.limit = true
handler.command = ["bahlil"]