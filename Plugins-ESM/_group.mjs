

const handler = async (m, {
  sock,
  text,
  args,
  command,
  reply,
  isGroup,
  isAdmins,
  isOwner,
  isBotAdmins
}) => {
  try {

    if (!isGroup) return reply("❌ Fitur khusus grup.")
    if (!isAdmins && !isOwner) return reply("❌ Khusus admin.")
    if (!isBotAdmins) return reply("❌ Bot harus admin.")

    const groupMetadata = await sock.groupMetadata(m.chat)
    const participants = groupMetadata.participants

    if (["promote", "demote"].includes(command)) {

      if (!m.quoted && !text)
        return reply("Tag / reply user.")

      let target =
        m.mentionedJid?.[0] ||
        (m.quoted ? m.quoted.sender :
        text.replace(/[^0-9]/g, "") + "@s.whatsapp.net")

      let action = command === "promote" ? "promote" : "demote"

      await sock.groupParticipantsUpdate(m.chat, [target], action)

      return sock.sendMessage(m.chat, {
        text: `✅ Sukses ${action} @${target.split("@")[0]}`,
        mentions: [target]
      }, { quoted: m })
    }

    if (["open", "opengc", "close", "closegc"].includes(command)) {

      if (["open", "opengc"].includes(command)) {
        await sock.groupSettingUpdate(m.chat, "not_announcement")
        return reply("✅ Grup dibuka.")
      }

      if (["close", "closegc"].includes(command)) {
        await sock.groupSettingUpdate(m.chat, "announcement")
        return reply("✅ Grup ditutup.")
      }
    }

    if (command === "tagall") {

      const pesan = args.join(" ") || "Tag All 📢"

      let teks = `📢 *TAG ALL*\n\n${pesan}\n\n`

      for (let mem of participants) {
        teks += `@${mem.id.split("@")[0]}\n`
      }

      return sock.sendMessage(m.chat, {
        text: teks,
        mentions: participants.map(a => a.id)
      }, { quoted: m })
    }

    if (["hidetag", "h"].includes(command)) {

      const mentions = participants.map(a => a.id)

      if (m.quoted) {
        return sock.sendMessage(m.chat, {
          forward: m.quoted.fakeObj,
          mentions
        })
      }

      return sock.sendMessage(m.chat, {
        text: text || "",
        mentions
      }, { quoted: m })
    }

    if (command === "kick") {

      if (!m.quoted && !text)
        return reply("Tag / reply user.")

      let user =
        m.mentionedJid?.[0] ||
        (m.quoted ? m.quoted.sender :
        text.replace(/[^0-9]/g, "") + "@s.whatsapp.net")

      await sock.groupParticipantsUpdate(m.chat, [user], "remove")

      return reply("✅ User berhasil dikeluarkan.")
    }

    if (command === "linkgc") {

      const code = await sock.groupInviteCode(m.chat)
      const link = `https://chat.whatsapp.com/${code}`

      return sock.sendMessage(m.chat, {
        text: `🔗 Link Grup:\n${link}`
      }, { quoted: m })
    }

    if (command === "resetlinkgc") {

      await sock.groupRevokeInvite(m.chat)
      return reply("✅ Link grup berhasil direset.")
    }

  } catch (err) {
    console.log(err)
    reply("❌ Terjadi kesalahan.")
  }
}

handler.command = [
  "promote", "demote",
  "open", "close", "opengc", "closegc",
  "tagall", "hidetag", "h",
  "kick",
  "linkgc", "resetlinkgc"
]

handler.tags = ["group"]
handler.desc = "Complete Group Management"

export default handler