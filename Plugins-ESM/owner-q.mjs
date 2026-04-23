
const handler = async (m, { reply, isOwner }) => {
  if (!isOwner) return reply("❌ Perintah ini hanya untuk owner")
  if (!m.quoted) return reply("❌ Reply pesan yang ingin dilihat datanya")

  try {

    const jsonData = JSON.stringify(m.quoted, null, 2)
    reply(jsonData)
  } catch (err) {
    console.error(err)
    reply("❌ Gagal menampilkan data pesan")
  }
}

handler.command = ["q"]
handler.tags = ["owner"]
handler.desc = "Menampilkan data JSON dari pesan yang di-reply"

export default handler