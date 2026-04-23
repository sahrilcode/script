import unzipper from 'unzipper'
import fetch from 'node-fetch'
import { Buffer } from 'buffer'

let handler = async (m, { sock, text, command, isOwner, reply, quoted }) => {

if (!isOwner) return reply('❌ Khusus Owner')

try {
const q = m.quoted || quoted
if (!text) return reply(`Contoh: *${command} namasitus*\nReply file .zip atau .html`)
if (!q || !q.mimetype) return reply('❌ Reply file .zip atau .html')

const mime = q.mimetype
if (!/zip|html/.test(mime)) return reply('❌ Hanya .zip atau .html')

const webName = text.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '')
if (webName.length < 3) return reply('❌ Nama web minimal 3 karakter')

await reply('⏳ Download file...')

const media = await sock.downloadMediaMessage(q)
if (!media) return reply('❌ Gagal download file')

const files = []

if (/zip/.test(mime)) {
await reply('📦 Extract ZIP...')

const zip = await unzipper.Open.buffer(Buffer.from(media))

for (let f of zip.files) {
if (f.type !== 'File') continue
const data = await f.buffer()
if (data.length > 5 * 1024 * 1024) continue

files.push({
file: f.path.replace(/^\/+/, ''),
data: data.toString('base64'),
encoding: 'base64'
})
}

if (!files.some(f => f.file.endsWith('.html')))
return reply('❌ Tidak ada file HTML di ZIP')

}

else {
files.push({
file: 'index.html',
data: Buffer.from(media).toString('base64'),
encoding: 'base64'
})
}

await reply('🚀 Deploy ke Vercel...')

const token = global.vercel
if (!token) return reply('❌ Token Vercel belum di set')

const res = await fetch('https://api.vercel.com/v13/deployments', {
method: 'POST',
headers: {
'Authorization': `Bearer ${token}`,
'Content-Type': 'application/json'
},
body: JSON.stringify({
name: webName,
files,
projectSettings: {
framework: null,
buildCommand: null,
outputDirectory: null
}
})
})

const json = await res.json()
if (!res.ok) {
console.log(json)
return reply(`❌ Deploy gagal: ${json.error?.message}`)
}

const url = `https://${webName}.vercel.app`

reply(`✅ DEPLOY SUCCESS

🌐 ${url}
⏳ Status: ${json.readyState || 'Deploying'}
Tunggu ±1 menit.`)

} catch (e) {
console.log(e)
reply('❌ Error: ' + e.message)
}
}

handler.command = ['deployweb','cweb','vweb','deploy']
handler.owner = true
handler.tags = ['owner']
handler.help = ['deploy <nama>']

export default handler