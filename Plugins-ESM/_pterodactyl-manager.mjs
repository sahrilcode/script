import crypto from "crypto"

const handler = async (m, { sock, text, command, args, isOwner, isPremium, reply }) => {
  

  if (command === "cadmin") {
    if (!isOwner) return reply("Owner only")
    if (!text) return reply("username")

    let username = text.toLowerCase()
    let email = username + "@gmail.com"
    let name = username.charAt(0).toUpperCase() + username.slice(1)
    let password = username + crypto.randomBytes(2).toString("hex")

    let f = await fetch(global.domain + "/api/application/users", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + global.apikey
      },
      body: JSON.stringify({
        email,
        username,
        first_name: name,
        last_name: "Admin",
        root_admin: true,
        language: "en",
        password
      })
    })

    let data = await f.json()
    if (data.errors) return reply(JSON.stringify(data.errors[0], null, 2))

    let user = data.attributes

    return reply(`
*Berhasil Membuat Admin Panel ✅*

ID: ${user.id}
Nama: ${user.first_name}
Username: ${user.username}
Password: ${password}
Login: ${global.domain}
`)
  }

  const paketMap = {
    "1gb": [1000, 1000, 40],
    "2gb": [2000, 1000, 60],
    "3gb": [3000, 2000, 80],
    "4gb": [4000, 2000, 100],
    "5gb": [5000, 3000, 120],
    "6gb": [6000, 3000, 140],
    "7gb": [7000, 4000, 160],
    "8gb": [8000, 4000, 180],
    "9gb": [9000, 5000, 200],
    "10gb": [10000, 5000, 220],
    "unlimited": [0, 0, 0],
    "unli": [0, 0, 0]
  }

  if (paketMap[command]) {
    if (!isOwner && !isPremium) return reply("Owner / Premium only")
    if (!text) return reply("username")

    let [ram, disk, cpu] = paketMap[command]

    let username = text.toLowerCase()
    let email = username + "@gmail.com"
    let password = username + crypto.randomBytes(2).toString("hex")

    let createUser = await fetch(global.domain + "/api/application/users", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + global.apikey
      },
      body: JSON.stringify({
        email,
        username,
        first_name: username + " Server",
        last_name: "Server",
        language: "en",
        password
      })
    })

    let userData = await createUser.json()
    if (userData.errors) return reply(JSON.stringify(userData.errors[0], null, 2))

    let user = userData.attributes

    let createServer = await fetch(global.domain + "/api/application/servers", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + global.apikey
      },
      body: JSON.stringify({
        name: username + " Server",
        user: user.id,
        egg: parseInt(global.egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
        startup: "npm start",
        limits: {
          memory: ram,
          swap: 0,
          disk,
          io: 500,
          cpu
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 5
        },
        deploy: {
          locations: [parseInt(global.loc)],
          dedicated_ip: false,
          port_range: []
        }
      })
    })

    let serverData = await createServer.json()
    if (serverData.errors) return reply(JSON.stringify(serverData.errors[0], null, 2))

    return reply(`
*Berhasil Membuat Panel ✅*

ID Server: ${serverData.attributes.id}
Username: ${user.username}
Password: ${password}
Ram: ${ram === 0 ? "Unlimited" : ram / 1000 + "GB"}
CPU: ${cpu === 0 ? "Unlimited" : cpu + "%"}
Disk: ${disk === 0 ? "Unlimited" : disk / 1000 + "GB"}
Login: ${global.domain}
`)
  }

  if (command === "listadmin") {
    if (!isOwner) return reply("Owner only")

    let cek = await fetch(global.domain + "/api/application/users?page=1", {
      headers: {
        Authorization: "Bearer " + global.apikey,
        Accept: "application/json"
      }
    })

    let res = await cek.json()
    let users = res.data.filter(u => u.attributes.root_admin)

    if (!users.length) return reply("Tidak ada admin panel")

    let teks = "*List Admin Panel*\n\n"
    for (let u of users) {
      teks += `ID: ${u.attributes.id}\nNama: ${u.attributes.first_name}\n\n`
    }

    return reply(teks)
  }

  if (["listpanel", "listp", "listserver"].includes(command)) {
    if (!isOwner) return reply("Owner only")

    let f = await fetch(global.domain + "/api/application/servers?page=1", {
      headers: {
        Authorization: "Bearer " + global.apikey,
        Accept: "application/json"
      }
    })

    let res = await f.json()
    if (!res.data.length) return reply("Tidak ada server")

    let teks = "*List Server*\n\n"
    for (let s of res.data) {
      let a = s.attributes
      teks += `ID: ${a.id}\nNama: ${a.name}\nRAM: ${a.limits.memory}\n\n`
    }

    return reply(teks)
  }

  if (command === "deladmin") {
    if (!isOwner) return reply("Owner only")
    if (!text) return reply("id")

    await fetch(global.domain + `/api/application/users/${text}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + global.apikey
      }
    })

    return reply("Berhasil hapus admin")
  }

  if (command === "delpanel") {
    if (!isOwner) return reply("Owner only")
    if (!text) return reply("id")

    await fetch(global.domain + `/api/application/servers/${text}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + global.apikey
      }
    })

    return reply("Berhasil hapus server panel")
  }
}

handler.command = [
  "cadmin",
  "1gb","2gb","3gb","4gb","5gb",
  "6gb","7gb","8gb","9gb","10gb",
  "unlimited","unli",
  "listadmin",
  "listpanel","listp","listserver",
  "deladmin",
  "delpanel"
]

handler.tags = ["panel"]
handler.help = handler.command

export default handler