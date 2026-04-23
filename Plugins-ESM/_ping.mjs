import os from "os"
import { execSync } from "child_process"
import { createCanvas } from "@napi-rs/canvas"

function runtime(seconds) {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return [d && `${d}d`, h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(" ")
}

function fmtBytes(b) {
  if (b >= 1073741824) return (b / 1073741824).toFixed(1) + " GB"
  if (b >= 1048576)    return (b / 1048576).toFixed(1) + " MB"
  return (b / 1024).toFixed(1) + " KB"
}

function getDisk() {
  try {
    if (process.platform === "win32") {
      const out   = execSync("wmic logicaldisk where drivetype=3 get size,freespace", { encoding: "utf8" })
      const parts = out.split("\n").filter(l => l.trim() && !/Size/.test(l))[0]?.trim().split(/\s+/)
      if (!parts) return null
      const free = parseInt(parts[0]), total = parseInt(parts[1])
      return { total, used: total - free, free, pct: Math.round((total - free) / total * 100) }
    }
    const parts = execSync("df / --block-size=1", { encoding: "utf8" }).split("\n")[1].split(/\s+/)
    const total = parseInt(parts[1]), used = parseInt(parts[2]), free = parseInt(parts[3])
    return { total, used, free, pct: Math.round(used / total * 100) }
  } catch { return null }
}

function getCpuPct() {
  const cpus = os.cpus()
  let idle = 0, total = 0
  for (const c of cpus) {
    for (const t of Object.values(c.times)) total += t
    idle += c.times.idle
  }
  return Math.round((1 - idle / total) * 100)
}

function arc(ctx, cx, cy, r, pct, color) {
  const S = Math.PI * 0.75
  const E = Math.PI * 2.25
  ctx.beginPath()
  ctx.arc(cx, cy, r, S, E)
  ctx.strokeStyle = "rgba(255,255,255,0.08)"
  ctx.lineWidth   = 9
  ctx.lineCap     = "round"
  ctx.stroke()
  if (pct > 0) {
    ctx.beginPath()
    ctx.arc(cx, cy, r, S, S + (E - S) * pct / 100)
    ctx.strokeStyle = color
    ctx.lineWidth   = 9
    ctx.lineCap     = "round"
    ctx.stroke()
  }
}

function bar(ctx, x, y, w, h, pct, color) {
  ctx.fillStyle = "rgba(255,255,255,0.08)"
  ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill()
  if (pct > 0) {
    ctx.fillStyle = color
    ctx.beginPath(); ctx.roundRect(x, y, Math.max(w * pct / 100, h), h, h / 2); ctx.fill()
  }
}

function box(ctx, x, y, w, h) {
  ctx.fillStyle   = "rgba(255,255,255,0.04)"
  ctx.strokeStyle = "rgba(255,255,255,0.08)"
  ctx.lineWidth   = 1
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.fill(); ctx.stroke()
}

function t(ctx, x, y, text, font, color, align = "left") {
  ctx.fillStyle    = color
  ctx.font         = font
  ctx.textAlign    = align
  ctx.textBaseline = "top"
  ctx.fillText(text, x, y)
}

function trunc(ctx, text, maxW) {
  if (ctx.measureText(text).width <= maxW) return text
  while (ctx.measureText(text + "…").width > maxW && text.length > 1) text = text.slice(0, -1)
  return text + "…"
}

async function draw(data) {
  const W   = 820
  const H   = 460
  const P   = 22
  const GAP = 14

  const canvas = createCanvas(W, H)
  const ctx    = canvas.getContext("2d")

  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, "#0d0d26")
  bg.addColorStop(1, "#160b28")
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  ctx.beginPath()
  ctx.arc(P + 11, 42, 11, 0, Math.PI * 2)
  ctx.fillStyle = "#4f8ef7"
  ctx.fill()

  t(ctx, P + 30, 28, "System Monitor", "bold 22px Arial", "#ffffff")
  t(ctx, P + 30, 54, `${data.hostname}  •  ${data.ping}ms  •  Node ${process.version}`, "11px Arial", "rgba(255,255,255,0.35)")

  const R1Y = 86
  const R1H = 170
  const CW  = (W - P * 2 - GAP * 2) / 3

  const gauges = [
    { title: "CPU USAGE", sub: `${data.cpuCores} Cores • ${data.cpuSpeed} MHz`, pct: data.cpuPct,  color: "#4f8ef7", detail: data.cpuModel },
    { title: "MEMORY",    sub: `Total ${fmtBytes(data.ramTotal)}`,               pct: data.ramPct,  color: "#a855f7", detail: `Used: ${fmtBytes(data.ramUsed)}   Free: ${fmtBytes(data.ramFree)}` },
    { title: "STORAGE",   sub: data.diskTotal ? `Total ${fmtBytes(data.diskTotal)}` : "N/A",        pct: data.diskPct, color: "#22c55e", detail: data.diskTotal ? `${fmtBytes(data.diskUsed)} / ${fmtBytes(data.diskTotal)}` : "N/A" },
  ]

  for (let i = 0; i < 3; i++) {
    const g = gauges[i]
    const X = P + i * (CW + GAP)
    box(ctx, X, R1Y, CW, R1H)

    t(ctx, X + 14, R1Y + 14, g.title, "bold 11px Arial", "rgba(255,255,255,0.9)")
    t(ctx, X + 14, R1Y + 28, g.sub,   "10px Arial",      "rgba(255,255,255,0.38)")

    const cx = X + CW / 2
    const cy = R1Y + 100
    arc(ctx, cx, cy, 40, g.pct, g.color)

    ctx.fillStyle    = "#ffffff"
    ctx.font         = "bold 19px Arial"
    ctx.textAlign    = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(`${g.pct}%`, cx, cy)

    ctx.font         = "10px Arial"
    ctx.fillStyle    = "rgba(255,255,255,0.38)"
    ctx.textBaseline = "top"
    ctx.textAlign    = "center"
    ctx.fillText(trunc(ctx, g.detail, CW - 20), cx, R1Y + R1H - 20)
  }

  const R2Y = R1Y + R1H + GAP
  const R2H = 128
  const HW  = (W - P * 2 - GAP) / 2

  box(ctx, P, R2Y, HW, R2H)
  t(ctx, P + 14, R2Y + 14, "SYSTEM INFO", "bold 11px Arial", "rgba(255,255,255,0.9)")

  const C1 = P + 14
  const C2 = P + HW / 2 + 8

  t(ctx, C1, R2Y + 38, "Platform",               "10px Arial",      "rgba(255,255,255,0.38)")
  t(ctx, C1, R2Y + 51, os.type().toUpperCase(),  "bold 13px Arial", "#ffffff")
  t(ctx, C2, R2Y + 38, "Arch",                   "10px Arial",      "rgba(255,255,255,0.38)")
  t(ctx, C2, R2Y + 51, os.arch(),                "bold 13px Arial", "#ffffff")
  t(ctx, C1, R2Y + 80, "Bot Uptime",             "10px Arial",      "rgba(255,255,255,0.38)")
  t(ctx, C1, R2Y + 93, runtime(process.uptime()),"bold 13px Arial", "#ffffff")
  t(ctx, C2, R2Y + 80, "OS Uptime",              "10px Arial",      "rgba(255,255,255,0.38)")
  t(ctx, C2, R2Y + 93, runtime(os.uptime()),     "bold 13px Arial", "#ffffff")

  const MX   = P + HW + GAP
  const MPAD = 14
  box(ctx, MX, R2Y, HW, R2H)
  t(ctx, MX + MPAD, R2Y + 14, "MEMORY DETAIL", "bold 11px Arial", "rgba(255,255,255,0.9)")

  const mem      = process.memoryUsage()
  const memItems = [
    { label: "RSS",        val: fmtBytes(mem.rss),       color: "#ef4444" },
    { label: "Heap Total", val: fmtBytes(mem.heapTotal),  color: "#a855f7" },
    { label: "Heap Used",  val: fmtBytes(mem.heapUsed),   color: "#818cf8" },
    { label: "External",   val: fmtBytes(mem.external),   color: "#22c55e" },
  ]

  const colW  = HW / 2
  const valW  = 52
  const barW  = colW - MPAD * 2 - valW - 4

  for (let i = 0; i < 4; i++) {
    const item = memItems[i]
    const col  = i % 2 === 0 ? MX + MPAD : MX + colW + MPAD
    const row  = Math.floor(i / 2)
    const BY   = R2Y + 36 + row * 40

    t(ctx, col, BY, item.label, "9px Arial", "rgba(255,255,255,0.38)")
    bar(ctx, col, BY + 13, barW, 5, 60, item.color)
    t(ctx, col + barW + 5, BY + 10, item.val, "9px Arial", "rgba(255,255,255,0.8)")
  }

  const now = new Date().toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" })
  ctx.fillStyle    = "rgba(255,255,255,0.28)"
  ctx.font         = "11px Arial"
  ctx.textAlign    = "left"
  ctx.textBaseline = "bottom"
  ctx.fillText(`${now} WIB`, P, H - 12)
  ctx.textAlign = "right"
  ctx.fillText("Powered by KyzoYamada", W - P, H - 12)

  return canvas.toBuffer("image/png")
}

