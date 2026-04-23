import fs from "fs"
import path from "path"
import { exec } from "child_process"
import { tmpdir } from "os"
import { randomBytes } from "crypto"

const handler = async (m, { sock, command }) => {
  const quoted = m.quoted
  if (!quoted)
    return m.reply("Reply audio / voice note.")

  const mime = quoted.mimetype || quoted.msg?.mimetype || ""
  if (!/audio/.test(mime))
    return m.reply("File harus berupa audio.")

  const id = randomBytes(6).toString("hex")
  const inputPath = path.join(tmpdir(), `${id}.input`)
  const outputPath = path.join(tmpdir(), `${id}.output`)

  try {
    const buffer = await quoted.download()
    fs.writeFileSync(inputPath, buffer)

   
    if (command === "tovn") {
      await new Promise((resolve, reject) => {
        exec(
          `ffmpeg -i "${inputPath}" -vn -c:a libopus -b:a 128k "${outputPath}.opus" -y`,
          (err) => (err ? reject(err) : resolve())
        )
      })

      const vnBuffer = fs.readFileSync(`${outputPath}.opus`)

      await sock.sendMessage(
        m.chat,
        {
          audio: vnBuffer,
          mimetype: "audio/ogg; codecs=opus",
          ptt: true
        },
        { quoted: m }
      )

      fs.unlinkSync(`${outputPath}.opus`)
    }

    if (command === "toaudio" || command === "tomp3") {
      await new Promise((resolve, reject) => {
        exec(
          `ffmpeg -i "${inputPath}" -vn -c:a libmp3lame -b:a 192k "${outputPath}.mp3" -y`,
          (err) => (err ? reject(err) : resolve())
        )
      })

      const audioBuffer = fs.readFileSync(`${outputPath}.mp3`)

      await sock.sendMessage(
        m.chat,
        {
          audio: audioBuffer,
          mimetype: "audio/mpeg",
          ptt: false
        },
        { quoted: m }
      )

      fs.unlinkSync(`${outputPath}.mp3`)
    }

  } catch (err) {
    console.error(err)
    m.reply("❌ Gagal memproses audio.")
  } finally {
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
  }
}

handler.help = [
  "tovn (reply audio)",
  "toaudio (reply vn)",
  "tomp3 (reply vn)"
]
handler.tags = ["tools"]
handler.command = ["tovn", "toaudio", "tomp3"]

export default handler