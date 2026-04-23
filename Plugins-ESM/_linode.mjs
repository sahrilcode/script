const randomKarakter = (n) => Array.from({ length: n }, () => 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]).join('')
const randomNomor = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('')

const LINODE_API = 'https://api.linode.com/v4'

const linodeHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${global.linodeToken}`
})

const createLinode = async (label, type) => {
  const root_pass = randomKarakter(5) + randomNomor(3)
  const linodeData = {
    label,
    region: 'ap-south',
    type,
    image: 'linode/ubuntu20.04',
    root_pass,
    stackscript_id: null,
    authorized_keys: null,
    backups_enabled: false
  }

  const response = await fetch(`${LINODE_API}/linode/instances`, {
    method: 'POST',
    headers: linodeHeaders(),
    body: JSON.stringify(linodeData)
  })

  const responseData = await response.json()
  if (!response.ok) throw new Error(`Gagal membuat Linode: ${responseData.errors[0].reason}`)

  return { id: responseData.id, root_pass }
}

let handler = async (m, { sock, args, command, reply, isOwner, mess }) => {
  switch (command) {

    case 'linode2gb':
    case 'linode4gb':
    case 'linode8gb':
    case 'linode16gb': {
      if (!isOwner) return reply(mess.owner)
      if (!args[0]) return reply(`Contoh: .${command} nama-vps`)

      const typeMap = {
        linode2gb: 'g6-standard-1',
        linode4gb: 'g6-standard-2',
        linode8gb: 'g6-standard-4',
        linode16gb: 'g6-standard-8'
      }

      try {
        const { id: linodeId, root_pass } = await createLinode(args[0], typeMap[command])
        m.reply('Tunggu Sebentar...')
        await new Promise(resolve => setTimeout(resolve, 60000))

        const linodeResponse = await fetch(`${LINODE_API}/linode/instances/${linodeId}`, {
          method: 'GET',
          headers: linodeHeaders()
        })
        const linodeInfo = await linodeResponse.json()
        const ipAddress = linodeInfo.ipv4[0]

        await sock.sendMessage(m.chat, {
          text: `Linode berhasil dibuat!\n\nID: ${linodeId}\nIP Linode: ${ipAddress}\nPassword: ${root_pass}`
        }, { quoted: m })
      } catch (err) {
        m.reply(`Terjadi kesalahan saat membuat Linode: ${err.message}`)
      }
      break
    }

    case 'listlinode': {
      if (!isOwner) return reply(mess.owner)
      try {
        const response = await fetch(`${LINODE_API}/linode/instances`, {
          method: 'GET',
          headers: linodeHeaders()
        })
        const responseData = await response.json()
        if (!response.ok) throw new Error('Gagal mendapatkan daftar Linode.')

        let messageText = 'Daftar Linode VPS:\n\n'
        responseData.data.forEach(linode => {
          messageText += `ID: ${linode.id}\nLabel: ${linode.label}\nIP: ${linode.ipv4[0]}\n\n`
        })

        await sock.sendMessage(m.chat, { text: messageText }, { quoted: m })
      } catch (err) {
        m.reply(`Terjadi kesalahan saat mendapatkan daftar Linode: ${err.message}`)
      }
      break
    }

    case 'onlinode': {
      if (!isOwner) return reply(mess.owner)
      if (!args[0]) return reply(`Contoh: .${command} ID`)
      try {
        const response = await fetch(`${LINODE_API}/linode/instances/${args[0]}/boot`, {
          method: 'POST',
          headers: linodeHeaders()
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(`Gagal menghidupkan Linode: ${data.errors[0]?.reason || 'Unknown Error'}`)
        }
        m.reply(`Linode dengan ID ${args[0]} berhasil dihidupkan.`)
      } catch (err) {
        m.reply(`Terjadi kesalahan saat menghidupkan Linode: ${err.message}`)
      }
      break
    }

    case 'offlinode': {
      if (!isOwner) return reply(mess.owner)
      if (!args[0]) return reply(`Contoh: .${command} ID`)
      try {
        const response = await fetch(`${LINODE_API}/linode/instances/${args[0]}/shutdown`, {
          method: 'POST',
          headers: linodeHeaders()
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(`Gagal mematikan Linode: ${data.errors[0].reason}`)
        }
        m.reply(`Linode dengan ID ${args[0]} berhasil dimatikan.`)
      } catch (err) {
        m.reply(`Terjadi kesalahan saat mematikan Linode: ${err.message}`)
      }
      break
    }

    case 'rebootlinode': {
      if (!isOwner) return reply(mess.owner)
      if (!args[0]) return reply(`Contoh: .${command} ID`)
      try {
        const response = await fetch(`${LINODE_API}/linode/instances/${args[0]}/reboot`, {
          method: 'POST',
          headers: linodeHeaders()
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(`Gagal me-restart Linode: ${data.errors[0].reason}`)
        }
        m.reply(`Linode dengan ID ${args[0]} berhasil di-restart.`)
      } catch (err) {
        m.reply(`Terjadi kesalahan saat me-restart Linode: ${err.message}`)
      }
      break
    }

    case 'rebuildlinode': {
      if (!isOwner) return reply(mess.owner)
      if (!args[0] || !args[1]) return reply(`Contoh: .${command} ID linode/ubuntu20.04`)
      try {
        const rootPassword = randomKarakter(4) + randomNomor(3)
        const response = await fetch(`${LINODE_API}/linode/instances/${args[0]}/rebuild`, {
          method: 'POST',
          headers: linodeHeaders(),
          body: JSON.stringify({ image: args[1], root_pass: rootPassword })
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(`Gagal rebuild Linode: ${data.errors[0]?.reason || 'Unknown Error'}`)
        }
        m.reply(`Linode dengan ID ${args[0]} berhasil di-rebuild dengan image ${args[1]}. Password root baru: ${rootPassword}`)
      } catch (err) {
        m.reply(`Terjadi kesalahan saat rebuild Linode: ${err.message}`)
      }
      break
    }

    case 'delinode': {
      if (!isOwner) return reply(mess.owner)
      if (!args[0]) return reply(`Contoh: .${command} ID`)
      try {
        const response = await fetch(`${LINODE_API}/linode/instances/${args[0]}`, {
          method: 'DELETE',
          headers: linodeHeaders()
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(`Gagal menghapus Linode: ${data.errors[0].reason}`)
        }
        m.reply(`Linode dengan ID ${args[0]} berhasil dihapus.`)
      } catch (err) {
        m.reply(`Terjadi kesalahan saat menghapus Linode: ${err.message}`)
      }
      break
    }

    case 'saldolinode': {
      if (!isOwner) return reply(mess.owner)
      try {
        const response = await fetch(`${LINODE_API}/account`, {
          method: 'GET',
          headers: linodeHeaders()
        })
        const accountInfo = await response.json()
        if (!response.ok) throw new Error('Gagal mendapatkan saldo Linode.')

        const balance = (accountInfo.balance / 100).toFixed(2)
        const credit = (accountInfo.credit_remaining / 100).toFixed(2)

        m.reply(`Saldo Akun Linode:\n\n- Balance: $${balance}\n- Credit Remaining: $${credit}`)
      } catch (err) {
        m.reply(`Terjadi kesalahan saat memeriksa saldo Linode: ${err.message}`)
      }
      break
    }

    case 'sisalinode': {
      if (!isOwner) return reply(mess.owner)
      try {
        const response = await fetch(`${LINODE_API}/linode/instances`, {
          method: 'GET',
          headers: linodeHeaders()
        })
        const responseData = await response.json()
        if (!response.ok) throw new Error('Gagal mendapatkan data Linode.')

        m.reply(`Total Linode yang aktif: ${responseData.data.length}`)
      } catch (err) {
        m.reply(`Terjadi kesalahan saat memeriksa jumlah Linode: ${err.message}`)
      }
      break
    }

    case 'cekvpslinode': {
      if (!isOwner) return reply(mess.owner)
      if (!args[0]) return reply(`Contoh: .${command} ID`)
      try {
        const response = await fetch(`${LINODE_API}/linode/instances/${args[0]}`, {
          method: 'GET',
          headers: linodeHeaders()
        })
        const linodeInfo = await response.json()
        if (!response.ok) throw new Error('Gagal mendapatkan detail Linode.')

        const messageText =
          `Detail Linode:\n\n` +
          `ID: ${linodeInfo.id}\n` +
          `Label: ${linodeInfo.label}\n` +
          `Status: ${linodeInfo.status}\n` +
          `Region: ${linodeInfo.region}\n` +
          `Type: ${linodeInfo.type}\n` +
          `IP: ${linodeInfo.ipv4.join(', ')}`

        await sock.sendMessage(m.chat, { text: messageText }, { quoted: m })
      } catch (err) {
        m.reply(`Terjadi kesalahan saat memeriksa detail Linode: ${err.message}`)
      }
      break
    }
  }
}

handler.command = [
  'linode2gb', 'linode4gb', 'linode8gb', 'linode16gb',
  'listlinode',
  'onlinode', 'offlinode', 'rebootlinode', 'rebuildlinode', 'delinode',
  'saldolinode', 'sisalinode', 'cekvpslinode'
]

handler.owner = true

export default handler