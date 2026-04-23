import baileys from "@whiskeysockets/baileys"

const {
  generateWAMessageFromContent,
  proto
} = baileys

global.swgcStore = global.swgcStore || new Map()

const handler = async (m, {
  sock,
  text,
  reply,
  isBotAdmins,
  prefix
}) => {

  const isQuoted = !!m.quoted
  const mime = isQuoted ? (m.quoted.mimetype || m.quoted.mtype) : null
  const caption = text?.trim() || ""
  let options = {}

  if (isQuoted) {
    const media = await m.quoted.download()

    if (/image/.test(mime)) {
      options = { image: media, caption }
    } else if (/video/.test(mime)) {
      options = { video: media, caption }
    } else if (/audio/.test(mime)) {
      options = { audio: media, mimetype: "audio/mpeg" }
    } else {
      return reply("Reply foto/video/audio!")
    }
  } else if (caption) {
    options = { text: caption }
  } else {
    return reply("Contoh: .swgc halo")
  }

  global.swgcStore.set(m.sender, options)

  const groups = await sock.groupFetchAllParticipating()
  const groupList = Object.values(groups)

  const buttons = groupList.slice(0, 10).map(g => ({
    name: "quick_reply",
    buttonParamsJson: JSON.stringify({
      display_text: g.subject,
      id: `${prefix}swgc_send ${g.id}`
    })
  }))

  const msg = generateWAMessageFromContent(
    m.chat,
    proto.Message.fromObject({
      interactiveMessage: {
        body: { text: "📤 Pilih target group:" },
        footer: { text: "SWGC System" },
        nativeFlowMessage: { buttons }
      }
    }),
    {}
  )

  await sock.relayMessage(m.chat, msg.message, {
    messageId: msg.key.id
  })
}

handler.command = ["swgc"]
export default handler