require('../config.js');
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

global.autobackup = true; // true = aktif, false = mati
const blacklist = ["node_modules", "Session", "package-lock.json", "yarn.lock", ".npm", ".cache"];
const ownerNumber = global.owner; // pastikan sudah di-set
const namaBot = global.namaBot || "MyBot";
const version = global.version || "1.0";

async function autoBackupScript(KyzoYMD) {
  if (!global.autobackup) return;

  try {

    const tmpDir = "../data";
    if (fs.existsSync(tmpDir)) {
      const files = fs.readdirSync(tmpDir).filter(f => !f.endsWith(".js"));
      for (let file of files) fs.unlinkSync(`${tmpDir}/${file}`);
    }

    const projectRoot = path.join(__dirname, ".."); // karena file ini ada di library/
    process.chdir(projectRoot);

    const date = new Date();
    const timestamp = date.toISOString().replace(/[:.]/g, "-");
    const name = `${namaBot.replace(/\s+/g, "_")}_Version${version.replace(/\s+/g, "_")}_${timestamp}`;

    const filesToZip = fs.readdirSync(".").filter(f => !blacklist.includes(f));
    if (!filesToZip.length) {
      console.log("[AUTO-BACKUP] Tidak ada file untuk di-backup.");
      return;
    }

    execSync(`zip -r ${name}.zip ${filesToZip.join(" ")}`);
    if (!fs.existsSync(`./${name}.zip`)) {
      console.log("[AUTO-BACKUP] Gagal membuat ZIP!");
      return;
    }

    await KyzoYMD.sendMessage(ownerNumber + "@s.whatsapp.net", {
      document: fs.readFileSync(`./${name}.zip`),
      fileName: `${name}.zip`,
      mimetype: "application/zip",
    });

    fs.unlinkSync(`./${name}.zip`);
    console.log(`[AUTO-BACKUP] Backup ${name}.zip berhasil dikirim ke owner.`);
  } catch (err) {
    console.error("[AUTO-BACKUP ERROR]:", err);
  }
}

function scheduleAutoBackup(KyzoYMD) {
  if (!global.autobackup) return;

  const now = new Date();
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 0, 0
  );
  const msToMidnight = nextMidnight - now;

  setTimeout(() => {
    autoBackupScript(KyzoYMD);
    setInterval(() => {
      if (global.autobackup) autoBackupScript(KyzoYMD);
    }, 24 * 60 * 60 * 1000);
  }, msToMidnight);

  console.log("🕒 Auto backup dijadwalkan jam 00.00 setiap hari");
}

module.exports = { autoBackupScript, scheduleAutoBackup };