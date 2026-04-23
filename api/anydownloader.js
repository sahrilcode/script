const axios = require('axios')
const { consumeKey } = require('../Library/_keydb')

async function anyVideoDownloader(url) {
  const { data } = await axios.post(
    'https://api.anyvideodownloader.net/api/video/universal',
    { url },
    { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }
  )
  if (!data.success) throw new Error('Gagal mengambil data')
  const r = data.data
  return {
    title: r.title,
    duration: r.duration,
    thumbnail: r.thumbnail,
    uploader: r.uploader,
    video: r.directUrl,
    ext: r.ext,
    platform: r.platform,
    medias: r.medias
  }
}

module.exports = async (req, res) => {
  const { key, url } = req.query
  if (!key) return res.json({ status: false, message: 'Parameter key diperlukan' })
  const keyResult = consumeKey(key)
  if (!keyResult.valid) return res.json({ status: false, message: keyResult.message })
  if (!url) return res.json({ status: false, message: 'Parameter url diperlukan' })
  try {
    const data = await anyVideoDownloader(url)
    res.json({ status: true, data })
  } catch (e) {
    res.json({ status: false, message: e.message })
  }
}
