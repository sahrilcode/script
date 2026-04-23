const handler = async (m, { text, args, reply, sock, command }) => {
{
  try {
    if (!text) return reply(`Contoh: ${command} Sahril jir👀`)
    
    const imageUrl = `https://api-faa.my.id/faa/iqc?prompt=${encodeURIComponent(text)}`
    
    await sock.sendMessage(
      m.chat, 
      {
        image: { url: imageUrl },
        caption: "",
        annotations: [
          {
            polygonVertices: [
              { x: 0, y: 0 },
              { x: 1000, y: 0 },
              { x: 1000, y: 1000 },
              { x: 0, y: 1000 }
            ],
            embeddedAction: true
          }
        ]
      }, 
      { quoted: m }
    )
    
  } catch (error) {
    console.error("Error in iqc command:", error)
    reply(`❌ Gagal memproses permintaan. Error: ${error.message}`)
  }
}
}

handler.command = ["iqc"]
handler.tags = ["tools"]
handler.desc = "iqc command"
handler.limit = false
export default handler