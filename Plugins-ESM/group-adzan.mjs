import fs from "fs"
import path from "path"

const DB_PATH = "./data/adzan.json"

if (!fs.existsSync("./data")) {
  fs.mkdirSync("./data", { recursive: true })
}

if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2))
}

const loadDB = () => JSON.parse(fs.readFileSync(DB_PATH))
const saveDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))

let handler = async (m, { args, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply(global.mess.group)
  if (!isAdmin && !isOwner) return m.reply(global.mess.admin)

  if (!args[0]) {
    return m.reply("Contoh:\n.adzan on\n.adzan off")
  }

  let db = loadDB()
  let groupId = m.chat
  let find = db.find(v => v.idgc === groupId)

  if (args[0].toLowerCase() === "on") {

    if (find && find.status === true)
      return m.reply("⚠️ Adzan sudah aktif di group ini.")

    if (find) {
      find.status = true
    } else {
      db.push({ idgc: groupId, status: true })
    }

    saveDB(db)
    return m.reply("✅ Fitur adzan berhasil diaktifkan.")
  }

  if (args[0].toLowerCase() === "off") {

    if (!find || find.status === false)
      return m.reply("⚠️ Adzan sudah nonaktif.")

    find.status = false
    saveDB(db)

    return m.reply("❌ Fitur adzan berhasil dinonaktifkan.")
  }

  m.reply("Gunakan on/off")
}

handler.command = ["adzan"]
handler.help = ["adzan on/off"]
handler.tags = ["group"]

export default handler