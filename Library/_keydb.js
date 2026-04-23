
const fs = require('fs')
const DB_PATH = './data/endpoint.json'

function loadDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')) }
  catch { return { keys: [], totalRequests: 0 } }
}

function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

function consumeKey(keyName) {
  const db = loadDB()
  const now = Date.now()

  db.keys = db.keys.filter(k => now <= k.expiresAt)

  const key = db.keys.find(k => k.name === keyName)

  if (!key) return { valid: false, message: 'API key tidak ditemukan.' }
  if (now > key.expiresAt) return { valid: false, message: 'API key sudah expired.' }
  if (key.used >= key.limit) return { valid: false, message: `Limit habis. Key ini sudah menggunakan ${key.used}/${key.limit} request.` }

  key.used = (key.used || 0) + 1
  db.totalRequests = (db.totalRequests || 0) + 1

  saveDB(db)

  if (key.owner) {
    try {
      const { getUser, updateUser } = require('./_auth')
      const user = getUser(key.owner)
      if (user) {
        updateUser(key.owner, {
          limitUsed: (user.limitUsed || 0) + 1,
          totalRequests: (user.totalRequests || 0) + 1
        })
      }
    } catch {}
  }

  return { valid: true, remaining: key.limit - key.used }
}

function checkKey(keyName) {
  const db = loadDB()
  const now = Date.now()
  db.keys = db.keys.filter(k => now <= k.expiresAt)
  const key = db.keys.find(k => k.name === keyName)
  if (!key) return { valid: false, message: 'API key tidak ditemukan.' }
  if (now > key.expiresAt) return { valid: false, message: 'API key sudah expired.' }
  if (key.used >= key.limit) return { valid: false, message: `Limit habis. Key ini sudah menggunakan ${key.used}/${key.limit} request.` }
  return { valid: true, remaining: key.limit - key.used }
}

function getTotalRequests() {
  return loadDB().totalRequests || 0
}

module.exports = { loadDB, saveDB, consumeKey, checkKey, getTotalRequests }
