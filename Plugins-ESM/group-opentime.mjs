const activeCountdown = new Map()

function parseTime(text) {
  if (!text) return null
  const match = text.match(/(\d+)\s*(menit|jam)/i)
  if (!match) return null

  let time = parseInt(match[1])
  const unit = match[2].toLowerCase()

  if (unit === "jam") time *= 60
  return time // hasil dalam MENIT
}

const handler = async (m, { sock, text, command, isGroup, isAdmins, isOwner, reply }) => {
  if (!isGroup) return reply("❌ Command hanya untuk grup!")
  if (!isAdmins && !isOwner) return reply("❌ Khusus admin / owner!")

  const minutes = parseTime(text)
  if (!minutes || minutes < 1)
    return reply("❌ Contoh:\n.opentime 10 menit\n.closetime 1 jam")

  const groupId = m.chat

  if (activeCountdown.has(groupId)) {
    clearInterval(activeCountdown.get(groupId).interval)
    activeCountdown.delete(groupId)
  }

  let remaining = minutes

  const actionText = command === "closetime" ? "DITUTUP 🔒" : "DIBUKA 🔓"

  const msg = await sock.sendMessage(groupId, {
    text: `⏳ *COUNTDOWN DIMULAI*\n\nAksi: ${actionText}\nSisa waktu: ${remaining} menit`
  })

  const interval = setInterval(async () => {
    remaining--

    if (remaining === 5) {
      await sock.sendMessage(groupId, {
        text: `⚠️ *PERINGATAN!*\n\n5 menit lagi grup akan ${actionText}`
      })
    }

    if (remaining > 0) {

      await sock.sendMessage(groupId, {
        text: `⏳ *COUNTDOWN*\n\nAksi: ${actionText}\nSisa waktu: ${remaining} menit`,
        edit: msg.key
      })
      return
    }

    clearInterval(interval)
    activeCountdown.delete(groupId)

    await sock.sendMessage(groupId, {
      delete: msg.key
    })

    if (command === "closetime") {
      await sock.groupSettingUpdate(groupId, "announcement")
      await sock.sendMessage(groupId, {
        text: "🔒 *WAKTU HABIS!*\n\nGrup sekarang DITUTUP"
      })
    }

    if (command === "opentime") {
      await sock.groupSettingUpdate(groupId, "not_announcement")
      await sock.sendMessage(groupId, {
        text: "🔓 *WAKTU HABIS!*\n\nGrup sekarang DIBUKA"
      })
    }

  }, 60 * 1000)

  activeCountdown.set(groupId, { interval })
}

handler.help = ["opentime <menit>", "closetime <menit>"]
handler.tags = ["group"]
handler.command = ["opentime", "closetime"]
handler.group = true
handler.admin = true

export default handler