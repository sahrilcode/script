
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { useLimit } from "./limit.js"; // path relatif ke handler.mjs

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const loadPlugins = async () => {
  const dir = path.join(__dirname, "../Plugins-ESM")
  const plugins = []
  if (!fs.existsSync(dir)) return plugins

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".js") && !file.endsWith(".mjs")) continue
    const filePath = path.join(dir, file)

    try {
      const imported = await import(filePath + `?v=${Date.now()}`)
      const plugin = imported.default
      

      if (typeof plugin === "function") {
        const validCommand = (plugin.command && Array.isArray(plugin.command)) || 
                             plugin.command instanceof RegExp
        if (validCommand) {
          if (typeof plugin.limit === "undefined") plugin.limit = false
          plugins.push(plugin)
        } else {
          console.warn(`Plugin ESM '${file}' tidak memiliki command yang valid`)
        }
      }
    } catch (e) {
      console.error("Plugin error:", file, e)
    }
  }

  return plugins
}

const handleMessage = async (m, commandText, Obj, isFinal = false) => {
  const plugins = await loadPlugins()
  let executed = false

  Obj.isOwner = Obj?.isOwner ?? false
  Obj.isPremium = Obj?.isPremium ?? false
  Obj.isGroup = Obj?.isGroup ?? false
  Obj.isPrivate = !Obj.isGroup

  for (const plugin of plugins) {
    let match = false

    if (plugin.command instanceof RegExp) {
      match = plugin.command.test(commandText)
    } else if (Array.isArray(plugin.command)) {
      match = plugin.command.some(c => c.toLowerCase() === commandText.toLowerCase())
    }

    if (!match) continue

    if (plugin.owner && !Obj.isOwner) {
      Obj.reply?.("❌ Owner only!")
      executed = true
      break
    }

    if (plugin.premium && !Obj.isPremium) {
      Obj.reply?.("❌ Premium only!")
      executed = true
      break
    }

    if (plugin.group && !Obj.isGroup) {
      Obj.reply?.("❌ Group only!")
      executed = true
      break
    }

    if (plugin.private && !Obj.isPrivate) {
      Obj.reply?.("❌ Private chat only!")
      executed = true
      break
    }

    if (plugin.limit && !Obj.isOwner && !Obj.isPremium) {
      const result = useLimit(m.sender)
      if (!result.allowed) {
        Obj.reply?.("❌ Limit anda habis!")
        executed = true
        break
      } else {
        Obj.reply?.(`Telah menggunakan 1 limit ✅\nSisa limit: ${result.remaining}`)
      }
    }

    try {
      console.log(`🔧 Running ESM plugin: ${commandText}`)
      await plugin(m, Obj)
      executed = true
    } catch (err) {
      console.error("Plugin error:", err)
    }
    break
  }
  
  return executed
}

export default handleMessage