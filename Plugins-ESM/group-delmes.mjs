const handler = async (m, { sock, isGroup, isAdmins, isOwner, reply }) => {
  try {
    if (!isGroup)
      return reply("❌ Command ini hanya bisa digunakan di grup!")

    if (!isOwner && !isAdmins)
      return reply("❌ Hanya Admin grup atau Owner bot yang bisa menghapus pesan!")

    if (!m.quoted)
      return reply("❌ Reply pesan yang ingin dihapus!")

    const quoted = m.quoted

    await sock.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: quoted.fromMe,
        id: quoted.id,
        participant: quoted.sender
      }
    })

  } catch (err) {
    console.error("❌ Delete Error:", err)
    reply("❌ Gagal menghapus pesan!")
  }
}

handler.help = ["d", "delete", "del"]
handler.tags = ["group"]
handler.command = ["d", "delete", "del"]

handler.admin = true
handler.owner = true
handler.group = true

export default handler