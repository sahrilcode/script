
const axios = require('axios')
const BodyForm = require('form-data')
const { fromBuffer } = require('file-type')
const { fileTypeFromBuffer } = require('file-type')
const fetch = require('node-fetch')
const fs = require('fs')
const cheerio = require('cheerio')
const chalk = require('chalk')
const path = require('path')

const GITHUB_USER = "whatsapp-media"
const GITHUB_REPO = "whatsapp-media"
const GITHUB_TOKENS = [
  "-",
  "-",
  "-",
  "-",
  "-"
]
const BRANCH = "main"

const getRandomToken = () => GITHUB_TOKENS[Math.floor(Math.random() * GITHUB_TOKENS.length)]

async function UpGithuB(input) {
  let buffer, filename

  if (typeof input === "string") {
    buffer = fs.readFileSync(input)
    filename = path.basename(input) || `file_${Date.now()}`
  } 
  else if (Buffer.isBuffer(input)) {
    buffer = input
    const type = await fileTypeFromBuffer(buffer)
    const ext = type?.ext ?? "bin"
    filename = `${ext}_${Date.now()}.${ext}`
  } 
  else {
    throw new Error("Input harus path atau buffer")
  }

  const base64 = buffer.toString("base64")
  const filePath = `uploads/KyzoCDN_${Date.now()}_${filename}`
  const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${filePath}`

  const token = getRandomToken()

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Upload via bot",
      content: base64,
      branch: BRANCH
    })
  })

  const json = await res.json()
  if (!json.content) throw json

  return `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${BRANCH}/${filePath}`
}

async function CatBox(filePath) {
  const form = new FormData()
  form.append("reqtype", "fileupload")
  form.append("fileToUpload", fs.createReadStream(filePath))

  const res = await axios.post("https://catbox.moe/user/api.php", form, {
    headers: form.getHeaders()
  })

  return res.data
}

async function TelegraPh(Path) {
  if (!fs.existsSync(Path)) throw new Error("File not Found")

  const form = new BodyForm()
  form.append("file", fs.createReadStream(Path))

  const data = await axios.post("https://telegra.ph/upload", form, {
    headers: form.getHeaders()
  })

  return "https://telegra.ph" + data.data[0].src
}

async function UploadFileUgu(input) {
  const form = new BodyForm()
  form.append("files[]", fs.createReadStream(input))

  const res = await axios.post("https://uguu.se/upload.php", form, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      ...form.getHeaders()
    }
  })

  return res.data.files[0]
}

async function webp2mp4File(filePath) {
  const form = new BodyForm()
  form.append('new-image-url', '')
  form.append('new-image', fs.createReadStream(filePath))

  const res = await axios.post('https://s6.ezgif.com/webp-to-mp4', form, {
    headers: form.getHeaders()
  })

  const $ = cheerio.load(res.data)
  const file = $('input[name="file"]').attr('value')

  const form2 = new BodyForm()
  form2.append('file', file)
  form2.append('convert', "Convert WebP to MP4!")

  const res2 = await axios.post('https://ezgif.com/webp-to-mp4/' + file, form2, {
    headers: form2.getHeaders()
  })

  const $$ = cheerio.load(res2.data)
  const result = 'https:' + $$('div#output > p.outfile > video > source').attr('src')

  return {
    status: true,
    result
  }
}

async function floNime(media, options = {}) {
  const { ext } = await fromBuffer(media) || options.ext
  const form = new BodyForm()
  form.append('file', media, 'tmp.' + ext)

  const res = await fetch('https://flonime.my.id/upload', {
    method: 'POST',
    body: form
  })

  return res.json()
}

async function uptotelegra(Path) {
  return TelegraPh(Path)
}

async function uploadToGoFile(filePath) {
  const form = new BodyForm()
  form.append("file", fs.createReadStream(filePath))

  const res = await axios.post("https://api.gofile.io/uploadFile", form, {
    headers: form.getHeaders()
  })

  return res.data
}

module.exports = {
  CatBox,
  TelegraPh,
  UploadFileUgu,
  webp2mp4File,
  floNime,
  uptotelegra,
  uploadToGoFile,
  UpGithuB
}

const currentFile = __filename
fs.watchFile(currentFile, () => {
  fs.unwatchFile(currentFile)
  console.log(chalk.green(`✓ ${path.basename(currentFile)} updated! Reloading...`))
  delete require.cache[require.resolve(currentFile)]
})