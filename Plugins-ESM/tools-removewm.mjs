import axios from "axios"
import fs from "fs"
import FormData from "form-data"

async function ezremove(path) {
  const form = new FormData()
  form.append("image_file", fs.createReadStream(path), path.split("/").pop())

  const create = await axios.post(
    "https://api.ezremove.ai/api/ez-remove/watermark-remove/create-job",
    form,
    {
      headers: {
        ...form.getHeaders(),
        "User-Agent": "Mozilla/5.0",
        origin: "https://ezremove.ai",
        "product-serial": "sr-" + Date.now()
      }
    }
  ).then(v => v.data).catch(() => null)

  if (!create || !create.result || !create.result.job_id) {
    return { status: "error" }
  }

  const job = create.result.job_id

  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 2000))

    const check = await axios.get(
      `https://api.ezremove.ai/api/ez-remove/watermark-remove/get-job/${job}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          origin: "https://ezremove.ai",
          "product-serial": "sr-" + Date.now()
        }
      }
    ).then(v => v.data).catch(() => null)

    if (check && check.code === 100000 && check.result && check.result.output) {
      return { job, result: check.result.output[0] }
    }

    if (!check || !check.code || check.code !== 300001) break
  }

  return { status: "processing", job }
}

const handler = async (m, { sock, isPremium }) => {

if (!isPremium) return m.reply(global.mess.prem)

const q = m.quoted ? m.quoted : m
const mime = (q.msg || q).mimetype || ""

if (!/image/.test(mime)) return m.reply("mana foto nya?")

m.reply("⏳ Sedang menghapus watermark...")

let mediaPath

try {

mediaPath = await sock.downloadAndSaveMediaMessage(q)

const apiResult = await ezremove(mediaPath)

if (!apiResult.result) {
return m.reply("❌ Gagal menghapus watermark!")
}

const urlHasil = apiResult.result

const hasil = await axios.get(urlHasil, { responseType: "arraybuffer" })

await sock.sendMessage(
m.chat,
{
image: hasil.data,
caption: "",
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
            title: "",
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

console.error("Error di removewm:", error)
m.reply("❌ Terjadi kesalahan saat memproses gambar.")

} finally {

if (mediaPath && fs.existsSync(mediaPath)) {
fs.unlinkSync(mediaPath)
}

}

}

handler.command = ["rwm","removewatermark","removewm"]
handler.premium = true

export default handler