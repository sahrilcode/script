import genshindb from 'genshin-db'

const NA = 'Data tidak tersedia'

const listFallback = async (fn, label, m) => {
  try {
    const available = await fn('names', { matchCategories: true })
    m.reply(`*Tidak Ditemukan*\n\n*${label} yang tersedia:* ${available.join(', ')}`)
  } catch {
    m.reply('Terjadi Kesalahan...')
  }
}

let handler = async (m, { text, command, prefix, reply }) => {
  const cmd = prefix + command

  switch (command) {

    case 'genshin-wildlife':
    case 'g-wildlife':
    case 'gens-wildlife': {
      if (!text) return m.reply(`Contoh: *${cmd} snowboar*\nHarap berikan nama binatang liar.`)
      try {
        const result = genshindb.wildlife(text)
        if (!result) return m.reply('Binatang liar tidak ditemukan.')
        m.reply(
          `*Binatang Liar Ditemukan: ${result.name}*\n\n` +
          `_${result.description || NA}_\n\n` +
          `*Rarity:* ${result.rarity || NA}\n` +
          `*Habitat:* ${result.habitat || NA}`
        )
      } catch {
        m.reply('Terjadi Kesalahan...')
        await listFallback(genshindb.wildlife, 'Binatang liar', m)
      }
      break
    }

    case 'genshin-weapons':
    case 'g-weapons':
    case 'gens-weapons': {
      if (!text) return m.reply(`Contoh: *${cmd} claymore*\nHarap berikan nama senjata.`)
      try {
        const result = genshindb.weapons(text)
        if (!result) return m.reply('Senjata tidak ditemukan.')
        m.reply(
          `*Senjata Ditemukan: ${result.name}*\n\n` +
          `_${result.description || NA}_\n\n` +
          `*Rarity:* ${result.rarity || NA}\n` +
          `*Type:* ${result.weapontype || NA}\n` +
          `*Base ATK:* ${result.baseatk || NA}\n` +
          `*Substat:* ${result.substat || NA}\n` +
          `*Passive Name:* ${result.passivename || NA}\n` +
          `*Passive Description:* ${result.passivedesciption || NA}`
        )
      } catch {
        m.reply('Terjadi Kesalahan...')
        await listFallback(genshindb.weapons, 'Senjata', m)
      }
      break
    }

    case 'genshin-voiceovers':
    case 'g-voiceovers':
    case 'gens-voiceovers': {
      if (!text) return m.reply(`Contoh: *${cmd} venti*\nHarap berikan nama voiceover.`)
      try {
        const result = genshindb.voiceovers(text)
        if (!result) return m.reply('Voiceover tidak ditemukan.')
        m.reply(
          `*Voiceover Ditemukan: ${result.name}*\n\n` +
          `_${result.description || NA}_\n\n` +
          `*Rarity:* ${result.rarity || NA}`
        )
      } catch {
        m.reply('Terjadi Kesalahan...')
        await listFallback(genshindb.voiceovers, 'Voiceover', m)
      }
      break
    }

    case 'genshin-viewpoint':
    case 'g-viewpoint':
    case 'gens-viewpoint': {
      if (!text) return m.reply(`Contoh: *${cmd} starfell valley*\nHarap berikan nama pemandangan.`)
      try {
        const result = genshindb.viewpoints(text)
        if (!result) return m.reply('Pemandangan tidak ditemukan.')
        m.reply(
          `*Pemandangan Ditemukan: ${result.name}*\n\n` +
          `_${result.description || NA}_\n\n` +
          `*Region:* ${result.region || NA}\n` +
          `*Area:* ${result.area || NA}`
        )
      } catch {
        m.reply('Terjadi Kesalahan...')
        await listFallback(genshindb.viewpoints, 'Pemandangan', m)
      }
      break
    }

    case 'genshin-talents':
    case 'g-talents':
    case 'gens-talents': {
      if (!text) return m.reply(`Contoh: *${cmd} diluc*\nHarap berikan nama karakter untuk mencari bakatnya.`)
      try {
        const result = genshindb.talents(text)
        if (!result) return m.reply(`Bakat untuk karakter '${text}' tidak ditemukan.`)
        const combatTalents = result.combat1 ? [result.combat1, result.combat2, result.combat3].filter(Boolean) : []
        let response = `*Bakat ditemukan untuk: ${result.name}*\n\n`
        combatTalents.forEach((talent, i) => {
          response += `*${i + 1}. ${talent.name}*\n`
          response += `_${talent.info || NA}_\n\n`
        })
        m.reply(response.trim())
      } catch {
        m.reply('Terjadi Kesalahan...')
        m.reply(`*Tidak Ditemukan*\n\nBakat untuk karakter '${text}' tidak ditemukan.`)
      }
      break
    }

    case 'genshin-potion':
    case 'g-potion':
    case 'gens-potion': {
      if (!text) return m.reply(`Contoh: *${cmd} squirrel fish*\nHarap berikan nama ramuan atau makanan.`)
      try {
        const result = genshindb.foods(text)
        if (!result) return m.reply(`Ramuan atau makanan '${text}' tidak ditemukan.`)
        m.reply(
          `*Ramuan atau Makanan Ditemukan: ${result.name}*\n\n` +
          `_${result.description || NA}_\n\n` +
          `*Rarity:* ${result.rarity || NA}\n` +
          `*Efek:* ${result.effect || NA}`
        )
      } catch {
        m.reply('Terjadi Kesalahan...')
        await listFallback(genshindb.foods, 'Makanan', m)
      }
      break
    }

    case 'genshin-outfit':
    case 'g-outfit':
    case 'gens-outfit': {
      if (!text) return m.reply(`Contoh: *${cmd} outrider*\nHarap berikan nama kostum atau outfit.`)
      try {
        const result = genshindb.outfits(text)
        if (!result) return m.reply(`Kostum '${text}' tidak ditemukan.`)
        let response =
          `*Kostum Ditemukan: ${result.name}*\n\n` +
          `_${result.description || NA}_\n\n` +
          `*Karakter:* ${result.character || NA}`
        if (result.url?.modelviewer) response += `\n_${result.url.modelviewer}_`
        m.reply(response)
      } catch {
        m.reply('Terjadi Kesalahan...')
        await listFallback(genshindb.outfits, 'Outfit', m)
      }
      break
    }

    case 'genshin-nation':
    case 'g-nation':
    case 'gens-nation': {
      if (!text) return m.reply(`Contoh: *${cmd} mondstadt*\nHarap berikan nama wilayah atau nasionalitas.`)
      try {
        const result = genshindb.geographies(text)
        if (!result) return m.reply('Informasi wilayah tidak ditemukan.')
        m.reply(
          `*Informasi Wilayah Ditemukan: ${result.name}*\n\n` +
          `_${result.description || NA}_\n\n` +
          `*Area:* ${result.area || NA}\n` +
          `*Region:* ${result.region || NA}`
        )
      } catch {
        m.reply('Terjadi Kesalahan...')
        await listFallback(genshindb.geographies, 'Wilayah', m)
      }
      break
    }

    case 'genshin-namacard':
    case 'g-namacard':
    case 'gens-namacard': {
      if (!text) return m.reply(`Contoh: *${cmd} anemo flare*\nHarap berikan nama kartu nama.`)
      try {
        const result = genshindb.namecards(text)
        if (!result) return m.reply('Kartu nama tidak ditemukan.')
        m.reply(
          `*Kartu Nama Ditemukan: ${result.name}*\n\n` +
          `_${result.description || NA}_\n\n` +
          `*Rarity:* ${result.rarity || NA}\n` +
          `*Unlock:* ${result.unlock || NA}`
        )
      } catch {
        m.reply('Terjadi Kesalahan...')
        await listFallback(genshindb.namecards, 'Kartu nama', m)
      }
      break
    }

    case 'genshin-materials':
    case 'g-materials':
    case 'gens-materials': {
      if (!text) return m.reply(`Contoh: *${cmd} boreal wolf's milk*\nHarap berikan nama material.`)
      try {
        const result = genshindb.materials(text)
        if (!result) return m.reply('Material tidak ditemukan.')
        m.reply(
          `*Material Ditemukan: ${result.name}*\n\n` +
          `_${result.description || NA}_\n\n` +
          `*Rarity:* ${result.rarity || NA}\n` +
          `*Type:* ${result.materialtype || NA}`
        )
      } catch {
        m.reply('Terjadi Kesalahan...')
        await listFallback(genshindb.materials, 'Material', m)
      }
      break
    }

    case 'genshin-food':
    case 'g-food':
    case 'gens-food': {
      if (!text) return m.reply(`Contoh: *${cmd} temptation*\nHarap berikan nama makanan.`)
      try {
        const result = genshindb.foods(text)
        if (!result) return m.reply('Makanan tidak ditemukan.')
        let response =
          `*Makanan Ditemukan: ${result.name}*\n\n` +
          `_"${result.description}"_\n\n` +
          `*Rarity:* ${result.rarity}\n` +
          `*Type:* ${result.foodtype}\n` +
          `*Category:* ${result.foodfilter} (${result.foodcategory})\n\n`
        if (result.effect) response += `*Effect:*\n${result.effect}\n\n`
        if (result.suspicious) response += `*Suspicious:*\n${result.suspicious.effect}\n_"${result.suspicious.description}"_\n\n`
        if (result.normal) response += `*Normal:*\n${result.normal.effect}\n_"${result.normal.description}"_\n\n`
        if (result.delicious) response += `*Delicious:*\n${result.delicious.effect}\n_"${result.delicious.description}"_\n\n`
        m.reply(response.trim())
      } catch {
        m.reply('Terjadi Kesalahan...')
        await listFallback(genshindb.foods, 'Makanan', m)
      }
      break
    }

    case 'genshin-enemy':
    case 'g-enemy':
    case 'gens-enemy': {
      if (!text) return m.reply(`Contoh: *${cmd} ruin guard*\nHarap berikan nama musuh.`)
      try {
        const result = genshindb.enemies(text)
        if (!result) return m.reply('Musuh tidak ditemukan.')
        m.reply(
          `*Musuh Ditemukan: ${result.name}*\n\n` +
          `_${result.description || NA}_\n\n` +
          `*Rarity:* ${result.rarity || NA}\n` +
          `*Element:* ${result.elements?.join(', ') || NA}`
        )
      } catch {
        m.reply('Terjadi Kesalahan...')
        await listFallback(genshindb.enemies, 'Musuh', m)
      }
      break
    }

    case 'genshin-emoji':
    case 'g-emoji':
    case 'gens-emoji': {
      if (!text) return m.reply(`Contoh: *${cmd} anemo*\nHarap berikan nama emoji.`)
      try {
        const result = genshindb.emojis(text)
        if (!result) return m.reply('Emoji tidak ditemukan.')
        m.reply(
          `*Emoji Ditemukan: ${result.name}*\n\n` +
          `_${result.description || NA}_\n\n` +
          `*Rarity:* ${result.rarity || NA}`
        )
      } catch {
        m.reply('Terjadi Kesalahan...')
        await listFallback(genshindb.emojis, 'Emoji', m)
      }
      break
    }

    case 'genshin-domain':
    case 'g-domain':
    case 'gens-domain': {
      if (!text) return m.reply(`Contoh: *${cmd} valley of remembrance*\nHarap berikan nama domain.`)
      try {
        const result = genshindb.domains(text)
        if (!result) return m.reply('Domain tidak ditemukan.')
        m.reply(
          `*Domain Ditemukan: ${result.name}*\n\n` +
          `_${result.description || NA}_\n\n` +
          `*Area:* ${result.area || NA}\n` +
          `*Level:* ${result.recommendedlevel || NA}`
        )
      } catch {
        m.reply('Terjadi Kesalahan...')
        await listFallback(genshindb.domains, 'Domain', m)
      }
      break
    }

    case 'genshin-craft':
    case 'g-craft':
    case 'gens-craft': {
      if (!text) return m.reply(`Contoh: *${cmd} mystical enhancement ore*\nHarap berikan nama craft.`)
      try {
        const result = genshindb.crafts(text)
        if (!result) return m.reply('Craft tidak ditemukan.')
        m.reply(
          `*Craft Ditemukan: ${result.name}*\n\n` +
          `_${result.description || NA}_\n\n` +
          `*Type:* ${result.craftingtype || NA}\n` +
          `*Rarity:* ${result.rarity || NA}`
        )
      } catch {
        m.reply('Terjadi Kesalahan...')
        await listFallback(genshindb.crafts, 'Craft', m)
      }
      break
    }

    case 'genshin-const':
    case 'g-const':
    case 'gens-const':
    case 'genshin-constellation':
    case 'g-constellation':
    case 'gens-constellation': {
      if (!text) return m.reply(`Contoh: *${cmd} diluc*\nHarap berikan nama karakter untuk mencari konstelasinya.`)
      try {
        const result = genshindb.constellations(text)
        if (!result) return m.reply(`Konstelasi untuk karakter '${text}' tidak ditemukan.`)
        const levels = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'].map(k => result[k]).filter(Boolean)
        let response = `*Konstelasi ditemukan untuk: ${result.name}*\n\n`
        levels.forEach((c, i) => {
          response += `*C${i + 1}. ${c.name}*\n_${c.effect || NA}_`
          if (i < levels.length - 1) response += '\n\n'
        })
        m.reply(response)
      } catch {
        m.reply('Terjadi Kesalahan...')
        m.reply(`*Tidak Ditemukan*\n\nKonstelasi untuk karakter '${text}' tidak ditemukan.`)
      }
      break
    }

    case 'genshin-artifaact':
    case 'genshin-artifact':
    case 'g-artifact':
    case 'gens-artifact': {
      if (!text) return m.reply(`Contoh: *${cmd} berserker*\nHarap berikan nama artefak.`)
      try {
        const result = genshindb.artifacts(text)
        if (!result) return m.reply('Artefak tidak ditemukan.')
        m.reply(
          `*Artefak Ditemukan: ${result.name}*\n\n` +
          `_${result.description || NA}_\n\n` +
          `*Rarity:* ${result.rarity || NA}\n` +
          `*2pc Bonus:* ${result['2pc'] || NA}\n` +
          `*4pc Bonus:* ${result['4pc'] || NA}`
        )
      } catch {
        m.reply('Terjadi Kesalahan...')
        await listFallback(genshindb.artifacts, 'Artefak', m)
      }
      break
    }

    case 'genshin-area':
    case 'g-area':
    case 'gens-area': {
      if (!text) return m.reply(`Contoh: *${cmd} liyue*\nHarap berikan nama tempat.`)
      try {
        const result = genshindb.geographies(text)
        if (!result) return m.reply('Geografi tidak ditemukan.')
        m.reply(
          `*Info Geografi: ${result.name}*\n\n` +
          `_${result.description || NA}_\n\n` +
          `*Area:* ${result.area || NA}\n` +
          `*Region:* ${result.region || NA}\n` +
          `*Urutan Sortir:* ${result.sortorder || NA}`
        )
      } catch {
        m.reply('Terjadi Kesalahan...')
        await listFallback(genshindb.geographies, 'Geografi', m)
      }
      break
    }

    case 'genshin-animal':
    case 'g-animals':
    case 'gens-animals': {
      if (!text) return m.reply(`Contoh: *${cmd} shiba*\nHarap berikan nama hewan.`)
      try {
        const animal = genshindb.animals(text)
        if (!animal) return m.reply('Hewan tidak ditemukan.')
        m.reply(
          `*Hewan Ditemukan: ${animal.name}*\n\n` +
          `"${animal.description}"\n\n` +
          `*Kategori:* ${animal.category || NA}\n` +
          `*Jenis Hitungan:* ${animal.counttype || NA}`
        )
      } catch {
        m.reply('Terjadi Kesalahan...')
        await listFallback(genshindb.animals, 'Hewan', m)
      }
      break
    }

    case 'genshin-rankaddventure':
    case 'g-rankaddventure':
    case 'genshin-advrank':
    case 'g-advrank':
    case 'gens-rankaddventure':
    case 'gens-advrank': {
      if (!text || isNaN(parseInt(text))) return m.reply(`Masukkan nomor peringkat petualang yang valid. Contoh: *${cmd} 5*`)
      try {
        const rankNumber = parseInt(text)
        const result = genshindb.adventureranks(rankNumber)
        if (!result) return m.reply(`Rank petualang untuk Rank ${rankNumber} tidak ditemukan.`)
        m.reply(
          `*Rank Petualang Ditemukan untuk Rank ${rankNumber}:*\n\n` +
          `*Experience:* ${result.exp || NA}\n` +
          `*Reward:* ${result.reward || NA}\n` +
          `*Deskripsi:* ${result.description || NA}`
        )
      } catch {
        m.reply('Terjadi Kesalahan...')
        const availableRanks = genshindb.adventureranks('names')
        m.reply(`*Tidak Ditemukan*\n\n*Rank yang tersedia:* ${availableRanks.join(', ')}`)
      }
      break
    }

    case 'genshin-achievement':
    case 'g-achievement':
    case 'gens-achievement': {
      if (!text) return m.reply(`Contoh: *${cmd} mondstadt*\nHarap berikan nama prestasi.`)
      try {
        const result = genshindb.achievements(text)
        if (!result) return m.reply('Prestasi tidak ditemukan.')
        m.reply(
          `*${result.name}*\n` +
          `_${result.description || NA}_\n\n` +
          `*Kategori:* ${result.achievementgroup || NA}\n` +
          `*Reward:* ${result.reward || NA}\n` +
          `*Detail:* ${result.commissionreq || NA}`
        )
      } catch {
        m.reply('Terjadi Kesalahan...')
        await listFallback(genshindb.achievements, 'Prestasi', m)
      }
      break
    }

    case 'genshin-char':
    case 'g-char':
    case 'gens-char':
    case 'genshin-characters':
    case 'g-characters':
    case 'gens-characters': {
      if (!text) return m.reply(`Contoh: *${cmd} diluc*\nHarap berikan nama karakter.`)
      try {
        const result = genshindb.characters(text)
        if (!result) return m.reply('Karakter tidak ditemukan.')
        m.reply(
          `*Karakter Ditemukan: ${result.name}*\n\n` +
          `_${result.description || NA}_\n\n` +
          `*Rarity:* ${result.rarity || NA}\n` +
          `*Vision:* ${result.element || NA}\n` +
          `*Senjata:* ${result.weapontype || NA}\n` +
          `*Region:* ${result.region || NA}`
        )
      } catch {
        m.reply('Terjadi Kesalahan...')
        await listFallback(genshindb.characters, 'Karakter', m)
      }
      break
    }
  }
}

