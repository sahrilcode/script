import axios from "axios"

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply("Example: .ttstalk username")

  try {
    const ts = Math.floor(Date.now() / 1000)

    const { data } = await axios.post(
      "https://soft-tree-dc7e.9f45zxhnvv.workers.dev/",
      {
        username: text,
        ts
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-App-Ts": ts,
          "X-App-Token": "d3cc7c074ab0e27e88537a2db8c47da71854f24994cdb747c7ceb7e869303615"
        }
      }
    )

    const caption = `
乂  *TIKTOK STALK*

👤 Nickname : ${data.nickname}
📛 Username : ${data.username}
🌍 Region : ${data.region}
🗣 Language : ${data.language}
📝 Bio : ${data.about}

📊 *Stats*
👥 Followers : ${data.stats.followers}
➡️ Following : ${data.stats.following}
❤️ Likes : ${data.stats.hearts}
🎬 Videos : ${data.stats.videos}
🤝 Friends : ${data.stats.friends}

🔒 Private : ${data.privateAccount}
✔️ Verified : ${data.isVerified}

🆔 User ID : ${data.userId}
`

    await conn.sendFile(
      m.chat,
      data.avatar,
      "avatar.jpg",
      caption,
      m
    )

  } catch (e) {
    console.error(e)
    m.reply("❌ Gagal mengambil data profil\n"+e)
  }
}

handler.help = ["ttstalk username"]
handler.tags = ["stalk"]
handler.command = ["ttstalk", "tiktokstalk"]

export default handler