
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const LOGIN_PATH = './data/login.json'
const SESSION_PATH = './data/sessions.json'

function loadUsers() {
  try { return JSON.parse(fs.readFileSync(LOGIN_PATH, 'utf-8')) }
  catch { return [] }
}

function saveUsers(users) {
  fs.writeFileSync(LOGIN_PATH, JSON.stringify(users, null, 2))
}

function loadSessions() {
  try { return JSON.parse(fs.readFileSync(SESSION_PATH, 'utf-8')) }
  catch { return {} }
}

function saveSessions(sessions) {
  fs.writeFileSync(SESSION_PATH, JSON.stringify(sessions, null, 2))
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'kyzo_salt_2024').digest('hex')
}

function generateSession() {
  return crypto.randomBytes(32).toString('hex')
}

function generateApiKey() {
  const CLAIM_LIMIT = 50
  const keyName = 'kyzo_' + crypto.randomBytes(8).toString('hex')
  return { keyName, limit: CLAIM_LIMIT }
}

function register(username, password) {
  if (!username || !password) return { success: false, message: 'Username dan password wajib diisi.' }
  if (username.length < 3) return { success: false, message: 'Username minimal 3 karakter.' }
  if (password.length < 4) return { success: false, message: 'Password minimal 4 karakter.' }

  const users = loadUsers()
  if (users.find(u => u.username === username)) {
    return { success: false, message: 'Username sudah terdaftar.' }
  }

  const user = {
    username,
    password: hashPassword(password),
    createdAt: Date.now(),
    totalRequests: 0,
    apiKey: null,
    limit: 0,
    limitClaimedAt: null
  }

  users.push(user)
  saveUsers(users)
  return { success: true, message: 'Registrasi berhasil!' }
}

function login(username, password) {
  const users = loadUsers()
  const user = users.find(u => u.username === username && u.password === hashPassword(password))
  if (!user) return { success: false, message: 'Username atau password salah.' }

  const sessions = loadSessions()
  const token = generateSession()
  sessions[token] = { username, createdAt: Date.now() }
  saveSessions(sessions)

  return { success: true, token, username }
}

function getSession(token) {
  if (!token) return null
  const sessions = loadSessions()
  return sessions[token] || null
}

function getUser(username) {
  const users = loadUsers()
  return users.find(u => u.username === username) || null
}

function updateUser(username, data) {
  const users = loadUsers()
  const idx = users.findIndex(u => u.username === username)
  if (idx === -1) return false
  users[idx] = { ...users[idx], ...data }
  saveUsers(users)
  return true
}

function claimDailyLimit(username) {
  const users = loadUsers()
  const user = users.find(u => u.username === username)
  if (!user) return { success: false, message: 'User tidak ditemukan.' }

  const now = Date.now()
  const oneDayMs = 24 * 60 * 60 * 1000
  const MAX_CLAIM_PER_DAY = 50

  const lastReset = user.claimResetAt || 0
  let claimCountToday = user.claimCountToday || 0
  if ((now - lastReset) >= oneDayMs) {
    claimCountToday = 0
  }

  if (claimCountToday >= MAX_CLAIM_PER_DAY) {
    return { success: false, message: `Batas claim harian tercapai (${MAX_CLAIM_PER_DAY}x/hari). Reset besok.` }
  }

  if (user.limitClaimedAt && (now - user.limitClaimedAt) < oneDayMs) {
    const remaining = Math.ceil((oneDayMs - (now - user.limitClaimedAt)) / (60 * 60 * 1000))
    return { success: false, message: `Sudah claim hari ini. Coba lagi dalam ${remaining} jam.` }
  }

  const { keyName, limit } = generateApiKey()

  try {
    const { loadDB, saveDB } = require('./_keydb')
    const db = loadDB()

    if (user.apiKey) {
      db.keys = db.keys.filter(k => k.name !== user.apiKey)
    }

    db.keys.push({
      name: keyName,
      limit: limit,
      used: 0,
      expiresAt: now + oneDayMs,
      owner: username
    })
    saveDB(db)
  } catch(e) {}

  const newClaimCount = claimCountToday + 1
  updateUser(username, {
    apiKey: keyName,
    limit: limit,
    limitClaimedAt: now,
    limitUsed: 0,
    claimCountToday: newClaimCount,
    claimResetAt: (now - lastReset) >= oneDayMs ? now : (user.claimResetAt || now)
  })

  return { success: true, apiKey: keyName, limit, message: `Berhasil claim ${limit} limit!` }
}

function logout(token) {
  const sessions = loadSessions()
  delete sessions[token]
  saveSessions(sessions)
}

function createKey(username) {
  const users = loadUsers()
  const user = users.find(u => u.username === username)
  if (!user) return { success: false, message: 'User tidak ditemukan.' }

  if (user.hasCreatedKey) {
    return { success: false, message: 'Kamu sudah pernah membuat key. Hanya 1x per akun.' }
  }

  const now = Date.now()
  const oneDayMs = 24 * 60 * 60 * 1000
  const KEY_LIMIT = 200

  const crypto = require('crypto')
  const keyName = 'kyzo_' + crypto.randomBytes(8).toString('hex')

  try {
    const { loadDB, saveDB } = require('./_keydb')
    const db = loadDB()
    db.keys.push({
      name: keyName,
      limit: KEY_LIMIT,
      used: 0,
      expiresAt: now + (365 * 24 * 60 * 60 * 1000), // 1 tahun
      owner: username
    })
    saveDB(db)
  } catch(e) {}

  updateUser(username, {
    apiKey: keyName,
    limit: KEY_LIMIT,
    hasCreatedKey: true,
    createdKeyAt: now
  })

  return { success: true, apiKey: keyName, limit: KEY_LIMIT, message: `Key berhasil dibuat dengan ${KEY_LIMIT} limit!` }
}

module.exports = { register, login, getSession, getUser, updateUser, claimDailyLimit, createKey, logout, hashPassword, loadUsers, saveUsers }
