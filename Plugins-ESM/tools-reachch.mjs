import axios from "axios"

const apiKey = "8e17c36ba5ac5013d6a5e4f18c75215ab1730f8b1b27005ab62fe99d7ed9892a"
const token = ""

async function reactChannel(link) {
  try {
    const { data } = await axios.post(
      `https://back.asitha.top/api/channel/react-to-post?apiKey=${apiKey}`,
      {
        post_link: link,
        reacts: "🦄,🩷,🌼,🤍,💗"
      },
      {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }
    )

    return data
  } catch (e) {
    throw e.response?.data || e
  }
}

let handler = async (m, { text }) => {
  if (!text) return m.reply("contoh:\n.rch https://whatsapp.com/channel/xxxx/123")

  try {
    const res = await reactChannel(text)

    m.reply(`✅ ${res.message}\n${res.botResponse}`)
  } catch (e) {
    m.reply("❌ Error:\n" + JSON.stringify(e, null, 2))
  }
}

handler.command = ["rch"]

export default handler