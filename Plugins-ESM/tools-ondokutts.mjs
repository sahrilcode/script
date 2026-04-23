import axios from "axios"
import { load } from "cheerio"
import FormData from "form-data"

async function ondoku(text, {
  voice = "en-US-AdamMultilingualNeural",
  speed = 1,
  pitch = 0
} = {}) {
  try {
    if (!text) {
      return { status: false, msg: "Text diperlukan" }
    }

    const { data: voices } = await axios.get(
      "https://raw.githubusercontent.com/rynn-k/idk/refs/heads/main/json/ondoku-voice.json",
      { timeout: 60000 }
    )

    if (!voices.includes(voice)) {
      return {
        status: false,
        msg: `Voice tidak valid.\nContoh voice:\n${voices.slice(0,5).join(", ")}`
      }
    }

    if (speed < 0.3 || speed > 4) {
      return { status: false, msg: "Speed min 0.3 max 4" }
    }

    if (pitch < -20 || pitch > 20) {
      return { status: false, msg: "Pitch min -20 max 20" }
    }

    const rynn = await axios.get("https://ondoku3.com/en", {
      timeout: 60000
    })

    const $ = load(rynn.data)
    const token = $('input[name="csrfmiddlewaretoken"]').attr("value")
    const cookie = rynn.headers["set-cookie"]?.join("; ")

    if (!token || !cookie) {
      return { status: false, msg: "Gagal mendapatkan token" }
    }

    const form = new FormData()
    form.append("text", text)
    form.append("voice", voice)
    form.append("speed", speed.toString())
    form.append("pitch", pitch.toString())

    const { data } = await axios.post(
      "https://ondoku3.com/en/text_to_speech/",
      form,
      {
        headers: {
          cookie,
          origin: "https://ondoku3.com",
          referer: "https://ondoku3.com/en/",
          "x-csrftoken": token,
          "x-requested-with": "XMLHttpRequest",
          ...form.getHeaders()
        },
        timeout: 60000
      }
    )

    return { status: true, data }

  } catch (err) {
    return { status: false, msg: err.message }
  }
}

const handler = async (m, { sock, text }) => {
  if (!text) return m.reply("Contoh:\n.ondokutts halo dunia")

  try {
    await m.reply("⏳ Membuat suara...")

    const res = await ondoku(text)

    if (!res.status) {
      return m.reply("❌ " + res.msg)
    }

    const audioUrl = res.data?.file
      ? "https://ondoku3.com" + res.data.file
      : res.data?.url

    if (!audioUrl) {
      return m.reply("❌ Gagal mendapatkan audio")
    }

    await sock.sendMessage(
      m.chat,
      {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        ptt: true
      },
      { quoted: m }
    )

  } catch (err) {
    m.reply("❌ " + err.message)
  }
}

handler.command = ["ondokutts"]
handler.help = ["ondokutts <text>"]
handler.tags = ["tools"]

export default handler