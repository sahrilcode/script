const COLORS = [
  "pink","blue","red","green","yellow",
  "purple","black","white","orange","cyan"
]

const handler = async (m, { sock, text }) => {
  if (!text)
    return m.reply("Contoh: .qc halo dunia")

  if (text.length > 80)
    return m.reply("Maximal 80 karakter!")

  if (!global.qcSession) global.qcSession = {}
  global.qcSession[m.sender] = text

  const buttons = COLORS.map(color => ({
    name: "quick_reply",
    buttonParamsJson: JSON.stringify({
      display_text: color,
      id: `.qc_res ${color}`
    })
  }))

  await sock.sendMessage(
    m.chat,
    {
      interactiveMessage: {
        body: { text: "🎨 Pilih warna background QC:" },
        footer: { text: "QC Sticker Maker" },
        nativeFlowMessage: { buttons }
      }
    },
    { quoted: m }
  )
}

handler.help = ["qc teks"]
handler.tags = ["sticker"]
handler.command = ["qc"]

export default handler