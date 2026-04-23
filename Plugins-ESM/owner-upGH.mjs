/**
 *» Name : Upload GitHub Repo
 *» Type : Plugin ESM
 *» Creator : Kyzo Dev
 */

import axios from "axios"
import unzipper from "unzipper"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let handler = async (m, { text, sock, reply, isOwner }) => {
  if (!isOwner) return reply("❌ Owner only")
  if (!text) return reply("Contoh: .upgh namarepo\nReply file zip/html/js")

  if (!global.github?.user || !global.github?.token)
    return reply("❌ GitHub user/token belum diset")

  let repoName = text.toLowerCase().replace(/[^a-z0-9-_]/g, "")
  if (repoName.length < 3) return reply("❌ Nama repo minimal 3 karakter")

  let q = m.quoted
  if (!q) return reply("❌ Reply file!")

  await reply("⏳ Download file...")
  let media = await sock.downloadMediaMessage(q)
  if (!media) return reply("❌ Gagal download")

  let tmpDir = path.join(__dirname, "../tmp", repoName)
  fs.mkdirSync(tmpDir, { recursive: true })

  let files = []

  if (q.mimetype.includes("zip")) {
    await reply("📦 Extract ZIP...")

    const directory = await unzipper.Open.buffer(Buffer.from(media))
    for (let file of directory.files) {
      if (file.type === "File") {
        let filePath = path.join(tmpDir, file.path)
        fs.mkdirSync(path.dirname(filePath), { recursive: true })
        fs.writeFileSync(filePath, await file.buffer())
        files.push(filePath)
      }
    }

  } else {

    let filename = q.fileName || "index.html"
    let filePath = path.join(tmpDir, filename)
    fs.writeFileSync(filePath, Buffer.from(media))
    files.push(filePath)
  }

  if (!files.length) return reply("❌ Tidak ada file ditemukan")

  await reply("🚀 Create GitHub repo...")

  const headers = {
    Authorization: `token ${global.github.token}`,
    Accept: "application/vnd.github+json"
  }

  try {
    await axios.post(
      "https://api.github.com/user/repos",
      { name: repoName, auto_init: true, private: false },
      { headers }
    )
  } catch (e) {
    if (e.response?.data?.message !== "Repository creation failed.") {
      console.log("Repo create:", e.response?.data || e.message)
    }
  }

  await reply("📤 Uploading files...")

  for (let file of files) {
    let content = fs.readFileSync(file, "base64")
    let relPath = file.replace(tmpDir + "/", "")

    await axios.put(
      `https://api.github.com/repos/${global.github.user}/${repoName}/contents/${relPath}`,
      {
        message: "upload via bot",
        content
      },
      { headers }
    )
  }

  let url = `https://github.com/${global.github.user}/${repoName}`

  reply(`✅ *Upload Sukses!*\n\n📦 Repo: ${repoName}\n🌐 ${url}`)
}

handler.help = ["upgh <repo>"]
handler.tags = ["owner", "github"]
handler.command = ["upgh"]
handler.owner = true

export default handler