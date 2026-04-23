import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import yts from 'yt-search'
import fetch from 'node-fetch'
import axios from 'axios'
import { fileURLToPath } from 'url'
import { ytmp3 } from "yt-downld"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function handler(m, {
  text,
  command,
  usedPrefix,
  sock,
  reply
}) {

  try {

    if (!text) {
      return reply(`Contoh:\n${usedPrefix + command} cintaku ini istimewa`)
    }

    await sock.sendMessage(m.chat, {
      react: { text: "⏱️", key: m.key }
    })

    const query = text.trim()

    const search = await yts(query)
    const video = search.videos.find(v => v.seconds && !v.live)

    if (!video) return reply('❌ Video tidak ditemukan')

    let thumbnailBuffer
    try {
      const thumbRes = await fetch(video.thumbnail)
      thumbnailBuffer = Buffer.from(await thumbRes.arrayBuffer())
    } catch {
      thumbnailBuffer = null
    }

    const dl = await ytmp3(video.url)

    const res = await fetch(dl.download)
    if (!res.ok) throw new Error('Gagal fetch audio')

    const mp3Buffer = Buffer.from(await res.arrayBuffer())

    const input = path.join(__dirname, 'playch_in.mp3')
    const output = path.join(__dirname, 'playch_out.ogg')

    fs.writeFileSync(input, mp3Buffer)

    await new Promise((resolve, reject) => {
      exec(
        `ffmpeg -y -i "${input}" -ac 1 -ar 48000 -b:a 48k -c:a libopus "${output}"`,
        (err, stdout, stderr) => {
          if (err) {
            console.log('FFMPEG ERROR:', stderr)
            reject(err)
          } else resolve()
        }
      )
    })

    const ogg = fs.readFileSync(output)

    await sock.sendMessage(global.newsletter, {
      audio: ogg,
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: false,
        externalAdReply: {
          title: video.title.substring(0, 70),
          body: `Duration: ${video.timestamp}`,
          mediaType: 2,
          thumbnail: thumbnailBuffer,
          mediaUrl: video.url,
          sourceUrl: video.url,
          renderLargerThumbnail: true
        }
      }
    })
    await sock.sendMessage(m.chat, {
    text: " success ",
    contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: global.newsletter,
            newsletterName: "klik untuk mendengar musik"
        }
    }
}, { quoted: m })

    fs.unlinkSync(input)
    fs.unlinkSync(output)

  } catch (e) {
    console.error('PLAYCH ERROR:', e)
    reply(`❌ Error: ${e.message}`)
  }
}

handler.help = ['playch <judul lagu>']
handler.tags = ['audio']
handler.command = /^(playch)$/i
handler.owner = false

export default handler