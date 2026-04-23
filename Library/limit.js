
require('../config');
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.resolve("./data"); // folder data dari root project
const LIMIT_FILE = path.join(DATA_DIR, "limit.json");
const FREE_LIMIT = global.freelimit;
const CLAIM_LIMIT = 30;

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(LIMIT_FILE)) fs.writeFileSync(LIMIT_FILE, "[]");

function loadLimitData() {
  try { return JSON.parse(fs.readFileSync(LIMIT_FILE, "utf-8")); } 
  catch { return []; }
}

function saveLimitData(data) {
  fs.writeFileSync(LIMIT_FILE, JSON.stringify(data, null, 2));
}

function getUser(userId) {
  const data = loadLimitData();
  let user = data.find(u => u.user === userId);
  if (!user) {
    user = { user: userId, limit: FREE_LIMIT, premium: false, lastClaim: null };
    data.push(user);
    saveLimitData(data);
  }
  return user;
}

function cekLimit(userId) {
  const user = getUser(userId);
  return user.premium ? "Limit: unlimited ✅" : `${user.limit}`;
}

function claimLimit(userId) {
  const data = loadLimitData();
  let user = data.find(u => u.user === userId);
  if (!user) user = getUser(userId);

  if (user.premium) return "Premium tidak perlu claim limit ✅";

  const today = new Date().toLocaleDateString();
  if (user.lastClaim === today) return "Kamu sudah claim hari ini ❌";

  user.limit += CLAIM_LIMIT;
  user.lastClaim = today;
  saveLimitData(data);

  return `Berhasil claim +${CLAIM_LIMIT} limit ✅\nSisa limit: ${user.limit}`;
}

function useLimit(userId) {
  const data = loadLimitData();
  let user = data.find(u => u.user === userId);
  if (!user) user = getUser(userId);

  if (user.premium) return { allowed: true, remaining: "unlimited" };

  if (user.limit <= 0) return { allowed: false, remaining: 0 };

  user.limit -= 1;
  saveLimitData(data);

  return { allowed: true, remaining: user.limit };
}

function addLimit(userId, amount = 1) {
  const data = loadLimitData();
  let user = data.find(u => u.user === userId);
  if (!user) user = getUser(userId);

  if (!user.premium) user.limit += amount;
  saveLimitData(data);

  return user.limit;
}

function delLimit(userId, amount = 1) {
  const data = loadLimitData();
  let user = data.find(u => u.user === userId);
  if (!user) user = getUser(userId);

  if (!user.premium) {
    user.limit -= amount;
    if (user.limit < 0) user.limit = 0;
  }
  saveLimitData(data);

  return user.limit;
}

(function resetLimitDaily() {
  const now = new Date();
  const nextReset = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 0
  );
  setTimeout(() => {
    const data = loadLimitData();
    for (let u of data) if (!u.premium) u.limit = FREE_LIMIT;
    saveLimitData(data);
    resetLimitDaily();
  }, nextReset - now);
})();

module.exports = {
  cekLimit,
  claimLimit,
  useLimit,
  getUser,
  addLimit,
  delLimit,
  loadLimitData,
  saveLimitData
};