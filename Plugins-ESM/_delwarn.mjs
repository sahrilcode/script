import fs from "fs"
import path from "path"

const filePath = "./data/warn.json"

const handler = async (m, { args, isOwner, isAdmins, groupMetadata }) => {

  if (!isOwner && !isAdmins)
    return m.reply("❌ Hanya owner/admin yang bisa menggunakan perintah ini.")

  if (!m.isGroup)
    return m.reply("Perintah ini hanya bisa digunakan di grup.")

  let target =
    m.quoted?.sender ||
    m.mentionedJid?.[0]

  if (!target)
    return m.reply("Reply atau tag user yang ingin dihapus warn-nya.")

  if (!fs.existsSync(filePath))
    return m.reply("File warn.json tidak ditemukan.")

  let data = JSON.parse(fs.readFileSync(filePath))

  if (!data[target])
    return m.reply("User tersebut tidak memiliki warn.")

  delete data[target]

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

  m.reply(`✅ Warn untuk @${target.split("@")[0]} berhasil dihapus.`,
    null,
    { mentions: [target] }
  )
}

handler.help = ["delwarn @user / reply"]
handler.tags = ["group"]
handler.command = ["delwarn"]

handler.group = true
handler.admin = true

export default handler