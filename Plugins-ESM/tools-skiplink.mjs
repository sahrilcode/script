import axios from 'axios'

let handler = async (m, { text, usedPrefix, command, reply }) => {
  if (!text) return reply(`Contoh:\n${usedPrefix + command} https://sfl.gl/xxxx`)

  try {
    reply('⏳ Bypass SFL...')

    const api = `https://api.apocalypse.web.id/tools/sfl?apikey=NEMOPHILA&url=${encodeURIComponent(text)}`
    const res = await axios.get(api)
    const json = res.data

    if (!json.status) return reply('❌ Gagal bypass')

    const d = json.data

    let msg = `🔓 *SFL Bypass Success*\n\n`
    msg += `🔗 Original: ${d.original_url}\n`
    msg += `✅ Bypassed: ${d.bypassed_url}\n\n`
    msg += `📊 Stats:\n`
    msg += `• Duration: ${d.stats.duration}s\n`
    msg += `• API Time: ${d.stats.api_duration}\n`
    msg += `• Clicks: ${d.stats.clicks}\n`
    msg += `• Popups: ${d.stats.popups}\n`
    msg += `• Ads Blocked: ${d.stats.adsBlocked}\n`
    msg += `• Requests: ${d.stats.requests}`

    reply(msg)

  } catch (e) {
    console.error('SFL ERROR:', e)
    reply('❌ Error bypass SFL')
  }
}

handler.help = ['skipsfl <url>']
handler.tags = ['tools']
handler.command = ['skipsfl']

export default handler