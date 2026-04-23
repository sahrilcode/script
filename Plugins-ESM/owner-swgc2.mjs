
import crypto from "crypto"
import baileys from "@whiskeysockets/baileys"

const {
  generateWAMessageContent,
  generateWAMessageFromContent
} = baileys

global.swgcStore = global.swgcStore || new Map()

const handler = async (m, { sock, text, reply }) => {

  if (!text) return reply("Target tidak ditemukan.")

  const data = global.swgcStore.get(m.sender)
  if (!data) return reply("Belum ada data, jalankan .swgc dulu")

  const inside = await generateWAMessageContent(data, {
    upload: sock.waUploadToServer
  })

  const messageSecret = crypto.randomBytes(32)

  const msg = generateWAMessageFromContent(
    text,
    {
      messageContextInfo: { messageSecret },
      groupStatusMessageV2: {
        message: {
          ...inside,
          messageContextInfo: { messageSecret }
        }
      }
    },
    {}
  )

  await sock.relayMessage(text, msg.message, {
    messageId: msg.key.id
  })

  await sock.sendMessage(m.chat, {
    react: { text: "✅", key: m.key }
  })

  global.swgcStore.delete(m.sender)
}

handler.command = ["swgc_send"]
export default handler