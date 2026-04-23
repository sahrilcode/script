
import fs from "fs"
import babel from "@babel/core"

function convertEsmToCjs(code) {
  let out = code

  out = out.replace(
    /import\s+([A-Za-z0-9_$]+)\s+from\s+(['"`][^'"`]+['"`]);?/g,
    (m, def, mod) => `const ${def} = require(${mod});`
  )

  out = out.replace(
    /import\s+\{\s*([^}]+)\s*\}\s+from\s+(['"`][^'"`]+['"`]);?/g,
    (m, list, mod) => {
      const mapped = list
        .split(",")
        .map(s => s.trim().replace(/\s+as\s+/i, ": "))
        .join(", ")
      return `const { ${mapped} } = require(${mod});`
    }
  )

  out = out.replace(
    /import\s+\*\s+as\s+([A-Za-z0-9_$]+)\s+from\s+(['"`][^'"`]+['"`]);?/g,
    (m, name, mod) => `const ${name} = require(${mod});`
  )

  out = out.replace(/export\s+default\s+/g, "module.exports = ")
  out = out.replace(/export\s+(const|let|var)\s+/g, "$1 ")

  return out
}

function convertCJS(code) {
  let result = code

  result = result.replace(
    /const\s+(\w+)\s*=\s*require\(['"](.+?)['"]\)/g,
    "import $1 from '$2'"
  )

  result = result.replace(
    /module\.exports\s*=\s*/g,
    "export default "
  )

  result = result.replace(
    /exports\.(\w+)\s*=\s*/g,
    "export const $1 = "
  )

  return result
}

const handler = async (m, { sock, text, args, command, quoted, reply }) => {
  try {

    if (command === "case2plugin") {
      let code = text || (quoted && quoted.text)
      if (!code) return reply("Reply code case!")

      let nameMatch = code.match(/case\s+["'](.+?)["']:/)
      let cmd = nameMatch ? nameMatch[1] : "cmd"

      let body = code
        .replace(/case\s+["'](.+?)["']:\s*/g, "")
        .replace(/break/g, "")
        .trim()

      let result = `
const handler = async (m, { text, args, reply, sock }) => {
${body}
}

handler.command = ["${cmd}"]
handler.tags = ["tools"]
handler.desc = "${cmd} command"

module.exports = handler
`

      return reply("```js\n" + result + "\n```")
    }

    if (command === "cjs2esm") {
      let code = text || (quoted && quoted.text)
      if (!code) return reply("Reply code CJS.")

      let esm = convertCJS(code)

      return reply("```js\n" + esm + "\n```")
    }

    if (command === "esm2cjs") {
      let code = text || (quoted && quoted.text)
      if (!code) return reply("Reply code ESM.")

      const useBabel = false
      let converted

      if (useBabel) {
        const res = await babel.transformAsync(code, {
          plugins: ["@babel/plugin-transform-modules-commonjs"],
          sourceType: "module",
          configFile: false,
          babelrc: false,
        })
        converted = res.code
      } else {
        converted = convertEsmToCjs(code)
      }

      const buffer = Buffer.from(converted, "utf8")

      return sock.sendMessage(m.chat, {
        document: buffer,
        fileName: "converted.cjs",
        mimetype: "text/javascript"
      }, { quoted: m })
    }

  } catch (err) {
    console.log(err)
    reply("❌ Error: " + err.message)
  }
}

handler.command = [
  "case2plugin",
  "cjs2esm",
  "esm2cjs"
]

handler.tags = ["tools"]
handler.desc = "Code converter & uploader tools"
handler.limit = true

export default handler