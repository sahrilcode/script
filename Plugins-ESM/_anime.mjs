import axios from "axios"

const handler = async (m, { sock, command }) => {
  try {
    const cmd = command.toLowerCase()

    const map = {
      akiyama: "akiyama",
      ana: "ana",
      art: "art",
      asuna: "asuna",
      ayuzawa: "ayuzawa",
      boruto: "boruto",
      bts: "bts",
      cartoon: "kartun",
      chiho: "chiho",
      chitoge: "chitoge",
      cosplay: "cosplay",
      cosplayloli: "cosplayloli",
      cosplaysagiri: "cosplaysagiri",
      cyber: "cyber",
      deidara: "deidara",
      doraemon: "doraemon",
      elaina: "elaina",
      emilia: "emilia",
      erza: "erza",
      exo: "exo",
      gamewallpaper: "gamewallpaper",
      gremory: "gremory",
      hacker: "hekel",
      hestia: "hestia",
      hinata: "hinata",
      husbu: "husbu",
      inori: "inori",
      islamic: "islamic",
      isuzu: "isuzu",
      itachi: "itachi",
      itori: "itori",
      jennie: "jeni",
      jiso: "jiso",
      justina: "justina",
      kaga: "kaga",
      kagura: "kagura",
      kakasih: "kakasih",
      kaori: "kaori",
      keneki: "keneki",
      kotori: "kotori",
      kurumi: "kurumi",
      lisa: "lisa",
      madara: "madara",
      megumin: "megumin",
      mikasa: "mikasa",
      mikey: "mikey",
      miku: "miku",
      minato: "minato",
      mountain: "mountain",
      naruto: "naruto",
      neko2: "neko2",
      nekonime: "nekonime",
      nezuko: "nezuko",
      onepiece: "onepiece",
      pentol: "pentol",
      pokemon: "pokemon",
      programming: "programming",
      randomnime: "randomnime",
      randomnime2: "randomnime2",
      rize: "rize",
      rose: "rose",
      sagiri: "sagiri",
      sakura: "sakura",
      sasuke: "sasuke",
      satanic: "satanic",
      shina: "shina",
      shinka: "shinka",
      shinomiya: "shinomiya",
      shizuka: "shizuka",
      shota: "shota",
      shortquote: "katakata",
      space: "tatasurya",
      technology: "technology",
      tejina: "tejina",
      toukachan: "toukachan",
      tsunade: "tsunade",
      yotsuba: "yotsuba",
      yuki: "yuki",
      yulibocil: "yulibocil",
      yumeko: "yumeko"
    }

    const file = map[cmd]
    if (!file) return

    await m.reply("Loading 🔁")

    const url = `https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/${file}.json`
    const { data } = await axios.get(url)

    if (!Array.isArray(data) || !data.length) {
      return m.reply("Image tidak ditemukan.")
    }

    const random = data[Math.floor(Math.random() * data.length)]

    await sock.sendMessage(
      m.chat,
      {
        image: { url: random },
        viewOnce: false,
        annotations: [
          {
            polygonVertices: [
              { x: 0, y: 0 },
              { x: 1000, y: 0 },
              { x: 1000, y: 1000 },
              { x: 0, y: 1000 }
            ],
            shouldSkipConfirmation: true,
            embeddedContent: {
              embeddedMusic: {
                musicContentMediaId: "1409620227516822",
                songId: "244215252974958",
                author: "SahrilX7",
                title: "Posaedon - Asisstant",
                artistAttribution: "https://whatsapp.com/channel/0029Vb6ogsdAzNbyNcFpYf2g",
                countryBlocklist: "",
                isExplicit: false,
                artworkMediaKey: ""
              }
            },
            embeddedAction: true
          }
        ]
      },
      { quoted: m }
    )

  } catch (err) {
    m.reply("Terjadi kesalahan: " + err.message)
  }
}

handler.command = [
  "akiyama","ana","art","asuna","ayuzawa","boruto","bts","cartoon",
  "chiho","chitoge","cosplay","cosplayloli","cosplaysagiri","cyber",
  "deidara","doraemon","elaina","emilia","erza","exo","gamewallpaper",
  "gremory","hacker","hestia","hinata","husbu","inori","islamic",
  "isuzu","itachi","itori","jennie","jiso","justina","kaga","kagura",
  "kakasih","kaori","keneki","kotori","kurumi","lisa","madara",
  "megumin","mikasa","mikey","miku","minato","mountain","naruto",
  "neko2","nekonime","nezuko","onepiece","pentol","pokemon",
  "programming","randomnime","randomnime2","rize","rose","sagiri",
  "sakura","sasuke","satanic","shina","shinka","shinomiya",
  "shizuka","shota","shortquote","space","technology","tejina",
  "toukachan","tsunade","yotsuba","yuki","yulibocil","yumeko"
]

handler.tags = ["random"]
handler.help = handler.command
handler.limit = true

export default handler