handler.command = [
  'genshin-wildlife', 'g-wildlife', 'gens-wildlife',
  'genshin-weapons', 'g-weapons', 'gens-weapons',
  'genshin-voiceovers', 'g-voiceovers', 'gens-voiceovers',
  'genshin-viewpoint', 'g-viewpoint', 'gens-viewpoint',
  'genshin-talents', 'g-talents', 'gens-talents',
  'genshin-potion', 'g-potion', 'gens-potion',
  'genshin-outfit', 'g-outfit', 'gens-outfit',
  'genshin-nation', 'g-nation', 'gens-nation',
  'genshin-namacard', 'g-namacard', 'gens-namacard',
  'genshin-materials', 'g-materials', 'gens-materials',
  'genshin-food', 'g-food', 'gens-food',
  'genshin-enemy', 'g-enemy', 'gens-enemy',
  'genshin-emoji', 'g-emoji', 'gens-emoji',
  'genshin-domain', 'g-domain', 'gens-domain',
  'genshin-craft', 'g-craft', 'gens-craft',
  'genshin-const', 'g-const', 'gens-const',
  'genshin-constellation', 'g-constellation', 'gens-constellation',
  'genshin-artifaact', 'genshin-artifact', 'g-artifact', 'gens-artifact',
  'genshin-area', 'g-area', 'gens-area',
  'genshin-animal', 'g-animals', 'gens-animals',
  'genshin-rankaddventure', 'g-rankaddventure',
  'genshin-advrank', 'g-advrank',
  'gens-rankaddventure', 'gens-advrank',
  'genshin-achievement', 'g-achievement', 'gens-achievement',
  'genshin-char', 'g-char', 'gens-char',
  'genshin-characters', 'g-characters', 'gens-characters'
]

export default handler