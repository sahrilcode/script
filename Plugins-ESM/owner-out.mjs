const handler = async (m, { sock, text, command, isOwner, isGroup, reply }) => {
  try {
    if (!isOwner)
      return reply("❌ Khusus owner bot!")

    if (command === "join") {
      if (!text)
        return reply("❌ Masukkan link grup!\nContoh:\n.join https://chat.whatsapp.com/xxxx")

      const match = text.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/)
      if (!match)
        return reply("❌ Link grup tidak valid!")

      const inviteCode = match[1]

      await sock.groupAcceptInvite(inviteCode)

      reply("✅ Berhasil join grup!")
    }

    if (command === "out") {
      if (!isGroup)
        return reply("❌ Command ini hanya bisa digunakan di dalam grup!")

      await reply("👋 Keluar dari grup...")

      await sock.groupLeave(m.chat)
    }

  } catch (err) {
    console.error("Join/Out Error:", err)
    reply("❌ Terjadi kesalahan!\n" + err.message)
  }
}

handler.help = ["join <linkgc>", "out"]
handler.tags = ["owner"]
handler.command = ["join", "out"]

handler.owner = true

export default handler