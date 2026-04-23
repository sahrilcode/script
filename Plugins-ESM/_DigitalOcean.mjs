import axios from 'axios'

const DO_API = 'https://api.digitalocean.com/v2'

const doHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${global.doToken}`
})

const generatePassword = () => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 8 }, () => charset[Math.floor(Math.random() * charset.length)]).join('')
}

const createDroplet = async (hostname, size) => {
  const password = generatePassword()
  const dropletData = {
    name: hostname,
    region: 'sgp1',
    size,
    image: 'ubuntu-20-04-x64',
    ssh_keys: null,
    backups: false,
    ipv6: true,
    user_data: `#cloud-config\npassword: ${password}\nchpasswd: { expire: False }`,
    private_networking: null,
    volumes: null,
    tags: ['T']
  }

  const response = await fetch(`${DO_API}/droplets`, {
    method: 'POST',
    headers: doHeaders(),
    body: JSON.stringify(dropletData)
  })

  const responseData = await response.json()
  if (!response.ok) throw new Error(`Gagal membuat VPS: ${responseData.message}`)

  return { dropletId: responseData.droplet.id, password }
}

const getDropletIp = async (dropletId) => {
  const res = await fetch(`${DO_API}/droplets/${dropletId}`, {
    method: 'GET',
    headers: doHeaders()
  })
  const data = await res.json()
  const v4 = data.droplet.networks.v4
  return v4 && v4.length > 0 ? v4[0].ip_address : 'Tidak ada alamat IP yang tersedia!'
}

