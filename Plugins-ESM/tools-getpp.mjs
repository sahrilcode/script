const handler = async (m, { conn, text, smsg }) => {
    let who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.sender
    else who = m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.sender

    let pp = '[https://telegra.ph/file/241d7169c377a1b4673f5.jpg](https://telegra.ph/file/241d7169c377a1b4673f5.jpg)'
    try {
        pp = await conn.profilePictureUrl(who, 'image')
    } catch (e) {
    } finally {
        conn.sendMessage(m.chat, { image: { url: pp }, caption: `Target: @${who.split('@')[0]}`, mentions: [who],
    annotations: [
      {
        polygonVertices: [
          { x: 0, y: 0 },
          { x: 1000, y: 0 },
          { x: 1000, y: 1000 },
          { x: 0, y: 1000 }
        ],
        shouldSkipConfirmation: true,
        embeddedContent: {
          embeddedMusic: {
            musicContentMediaId: "1409620227516822",
            songId: "244215252974958",
            author: "SahrilX7",
            title: `Target: @${who.split('@')[0]}`,
            artistAttribution: "https://whatsapp.com/channel/0029Vb6ogsdAzNbyNcFpYf2g",
            countryBlocklist: "",
            isExplicit: false,
            artworkMediaKey: ""
          }
        },
        embeddedAction: true
      }
    ]
  }, { quoted: m })
    }
}
handler.command = /^(getpp|getppuser)$/i

export default handler