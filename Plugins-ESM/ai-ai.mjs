import axios from "axios"
import { randomUUID } from "crypto"

async function AiChat(message) {
  const requestData = {
    message,
    language: "auto",
    model: "gpt-4.1-mini",
    tone: "default",
    length: "moderate",
    conversation_id: randomUUID(),
    image_urls: [],
    chat_mode: "standard"
  }

  const response = await axios.post(
    "https://notegpt.io/api/v2/chat/stream",
    requestData,
    {
      headers: {
        "Content-Type": "application/json"
      },
      responseType: "stream"
    }
  )

  let fullText = ""

  return new Promise((resolve, reject) => {

    response.data.on("data", (chunk) => {
      const raw = chunk.toString()
      const lines = raw.split("\n").filter(v => v.trim() !== "")

      for (const line of lines) {
        if (!line.startsWith("data:")) continue

        const jsonStr = line.slice(5).trim()

        try {
          const parsed = JSON.parse(jsonStr)

          if (parsed.done) {
            resolve(fullText)
            return
          }

          if (parsed.text !== undefined) {
            fullText += parsed.text
          }

        } catch {}
      }
    })

    response.data.on("end", () => resolve(fullText))
    response.data.on("error", reject)

  })
}

let handler = async (m, { text, command, usedPrefix, reply, sock }) => {
  try {

    if (!text) {
      return reply(`Contoh:\n${usedPrefix + command} hai`)
    }

    await sock.sendMessage(m.chat, {
      react: { text: "🤖", key: m.key }
    })

    const res = await AiChat(text)

    if (!res) throw "Tidak ada response dari AI"

    reply("—AI RESPON\n"+res)

  } catch (err) {

    console.error("AI ERROR:", err)

    reply(`❌ Error:\n${err.message || err}`)
  }
}

handler.help = ["ai tanya"]
handler.tags = ["ai"]
handler.command = /^ai$/i

export default handler