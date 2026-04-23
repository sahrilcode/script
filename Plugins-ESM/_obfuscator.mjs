import JsConfuser from 'js-confuser'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const extractCode = (obf) => typeof obf === 'string' ? obf : (obf?.code) || String(obf)

const baseObfOptions = {
  target: 'node',
  compact: true,
  renameVariables: true,
  renameGlobals: true,
  stringEncoding: true,
  stringSplitting: true,
  shuffle: true,
  duplicateLiteralsRemoval: true,
  deadCode: true,
  calculator: true,
  opaquePredicates: true,
  lock: {
    selfDefending: true,
    antiDebug: true,
    integrity: true,
    tamperProtection: true
  }
}

const obfProfiles = {
  arab: () => {
    const chars = ['أ','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي']
    return {
      ...baseObfOptions,
      identifierGenerator: () => Array.from({ length: Math.floor(Math.random() * 4) + 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
      controlFlowFlattening: 0.95
    }
  },
  china: () => {
    const chars = ['龙','虎','风','云','山','河','天','地','雷','电','火','水','木','金','土','星','月','日','光','影','峰','泉','林','海','雪','霜','雾','冰','焰','石']
    return {
      ...baseObfOptions,
      identifierGenerator: () => Array.from({ length: Math.floor(Math.random() * 4) + 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
      controlFlowFlattening: 0.95
    }
  },
  invis: () => ({
    ...baseObfOptions,
    identifierGenerator: () => '_'.repeat(Math.floor(Math.random() * 4) + 3) + Math.random().toString(36).slice(2, 5),
    controlFlowFlattening: 0.95
  }),
  siu: () => {
    const abc = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return {
      ...baseObfOptions,
      identifierGenerator: () => {
        let r = ''
        for (let i = 0; i < 6; i++) r += abc[Math.floor(Math.random() * abc.length)]
        return `CalceKarik和SiuSiu${r}`
      },
      stringCompression: true,
      controlFlowFlattening: 0.95,
      flatten: true
    }
  },
  strong: () => ({
    ...baseObfOptions,
    identifierGenerator: 'randomized',
    controlFlowFlattening: 0.75,
    dispatcher: true
  }),
  ultra: () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz'
    const nums = '0123456789'
    return {
      ...baseObfOptions,
      identifierGenerator: () => 'z' + nums[Math.floor(Math.random() * nums.length)] + chars[Math.floor(Math.random() * chars.length)] + Math.random().toString(36).slice(2, 6),
      stringCompression: true,
      controlFlowFlattening: 0.9,
      flatten: true,
      shuffle: true,
      rgf: true,
      dispatcher: true
    }
  }
}

const captions = {
  arab:   '✅ *Arab encrypted!*',
  china:  '✅ *Mandarin encrypted!*',
  invis:  '✅ *Invisible encrypted siap!*',
  siu:    '✅ *Calcrick Chaos Core encrypted!*',
  strong: '✅ *Hardened Strong encrypted!* — SATURN 🔥',
  ultra:  '✅ *Hardened Ultra encrypted!* — SATURN 🔥'
}

const typeMap = {
  'encarab': 'arab', 'encryptarab': 'arab', 'encrypt-arab': 'arab',
  'arabenc': 'arab', 'arab-encrypt': 'arab', 'enc-arab': 'arab',

  'encchina': 'china', 'encryptchina': 'china', 'encrypt-china': 'china',
  'chinaenc': 'china', 'china-encrypt': 'china', 'enc-china': 'china',
  'encmandarin': 'china', 'encryptmandarin': 'china', 'encrypt-mandarin': 'china',
  'mandarinenc': 'china', 'mandarin-encrypt': 'china', 'enc-mandarin': 'china',

  'encinvis': 'invis', 'encryptinvis': 'invis', 'encrypt-invis': 'invis',
  'invisenc': 'invis', 'invis-encrypt': 'invis', 'enc-invis': 'invis',
  'encinvisible': 'invis', 'encryptinvisible': 'invis', 'encrypt-invisible': 'invis',
  'invisibleenc': 'invis', 'invisible-encrypt': 'invis', 'enc-invisible': 'invis',

  'encsiu': 'siu', 'encryptsiu': 'siu', 'encrypt-siu': 'siu',
  'siuenc': 'siu', 'siu-encrypt': 'siu', 'enc-siu': 'siu',

  'encstrong': 'strong', 'encryptstrong': 'strong', 'encrypt-strong': 'strong',
  'strongenc': 'strong', 'strong-encrypt': 'strong', 'enc-strong': 'strong',

  'encultra': 'ultra', 'encryptultra': 'ultra', 'encrypt-ultra': 'ultra',
  'ultraenc': 'ultra', 'ultra-encrypt': 'ultra', 'enc-ultra': 'ultra'
}

const customCommands = [
  'enccustom', 'encryptcustom', 'encrypt-custom',
  'customenc', 'custom-encrypt', 'enc-custom'
]

let handler = async (m, { sock, text, command, prefix, reply }) => {
  const quoted = m.quoted
  if (!quoted) return m.reply('Kutip file .js untuk dienkripsi!')

  const fileName = quoted.fileName || ''
  if (!fileName.endsWith('.js')) return m.reply('Kutip file JavaScript (.js) untuk dienkripsi!')

  let media = await downloadContentFromMessage(quoted, 'document')
  let buffer = Buffer.from([])
  for await (const chunk of media) buffer = Buffer.concat([buffer, chunk])
  const raw = buffer.toString('utf8')

  try { new Function(raw) } catch (e) {
    return m.reply(`❌ File JS tidak valid:\n${e.message}`)
  }

  const isCustom = customCommands.includes(command)
  let type = typeMap[command]
  let obfOptions
  let prefix_name

  if (isCustom) {
    const customName = (text || '').trim().split(/\s+/)[0].replace(/[^a-zA-Z0-9_]/g, '')
    if (!customName) return m.reply(`Format: ${prefix + command} <nama>\nContoh: ${prefix + command} myid`)
    const abc = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    obfOptions = {
      ...baseObfOptions,
      identifierGenerator: () => {
        let suf = ''
        for (let i = 0; i < Math.floor(Math.random() * 3) + 2; i++) suf += abc[Math.floor(Math.random() * abc.length)]
        return `${customName}_${suf}`
      },
      controlFlowFlattening: 0.75,
      dispatcher: true
    }
    prefix_name = `custom-encrypted-${customName}`
  } else {
    obfOptions = obfProfiles[type]()
    prefix_name = `${type}-encrypted`
  }

  try {
    m.reply('⏳ Sedang mengenkripsi...')
    const obf = await JsConfuser.obfuscate(raw, obfOptions)
    const code = extractCode(obf)

    const outName = `${prefix_name}-${Date.now()}.js`
    const outPath = path.join(__dirname, outName)
    fs.writeFileSync(outPath, code, 'utf8')

    const fileBuffer = fs.readFileSync(outPath)
    await sock.sendMessage(m.chat, {
      document: fileBuffer,
      mimetype: 'application/javascript',
      fileName: outName,
      caption: isCustom ? `✅ *Custom encrypted (${(text || '').trim().split(/\s+/)[0]})!*` : captions[type]
    }, { quoted: m })

    try { fs.unlinkSync(outPath) } catch {}
  } catch (err) {
    m.reply(`❌ Terjadi kesalahan: ${err?.message || String(err)}`)
  }
}

handler.command = [...Object.keys(typeMap), ...customCommands]

export default handler