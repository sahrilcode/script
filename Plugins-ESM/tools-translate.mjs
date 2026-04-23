import axios from "axios"

const langList = {
  id: "Indonesian",
  en: "English",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
  ar: "Arabic",
  hi: "Hindi",
  fr: "French",
  de: "German",
  es: "Spanish",
  ru: "Russian",
  pt: "Portuguese",
  it: "Italian",
  tr: "Turkish",
  th: "Thai",
  vi: "Vietnamese",
  ms: "Malay",
  nl: "Dutch",
  pl: "Polish"
}

const handler = async (m, { reply, quoted, args }) => {
  try {

    if (!args[0]) {
      let list = Object.entries(langList)
        .map(([k, v]) => `• ${k} = ${v}`)
        .join("\n")

      return reply(
        `🌍 *FITUR TRANSLATE*\n\n` +
        `📌 Cara pakai:\n` +
        `Reply pesan lalu ketik:\n` +
        `*.translate en*\n` +
        `*.translate id*\n\n` +
        `📚 List Bahasa:\n${list}`
      )
    }

    if (!quoted) return reply("❌ Reply pesan yang mau diterjemahkan")

    const target = args[0].toLowerCase()
    if (!langList[target]) return reply("❌ Bahasa tidak tersedia, ketik .translate untuk list")

    const text =
      quoted.text ||
      quoted.message?.conversation ||
      quoted.message?.extendedTextMessage?.text

    if (!text) return reply("❌ Pesan kosong")

    reply("🌍 Menerjemahkan...")

    const res = await axios.get("https://translate.googleapis.com/translate_a/single", {
      params: {
        client: "gtx",
        sl: "auto",
        tl: target,
        dt: "t",
        q: text
      }
    })

    const result = res.data[0].map(v => v[0]).join("")
    reply(`🌐 *Translate → ${langList[target]}*\n\n${result}`)

  } catch (e) {
    console.error(e)
    reply("❌ Gagal translate: " + e.message)
  }
}

handler.help = ["translate <lang>"]
handler.tags = ["tools"]
handler.command = ["translate", "tr"]

export default handler