let handler = async (m, { sock, args, command, reply, isOwner, mess }) => {

  if (!isOwner) return reply(mess.owner)

  switch (command) {

    case 'cvps1g1c':
    case 'vps1g1c':
    case 'cvps2g1c':
    case 'vps2g1c':
    case 'cvps4g2c':
    case 'vps4g2c':
    case 'cvps8g4c':
    case 'vps8g4c':
    case 'cvps16g4c':
    case 'vps16g4c': {
      if (!args[0]) return reply('Masukkan hostname VPS nya!')

      const sizeMap = {
        'cvps1g1c':  's-1vcpu-1gb',
        'vps1g1c':   's-1vcpu-1gb',
        'cvps2g1c':  's-1vcpu-2gb',
        'vps2g1c':   's-1vcpu-2gb',
        'cvps4g2c':  's-2vcpu-4gb',
        'vps4g2c':   's-2vcpu-4gb',
        'cvps8g4c':  's-4vcpu-8gb',
        'vps8g4c':   's-4vcpu-8gb',
        'cvps16g4c': 's-4vcpu-16gb',
        'vps16g4c':  's-4vcpu-16gb'
      }

      try {
        const { dropletId, password } = await createDroplet(args[0], sizeMap[command])
        reply('Tunggu Sebentar...')
        await new Promise(resolve => setTimeout(resolve, 60000))
        const ipVPS = await getDropletIp(dropletId)

        await sock.sendMessage(m.chat, {
          text: `VPS berhasil dibuat!\n\nID: ${dropletId}\nIP VPS: ${ipVPS}\nPassword: ${password}`
        }, { quoted: m })
      } catch (err) {
        reply(`Terjadi kesalahan saat membuat VPS: ${err.message}`)
      }
      break
    }

    case 'listdroplet': {
      try {
        const response = await fetch(`${DO_API}/droplets`, { headers: doHeaders() })
        const data = await response.json()
        const droplets = data.droplets || []

        let mesej = `List droplet digital ocean kamu: ${droplets.length}\n\n`

        if (droplets.length === 0) {
          mesej += 'Tidak ada droplet yang tersedia!'
        } else {
          droplets.forEach(droplet => {
            const ipv4 = droplet.networks.v4.filter(n => n.type === 'public')
            const ip = ipv4.length > 0 ? ipv4[0].ip_address : 'Tidak ada IP!'
            mesej +=
              `Droplet ID: ${droplet.id}\n` +
              `Hostname: ${droplet.name}\n` +
              `Username: Root\n` +
              `IP: ${ip}\n` +
              `Ram: ${droplet.memory} MB\n` +
              `Cpu: ${droplet.vcpus} CPU\n` +
              `OS: ${droplet.image.distribution}\n` +
              `Storage: ${droplet.disk} GB\n` +
              `Status: ${droplet.status}\n\n`
          })
        }

        await sock.sendMessage(m.chat, { text: mesej }, { quoted: m })
      } catch (err) {
        reply(`Terjadi kesalahan saat mengambil data droplet: ${err.message}`)
      }
      break
    }

    case 'deldroplet': {
      if (!args[0]) return reply('ID droplet belum diberikan!')
      try {
        const response = await fetch(`${DO_API}/droplets/${args[0]}`, {
          method: 'DELETE',
          headers: doHeaders()
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`Gagal menghapus droplet: ${errorData.message}`)
        }
        reply('Droplet berhasil dihapus!')
      } catch (err) {
        reply(`Terjadi kesalahan saat menghapus droplet: ${err.message}`)
      }
      break
    }

    case 'sisadroplet': {
      try {
        const [accountRes, dropletsRes] = await Promise.all([
          axios.get(`${DO_API}/account`, { headers: { Authorization: `Bearer ${global.doToken}` } }),
          axios.get(`${DO_API}/droplets`, { headers: { Authorization: `Bearer ${global.doToken}` } })
        ])
        const dropletLimit = accountRes.data.account.droplet_limit
        const totalDroplets = dropletsRes.data.droplets.length
        const remaining = dropletLimit - totalDroplets
        reply(`Sisa droplet yang dapat kamu pakai: ${remaining}\n\nTotal droplet terpakai: ${totalDroplets}`)
      } catch (err) {
        reply(`Terjadi kesalahan: ${err.message}`)
      }
      break
    }

    case 'cekdroplet': {
      if (!args[0]) return reply('ID droplet belum diberikan!')
      try {
        const response = await fetch(`${DO_API}/droplets/${args[0]}`, { headers: doHeaders() })
        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.message)
        }
        const { droplet } = await response.json()
        const ipv4 = droplet.networks.v4.filter(n => n.type === 'public')
        const ip = ipv4.length > 0 ? ipv4[0].ip_address : 'Tidak ada IP!'
        const ram = droplet.memory / 1024

        await sock.sendMessage(m.chat, {
          text:
            `*DETAIL VPS KAMU*\n` +
            `Droplet ID: ${droplet.id}\n` +
            `Hostname: ${droplet.name}\n` +
            `IPv4: ${ip}\n` +
            `Ram: ${ram} GB\n` +
            `OS: ${droplet.image.distribution}\n` +
            `CPU: ${droplet.vcpus} vCPU\n` +
            `Storage: ${droplet.disk} GB\n` +
            `Status: ${droplet.status}`
        }, { quoted: m })
      } catch (err) {
        reply(`Terjadi kesalahan saat memeriksa detail droplet: ${err.message}`)
      }
      break
    }

    case 'turnon': {
      if (!args[0]) return reply('ID droplet belum diberikan!')
      try {
        const response = await axios.post(
          `${DO_API}/droplets/${args[0]}/actions`,
          { type: 'power_on' },
          { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${global.doToken}` } }
        )
        if (response.status === 201 && response.data.action?.status === 'in-progress') {
          reply('VPS (droplet) sedang dihidupkan...')
        } else {
          reply('Gagal menghidupkan VPS (droplet).')
        }
      } catch (err) {
        reply(`Terjadi kesalahan saat menghidupkan VPS: ${err.message}`)
      }
      break
    }

    case 'turnoff': {
      if (!args[0]) return reply('ID droplet belum diberikan!')
      try {
        const response = await axios.post(
          `${DO_API}/droplets/${args[0]}/actions`,
          { type: 'power_off' },
          { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${global.doToken}` } }
        )
        if (response.status === 201 && response.data.action?.status === 'in-progress') {
          reply('VPS (droplet) sedang dimatikan...')
        } else {
          reply('Gagal mematikan VPS (droplet).')
        }
      } catch (err) {
        reply(`Terjadi kesalahan saat mematikan VPS: ${err.message}`)
      }
      break
    }

    case 'restartvps': {
      if (!args[0]) return reply('ID droplet belum diberikan!')
      try {
        const response = await fetch(`${DO_API}/droplets/${args[0]}/actions`, {
          method: 'POST',
          headers: doHeaders(),
          body: JSON.stringify({ type: 'reboot' })
        })
        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.message)
        }
        const data = await response.json()
        reply(`Aksi restart VPS berhasil dimulai. Status aksi: ${data.action.status}`)
      } catch (err) {
        reply(`Terjadi kesalahan saat restart VPS: ${err.message}`)
      }
      break
    }
  }
}

handler.command = [
  'cvps1g1c', 'vps1g1c',
  'cvps2g1c', 'vps2g1c',
  'cvps4g2c', 'vps4g2c',
  'cvps8g4c', 'vps8g4c',
  'cvps16g4c', 'vps16g4c',
  'listdroplet',
  'deldroplet',
  'sisadroplet',
  'cekdroplet',
  'turnon',
  'turnoff',
  'restartvps'
]

handler.owner = true

export default handler