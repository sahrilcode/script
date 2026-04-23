
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const pluginDir = path.join(__dirname)

export default async function pluginManager(m, { args, reply, quoted }) {
  const sub = args[0]?.toLowerCase()

  const files = fs.readdirSync(pluginDir).filter(f => f.endsWith(".mjs") && f !== "pluginManager.mjs")

  if (!sub) {
    if (!files.length) return reply("❌ Tidak ada plugin!")
    let text = "📜 *Daftar Plugin:*\n\n"
    files.forEach((f, i) => text += `${i + 1}. ${f}\n`)
    text += `\n📌 Contoh:\n.plugin + test.mjs (reply kode)\n.plugin - 1\n.plugin ? 1`
    return reply(text)
  }

  switch (sub) {

    case "+":
      if (!quoted || !quoted.text) return reply("❌ Reply ke pesan yang berisi kode plugin!")
      if (!args[1]) return reply("❌ Contoh: .plugin + hello.mjs")

      let newPluginName = args[1]
      if (!newPluginName.endsWith(".mjs")) newPluginName += ".mjs"

      const addPath = path.join(pluginDir, newPluginName)

      fs.writeFileSync(addPath, quoted.text)

      reply(`✅ Plugin '${newPluginName}' berhasil disimpan (overwrite aktif).`)
      break

    case "-":
      if (!args[1]) return reply("❌ Contoh: .plugin - 1")
      const delIndex = parseInt(args[1]) - 1
      if (isNaN(delIndex) || delIndex < 0 || delIndex >= files.length)
        return reply("❌ Nomor plugin tidak valid!")

      const delPath = path.join(pluginDir, files[delIndex])
      fs.unlinkSync(delPath)
      reply(`🗑 Plugin '${files[delIndex]}' berhasil dihapus!`)
      break

    case "?":
      if (!args[1]) return reply("❌ Contoh: .plugin ? 1")
      const getIndex = parseInt(args[1]) - 1
      if (isNaN(getIndex) || getIndex < 0 || getIndex >= files.length)
        return reply("❌ Nomor plugin tidak valid!")

      const getPath = path.join(pluginDir, files[getIndex])
      const content = fs.readFileSync(getPath, "utf-8")
      reply(`📄 *Isi plugin '${files[getIndex]}':*\n\n${content}`)
      break

    default:
      reply(`❌ Perintah tidak dikenal.

📌 Contoh penggunaan:
.plugin
.plugin + test.mjs (reply kode)
.plugin - 1
.plugin ? 1`)
  }
}

pluginManager.command = ["plugin"]
pluginManager.owner = true