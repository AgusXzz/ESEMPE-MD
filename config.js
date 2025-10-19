import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath } from 'url'
import log from "#lib/logger.js"

// Nomor pairing (untuk scan QR/Pairing code)
global.PAIRING_NUMBER = 6282388380889

// Nomor owner utama + cadangan
global.ownerNumber = [
  '6282220335764',
  '6282220335764'
]

// Mode bot: 
// false  = self mode (hanya owner)
// true = public (semua user)
global.pubelik = true

// Pesan default untuk respon bot
global.mess = {
  wait: 'Harap tunggu sebentar...',
  owner: 'Fitur ini hanya bisa digunakan oleh Owner.',
  group: 'Fitur ini hanya bisa digunakan dalam Group.',
  admin: 'Fitur ini hanya bisa digunakan oleh Admin Group.',
  botAdmin: 'Bot harus menjadi Admin terlebih dahulu.',
  private: 'Fitur ini hanya bisa digunakan di chat pribadi.'
}

// Default watermark untuk stiker
global.stickpack = 'Created By'
global.stickauth = 'ESEMPE-MD'

global.title = "ESEMPE-MD"
global.body = "Apcb"
global.thumbnailUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaK3_60MiEWpItg8BbrvcF4Be_vgIDd8Ggj13AYkPqGdUosLSmCMCtGSY&s=10"

// Hot reload config.js ketika ada perubahan
const file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  log.info("berhasil relooad file config.")
  import(`${file}?update=${Date.now()}`)
})
