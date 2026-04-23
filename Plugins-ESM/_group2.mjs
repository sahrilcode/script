import fs from "fs"

const handler = async (m, {
  sock,
  text,
  reply,
  isAdmins,
  isOwner,
  isBotAdmins,
  command
}) => {
  try {
    if (!m.isGroup) return reply("❌ Hanya bisa digunakan di grup.")
    if (!isAdmins && !isOwner)
      return reply("❌ Hanya admin yang bisa menggunakan fitur ini.")
    if (!isBotAdmins)
      return reply("❌ Bot harus menjadi admin terlebih dahulu.")

    switch (command) {

      case "setppgc": {
        const q = m.quoted
        if (!q)
          return reply("⚠️ Reply foto dengan caption *.setppgc*")

        const mime =
          (q.msg || q).mimetype ||
          q.mimetype ||
          q.message?.imageMessage?.mimetype

        if (!mime || !/image/.test(mime))
          return reply("⚠️ File harus berupa gambar.")

        await sock.sendMessage(m.chat, {
          react: { text: "⏳", key: m.key }
        })

        const buffer = await q.download()

        await sock.updateProfilePicture(m.chat, buffer)

        await sock.sendMessage(m.chat, {
          react: { text: "✅", key: m.key }
        })

        reply("✅ Foto grup berhasil diperbarui.")
      }
      break

      case "setdescgc": {
        if (!text)
          return reply("Contoh:\n.setdescgc Deskripsi baru grup")

        await sock.groupUpdateDescription(m.chat, text)
        reply("✅ Deskripsi grup berhasil diperbarui.")
      }
      break

      case "setnamegc": {
        if (!text)
          return reply("Contoh:\n.setnamegc Nama Grup Baru")

        await sock.groupUpdateSubject(m.chat, text)
        reply("✅ Nama grup berhasil diperbarui.")
      }
      break
    }

  } catch (err) {
    console.log(err)
    reply("❌ Terjadi kesalahan.")
  }
}

handler.command = ["setppgc", "setdescgc", "setnamegc"]
handler.tags = ["group"]

export default handler