
const handler = async (m, { sock, reply, isOwner }) => {
  if (!isOwner) return reply("❌ Owner only")
  if (!m.quoted) return reply("❌ Reply JSON kode")

  try {
    const text = m.quoted.text || m.quoted.body || ""
    if (!text) return reply("❌ Tidak ada teks JSON")

    let json
    try {
      json = JSON.parse(text)
    } catch (e) {
      return reply("❌ JSON tidak valid")
    }

    await sock.sendMessage(m.chat, json, { quoted: m })

    reply("✅ Message dikirim")

  } catch (err) {
    console.error(err)
    reply("❌ Error saat menjalankan")
  }
}

handler.command = ["run"]
handler.tags = ["owner"]
handler.desc = "Run JSON raw message"

export default handler