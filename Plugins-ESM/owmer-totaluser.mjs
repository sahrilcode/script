import fs from "fs"

let handler = async (m, { reply }) => {
  try {

    const file = "./data/login.json"

    if (!fs.existsSync(file)) {
      return reply("❌ File login.json tidak ditemukan")
    }

    const data = JSON.parse(fs.readFileSync(file))

    if (!Array.isArray(data)) {
      return reply("❌ Format login.json tidak valid")
    }

    const total = data.length

    reply(`👤 Total Users: ${total}`)

  } catch (err) {

    console.error("TOTALUSER ERROR:", err)

    reply(`❌ Error:\n${err.message}`)
  }
}

handler.help = ["totaluser"]
handler.tags = ["owner"]
handler.command = /^totaluser$/i
handler.owner = true

export default handler