let handler = async (m, { sock }) => {
  const start = Date.now()
  await sock.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

  const disk = getDisk()
  const cpus = os.cpus()

  const data = {
    ping:      Date.now() - start,
    hostname:  os.hostname(),
    cpuPct:    getCpuPct(),
    cpuModel:  cpus[0]?.model ?? "Unknown",
    cpuCores:  cpus.length,
    cpuSpeed:  cpus[0]?.speed ?? 0,
    ramTotal:  os.totalmem(),
    ramUsed:   os.totalmem() - os.freemem(),
    ramFree:   os.freemem(),
    ramPct:    Math.round((os.totalmem() - os.freemem()) / os.totalmem() * 100),
    diskTotal: disk?.total ?? 0,
    diskUsed:  disk?.used ?? 0,
    diskFree:  disk?.free ?? 0,
    diskPct:   disk?.pct ?? 0,
  }

  const img = await draw(data)

  await sock.sendMessage(m.chat, {
    image:    img,
    caption:  "",
    mimetype: "image/png",
    annotations: [
      {
        polygonVertices: [
          { x: 0, y: 0 },
          { x: 1000, y: 0 },
          { x: 1000, y: 1000 },
          { x: 0, y: 1000 }
        ],
        embeddedAction: true
      }
    ]
  }, { quoted: m })

  await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
}

handler.command = ["ping", "speed", "pings"]

export default handler