import axios from "axios"

async function ChatBible(message) {
  const response = await axios.post(
    "https://chatbible.io/chat",
    {
      message,
      session_id: Date.now().toString()
    },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  )

  return response.data.reply
}

const handler = async (m, { text, command }) => {
  const reply = (teks) => m.reply(teks)

  if (!text) {
    return reply("Contoh: .bibleai apa itu javascript?")
  }

  try {
    let hasil = await ChatBible(text)
    if (!hasil) return reply("Tidak ada respon dari Bible AI")

    reply("—BIBLE RESPON\n"+hasil)
  } catch (err) {
    reply("Error: " + err.message)
  }
}

handler.command = ["bible", "bibleai"]
handler.tags = ["ai"]
handler.help = ["bible", "bibleai"]

export default handler