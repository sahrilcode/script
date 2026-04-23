const axios = require('axios')
const { consumeKey } = require('../Library/_keydb')

async function chatBibleScrape(prompt) {
  const res = await axios.post('https://chatbible.io/chat', {
    message: prompt,
    session_id: Date.now().toString()
  }, {
    headers: { 'Content-Type': 'application/json' }
  })
  return res.data?.reply || null
}

module.exports = async (req, res) => {
  const { key, ask } = req.query
  if (!key) return res.json({ status: false, message: 'Parameter key diperlukan' })
  const keyResult = consumeKey(key)
  if (!keyResult.valid) return res.json({ status: false, message: keyResult.message })
  if (!ask) return res.json({ status: false, message: 'Parameter ask diperlukan' })
  try {
    const response = await chatBibleScrape(ask)
    res.json({ status: true, response })
  } catch (e) {
    res.json({ status: false, message: e.message })
  }
}
