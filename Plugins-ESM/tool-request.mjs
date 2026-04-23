import axios from "axios"

/* ============================= */
/* HANDLER                       */
/* ============================= */

const handler = async (m, { reply, args }) => {
  try {
    if (!args[0]) {
      return reply("❌ Masukkan URL.\nContoh:\n.request https://example.com")
    }

    const url = args[0]

    reply("⏳ Mengirim 100 request...")

    let success = 0
    let failed = 0
    const allResponses = []

    const requests = []

    for (let i = 0; i < 100; i++) {
      requests.push(
        axios.get(url)
          .then((res) => {
            success++
            allResponses.push({
              index: i + 1,
              status: res.status,
              data: res.data
            })
          })
          .catch((err) => {
            failed++
            allResponses.push({
              index: i + 1,
              error: err.message
            })
          })
      )
    }

    await Promise.allSettled(requests)

    let jsonOutput = JSON.stringify(allResponses, null, 2)

    if (jsonOutput.length > 4000) {
      jsonOutput = jsonOutput.slice(0, 4000) + "\n\n... (dipotong karena terlalu panjang)"
    }

    reply(
      `✅ Selesai!\n\n` +
      `Success: ${success}\n` +
      `Failed: ${failed}\n\n` +
      `📦 Semua Response:\n\`\`\`json\n${jsonOutput}\n\`\`\``
    )

  } catch (err) {
    console.error(err)
    reply(
      "❌ Terjadi Error!\n\nDetail:\n```" +
      err.message +
      "```"
    )
  }
}

/* ============================= */
/* EXPORT                        */
/* ============================= */

handler.help = ["request <url>"]
handler.tags = ["tools"]
handler.command = ["request"]
handler.owner = true

export default handler