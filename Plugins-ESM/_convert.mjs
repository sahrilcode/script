import fs from "fs"
import { exec } from "child_process"
import { tmpdir } from "os"
import path from "path"

const effects = {
  bass: '-af equalizer=f=54:width_type=o:width=2:g=20',
  blown: '-af acrusher=.1:1:64:0:log',
  deep: '-af atempo=4/4,asetrate=44500*2/3',
  earrape: '-af volume=12',
  fast: '-filter:a "atempo=1.63,asetrate=44100"',
  fat: '-filter:a "atempo=1.6,asetrate=22100"',
  nightcore: '-filter:a "atempo=1.06,asetrate=44100*1.25"',
  reverse: '-filter_complex "areverse"',
  robot: '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"',
  slow: '-filter:a "atempo=0.7,asetrate=44100"',
  smooth: '-filter:v "minterpolate=\'mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120\'"',
  tupai: '-filter:a "atempo=0.5,asetrate=65100"'
}

function getRandom(ext) {
  return path.join(tmpdir(), `${Date.now()}${ext}`)
}

const handler = async (m, { sock, command }) => {
  try {
    const quoted = m.quoted ? m.quoted : m
    const mime = (quoted.msg || quoted).mimetype || ""

    if (!/audio/.test(mime)) {
      return m.reply(`Balas audio dengan command *${command}*`)
    }

    const set = effects[command]
    if (!set) return

    await sock.sendMessage(m.chat, {
      react: { text: "⏱️", key: m.key }
    })

    const mediaPath = await sock.downloadAndSaveMediaMessage(quoted)
    const outputPath = getRandom(".mp3")

    exec(`ffmpeg -i "${mediaPath}" ${set} "${outputPath}"`, async (err) => {
      try {
        fs.unlinkSync(mediaPath)
      } catch {}

      if (err) {
        console.error(err)
        return m.reply("❌ Gagal memproses audio.")
      }

      const buffer = fs.readFileSync(outputPath)

      await sock.sendMessage(
        m.chat,
        {
          audio: buffer,
          mimetype: "audio/mpeg"
        },
        { quoted: m }
      )

      try {
        fs.unlinkSync(outputPath)
      } catch {}
    })

  } catch (err) {
    console.error(err)
    m.reply("❌ Terjadi kesalahan.")
  }
}

handler.help = [
  "bass", "blown", "deep", "earrape", "fast", "fat",
  "nightcore", "reverse", "robot", "slow", "smooth", "tupai"
]

handler.tags = ["audio"]
handler.command = Object.keys(effects)
handler.limit = true

export default handler