import axios from "axios"

async function searchLyrics(title) {
  try {
    const keyword = String(title).trim()
    if (!keyword) throw new Error("heat waves")

    const { data } = await axios.get(
      `https://lrclib.net/api/search?q=${encodeURIComponent(keyword)}`,
      {
        headers: {
          accept: "application/json, text/plain, */*",
          referer: `https://lrclib.net/search/${encodeURIComponent(keyword)}`,
          "user-agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
        },
        timeout: 60000,
      }
    )

    if (!data) throw new Error("Response not found")
    if (!Array.isArray(data)) throw new Error("Invalid response format")

    const results = data.map((v) => ({
      id: v?.id ?? null,
      track: v?.trackName ?? null,
      artist: v?.artistName ?? null,
      album: v?.albumName ?? null,
      duration: v?.duration ?? null,
      instrumental: v?.instrumental ?? false,
      lyrics: v?.plainLyrics ?? null,
    }))

    return {
      success: true,
      query: keyword,
      total: results.length,
      results,
    }
  } catch (err) {
    return {
      success: false,
      message: "Failed to search for lyrics",
      error:
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message,
      status: err?.response?.status || null,
    }
  }
}

const handler = async (m, { text, reply }) => {
  if (!text)
    return reply("❌ Masukkan judul lagu!\nContoh:\n.lirik2 heat waves")

  const res = await searchLyrics(text)

  if (!res.success)
    return reply(`❌ Error:\n${res.error}`)

  if (res.total === 0)
    return reply("❌ Lirik tidak ditemukan.")

  const first = res.results[0]

  if (!first.lyrics)
    return reply("❌ Lirik tidak tersedia.")

  let caption = `🎵 *${first.track}*\n`
  caption += `👤 ${first.artist}\n`
  if (first.album) caption += `💿 ${first.album}\n`
  caption += `\n📜 LIRIK:\n\n`
  caption += first.lyrics

  if (caption.length > 4000) {
    caption = caption.slice(0, 4000) + "\n\n... (terpotong)"
  }

  reply(caption)
}

handler.help = ["lyrics2 <judul>", "lirik2 <judul>"]
handler.tags = ["search"]
handler.command = ["lyrics2", "lirik2"]

export default handler