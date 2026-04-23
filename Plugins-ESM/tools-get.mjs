import axios from 'axios'
import fs from 'fs'
import util from 'util'

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function getMimeType(file) {
  const { fileTypeFromFile } = await import('file-type')
  const type = await fileTypeFromFile(file)
  return type ? type.mime : 'application/octet-stream'
}

let handler = async (m, { text, sock, command, usedPrefix, reply }) => {
  if (!text) return reply(`Contoh: ${usedPrefix + command} linknya`)
  if (!text.includes('http')) return reply(`Contoh: ${usedPrefix + command} linknya`)

  try {
    const data = await axios.get(text)
    const contentType = data.headers['content-type'] || ''

    const headerText = Object.entries(data.headers)
      .map(([k, v]) => `*${k}:* ${v}`)
      .join('\n')

    if (contentType.startsWith('image/')) {
      return sock.sendMessage(m.chat, {
        image: { url: text },
        caption: `${text}\n\n*Headers Response:*\n${headerText}`,
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
                title: `${text}\n\n*Headers Response:*\n${headerText}`,
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

    if (contentType.startsWith('video/')) {
      return sock.sendMessage(m.chat, {
        video: { url: text },
        caption: `${text}\n\n*Headers Response:*\n${headerText}`,
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
                title: `${text}\n\n*Headers Response:*\n${headerText}`,
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

    if (contentType.startsWith('audio/')) {
      return sock.sendMessage(m.chat, {
        audio: { url: text },
        mimetype: contentType
      }, { quoted: m })
    }

    reply(util.format(data.data))

    try {

      const res = await axios.get(text, { responseType: 'arraybuffer' })
      const mime = res.headers['content-type'] || 'application/octet-stream'
      const ext = mime.split('/')[1] || 'bin'
      const file = `./tmp/get-${Date.now()}.${ext}`

      fs.writeFileSync(file, res.data)

      await sleep(1000)

      await sock.sendMessage(m.chat, {
        document: fs.readFileSync(file),
        mimetype: mime,
        fileName: `get-data.${ext}`
      }, { quoted: m })

      fs.unlinkSync(file)
    } catch (e) {
      console.error('SAVE FILE ERROR:', e)
    }

  } catch (e) {
    console.error('GET ERROR:', e)
    reply('❌ Terjadi kesalahan saat fetch URL')
  }
}

handler.help = ['get <url>']
handler.tags = ['tools']
handler.command = ['get']

export default handler