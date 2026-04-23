import axios from "axios"
import fs from "fs"
import path from "path"
import FormData from "form-data"

/* ============================= */
/* CONFIG                        */
/* ============================= */

const prompt = `Ultra-high-resolution 4K enhancement
based strictly on the provided reference
image. Absolute fidelity to original facial
anatomy, proportions, and identity.
Preserve expression, gaze, pose, camera
angle, framing, and perspective with zero
deviation. Clothing, hair, skin, and
background elements must remain
unchanged in structure, placement, and
design. Recover fine-grain detail with
natural realism. Enhance pores, fine lines,
hair strands, eyelashes, fabric weave,
seams, and material edges without
introducing stylization. Maintain original
color science, white balance, and tonal
relationships exactly as captured.
Lighting direction, intensity, contrast, and
shadow behavior must match the source
image precisely, with only improved clarity
and expanded dynamic range. No
relighting, no reshaping. Remove any
grain.
Apply controlled sharpening and
high-frequency detail reconstruction.
Remove compression artifacts and noise
while retaining authentic texture. No
smoothing, no plastic skin, no artificial
gloss. Facial features must remain
consistent across the entire image with
coherent anatomy and clean, stable
edges.
Negative constraints: no warping, no facial
drift, no added or missing anatomy, no
altered hands, no distortions, no
perspective shift, no text or graphics, no
hallucinated detail, no stylized rendering.
Output must read as a true-to-life,
photorealistic upscale that matches the
reference exactly, only clearer, sharper,
and higher resolution.`

/* ============================= */
/* UTILS                         */
/* ============================= */

function genserial() {
  let s = ''
  for (let i = 0; i < 32; i++) s += Math.floor(Math.random() * 16).toString(16)
  return s
}

async function upimage(filename) {
  const form = new FormData()
  form.append('file_name', filename)

  const res = await axios.post(
    'https://api.imgupscaler.ai/api/common/upload/upload-image',
    form,
    {
      headers: {
        ...form.getHeaders(),
        origin: 'https://imgupscaler.ai',
        referer: 'https://imgupscaler.ai/'
      }
    }
  )

  return res.data.result
}

async function uploadtoOSS(putUrl, filePath) {
  const file = fs.readFileSync(filePath)
  const type = path.extname(filePath) === '.png' ? 'image/png' : 'image/jpeg'

  const res = await axios.put(
    putUrl,
    file,
    {
      headers: {
        'Content-Type': type,
        'Content-Length': file.length
      },
      maxBodyLength: Infinity
    }
  )

  return res.status === 200
}

async function createJob(imageUrl) {
  const form = new FormData()
  form.append('model_name', 'magiceraser_v4')
  form.append('original_image_url', imageUrl)
  form.append('prompt', prompt)
  form.append('ratio', 'match_input_image')
  form.append('output_format', 'jpg')

  const res = await axios.post(
    'https://api.magiceraser.org/api/magiceraser/v2/image-editor/create-job',
    form,
    {
      headers: {
        ...form.getHeaders(),
        'product-code': 'magiceraser',
        'product-serial': genserial(),
        origin: 'https://imgupscaler.ai',
        referer: 'https://imgupscaler.ai/'
      }
    }
  )

  return res.data.result.job_id
}

async function cekjob(jobId) {
  const res = await axios.get(
    `https://api.magiceraser.org/api/magiceraser/v1/ai-remove/get-job/${jobId}`,
    {
      headers: {
        origin: 'https://imgupscaler.ai',
        referer: 'https://imgupscaler.ai/'
      }
    }
  )

  return res.data
}

async function to4k(imagePath) {
  const filename = path.basename(imagePath)

  const uploadInfo = await upimage(filename)
  await uploadtoOSS(uploadInfo.url, imagePath)

  const cdn = 'https://cdn.imgupscaler.ai/' + uploadInfo.object_name
  const jobId = await createJob(cdn)

  let result
  do {
    await new Promise(r => setTimeout(r, 3000))
    result = await cekjob(jobId)
  } while (result.code === 300006)

  return {
    job_id: jobId,
    image: result.result.output_url[0]
  }
}

/* ============================= */
/* HANDLER                       */
/* ============================= */

const handler = async (m, { sock, reply }) => {
  try {
    if (!m.quoted || !m.quoted.mimetype?.startsWith('image')) {
      return reply('❌ Reply foto dengan command *.to4k*')
    }

    reply('⏳ Mengunduh gambar...')

    const buffer = await m.quoted.download()
    const filePath = `./to4k_${Date.now()}.jpg`
    fs.writeFileSync(filePath, buffer)

    const result = await to4k(filePath)
    fs.unlinkSync(filePath)

    await sock.sendMessage(
      m.chat,
      {
        image: { url: result.image },
        caption: `✅ Berhasil`,
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
                title: `✅ Berhasil`,
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

  } catch (err) {
    console.error(err)
    reply(
      "❌ Terjadi error!\n\nDetail:\n```" +
      err.message +
      "```"
    )
  }
}

handler.help = ['to4k (reply foto)']
handler.tags = ['tools', 'ai']
handler.command = ['to4k']
handler.premium = true

export default handler