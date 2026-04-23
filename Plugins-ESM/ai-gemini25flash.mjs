import axios from "axios"

function generateConversationId() {
  return (
    Date.now().toString(16) +
    "-" +
    Math.random().toString(16).slice(2, 10)
  )
}

async function notegpt(message, options = {}) {
  const conversation_id = generateConversationId()

  const payload = {
    message,
    language: "auto",
    model: "gemini-2.5-flash",
    tone: "default",
    length: "moderate",
    conversation_id,
    image_urls: [],
    history_messages: [],
    chat_mode: "standard",
    ...options
  }

  const response = await axios.post(
    "https://notegpt.io/api/v2/chat/stream",
    payload,
    {
      headers: {
        "Content-Type": "application/json"
      },
      responseType: "stream"
    }
  )

  return new Promise((resolve, reject) => {
    let fullText = ""
    let buffer = ""

    response.data.on("data", chunk => {
      buffer += chunk.toString()
      const lines = buffer.split("\n")
      buffer = lines.pop()

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue
        const jsonStr = line.replace("data: ", "").trim()
        if (!jsonStr) continue

        try {
          const parsed = JSON.parse(jsonStr)

          if (parsed.text) {
            fullText += parsed.text
          }

          if (parsed.done) {
            resolve({
              conversation_id,
              text: fullText
            })
          }
        } catch {}
      }
    })

    response.data.on("end", () => {
      resolve({
        conversation_id,
        text: fullText
      })
    })

    response.data.on("error", err => reject(err))
  })
}

const handler = async (m, { text }) => {
  if (!text) return m.reply("Contoh: .gemini apa itu css?")

  try {
    const res = await notegpt(text)
    if (!res.text) return m.reply("Tidak ada respon.")
    m.reply("—GEMINI RESPON\n"+res.text)
  } catch (err) {
    m.reply(`❌ Error:\n${err.response?.data?.message || err.message}`)
  }
}

handler.help = ["gemini <text>"]
handler.tags = ["ai"]
handler.command = ["gemini", "Gemini"]

export default handler