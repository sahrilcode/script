const { getContentType } = require("@whiskeysockets/baileys")

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let who
    if (m.isGroup) who = m.quoted ? m.quoted.sender : m.mentionedJid[0] ? m.mentionedJid[0] : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.sender
    else who = m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.chat

    let pp = '[https://i.ibb.co/m568x80/avatar-default.png](https://i.ibb.co/m568x80/avatar-default.png)'
    try {
        pp = await conn.profilePictureUrl(who, 'image')
    } catch (e) {}

    let contact = await conn.onWhatsApp(who)
    let exists = contact[0]?.exists || false
    
    let userBio = "Requesting bio..."
    try {
        let status = await conn.fetchStatus(who)
        userBio = status.status || "No Bio"
    } catch (e) {
        userBio = "Privacy"
    }

    let isBusiness = false
    try {
        let businessData = await conn.getBusinessProfile(who)
        if (businessData) isBusiness = true
    } catch (e) {
        isBusiness = false
    }

    let name = conn.getName(who)
    let number = who.split('@')[0]

    let caption = `*USER INFO*\n\n`
    caption += `Nomor : ${number}\n`
    caption += `Nama : ${name}\n`
    caption += `Bio : ${userBio}\n`
    caption += `Business : ${isBusiness}\n`
    caption += `Jid : ${who}`

    await conn.sendMessage(m.chat, { 
        image: { url: pp }, 
        caption: caption,
        mentions: [who]
    }, { quoted: m })
}

handler.help = ['userinfo']
handler.tags = ['tools']
handler.command = ['userinfo']

module.exports = handler