/* 
  Name : SCREENSHOT WEB
  Type : ESM Plugin
  Base : https://api.pikwy.com
  Credit : Kyzo Yamada
*/
import axios from 'axios'

const handler = async (m, { sock, text, reply }) => {
  try {
    if (!text) return reply('Masukkan URL.\nContoh: .ssweb https://example.com')

    let url = text.trim()
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url
    }

    reply('⏳ Mengambil screenshot...')

    const response = await axios.get('https://api.pikwy.com/', {
      params: {
        tkn: 125,
        d: 3000,
        u: encodeURIComponent(url),
        fs: 0,
        w: 1280,
        h: 1200,
        s: 100,
        z: 100,
        f: 'jpg',
        rt: 'jweb'
      },
      headers: {
        Accept: '*/*'
      }
    })

    if (!response.data?.iurl) {
      return reply('❌ Gagal mengambil screenshot.')
    }

    const imageUrl = response.data.iurl

    await sock.sendMessage(
      m.chat,
      {
        image: { url: imageUrl },
        caption: `📸 Screenshot:\n${url}`,
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
                title: `📸 Screenshot:\n${url}`,
                artistAttribution: "https://whatsapp.com/channel/0029Vb6ogsdAzNbyNcFpYf2g",
                countryBlocklist: "",
                isExplicit: false,
                artworkMediaKey: ""
              }
            },
            embeddedAction: true
          }
        ]
      },
      { quoted: m }
    )

  } catch (error) {
    console.error(error)
    reply('❌ Error mengambil screenshot.')
  }
}

handler.help = ['ssweb <url>']
handler.tags = ['tools']
handler.command = ['ssweb']

export default handler