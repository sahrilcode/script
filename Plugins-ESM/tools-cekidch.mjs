const handler = async (m, { sock, text, reply }) => {
  try {
    if (!text) return reply("❌ Kirim link channel WhatsApp")
    if (!text.includes("https://whatsapp.com/channel/")) {
      return reply("❌ Link tautan tidak valid")
    }

    const code = text.split("https://whatsapp.com/channel/")[1]
    const res = await sock.newsletterMetadata("invite", code)

    const teks = `
📢 *INFO CHANNEL WHATSAPP*

🆔 ID: ${res.id}
📛 Nama: ${res.name}
👥 Total Pengikut: ${res.subscribers}
📌 Status: ${res.state}
✅ Verified: ${res.verification == "VERIFIED" ? "Terverifikasi" : "Tidak"}
`

   

    const msg = {
      interactiveMessage: {
        header: "📋 Copy ID Channel",
        body: "Klik tombol untuk copy ID Channel",
        footer: "WhatsApp Channel Tools",
        nativeFlowMessage: {
          buttons: [
            {
              name: "cta_copy",
              buttonParamsJson: JSON.stringify({
                display_text: "📋 Copy ID Channel",
                copy_code: res.id
              })
            }
          ]
        }
      }
    }

    await sock.sendMessage(m.chat, msg, { quoted: m })

  } catch (err) {
    console.error(err)
    reply("❌ Error mengambil metadata channel")
  }
}

handler.help = ["idch", "cekidch"]
handler.tags = ["tools"]
handler.command = ["idch", "cekidch"]

export default handler