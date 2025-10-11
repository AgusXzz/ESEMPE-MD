# ESEMPE-MD

![ESEMPE-MD Banner](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaK3_60MiEWpItg8BbrvcF4Be_vgIDd8Ggj13AYkPqGdUosLSmCMCtGSY&s=10)

ESEMPE-MD adalah bot WhatsApp Multi-Device yang sederhana dan ringan.

---

## Ringkasan singkat
- Bahasa: JavaScript / Node.js
- Fokus: stabilitas dan kemudahan penggunaan

---

## Persyaratan
- Node.js v20+
- npm atau yarn
- Koneksi internet untuk autentikasi

---

## Instalasi & Menjalankan
1. Clone repository
   ```bash
   git clone https://github.com/AgusXzz/ESEMPE-MD
   cd ESEMPE-MD
   ```

2. Install dependensi
   ```bash
   npm install
   # atau
   yarn
   ```

3. Jalankan bot
   ```bash
   npm start
   ```

4. Masukkan Code Pairing
   - Pada jalankan pertama, Pairing Code akan muncul di terminal. Masukkan di WhatsApp untuk autentikasi.

---

## Plugin

1. Struktur Plugin
   ```javascript
   export default {
     name: "name",                           // Nama plugin (wajib)
     category: "category",                   // Kategori plugin (wajib)
     command: ["command1", "command2", ...], // Commands plugin (wajib)
     alias: ["cmd1", "cmd2", ...],           // Alias atau singkatan dari commands (opsional)
     // Konfigurasi plugin (opsional)
     settings: {
       owner: true,      // Fitur khusus Owner
       private: false,   // Fitur khusus Private Chat
       group: true,      // Fitur khusus Group
       admin: false,     // Fitur khusus Admin Group
       botAdmin: true,   // Bot harus menjadi Admin
       loading: false    // Kirim pesan loading sebelum menjalankan kode
     },

     // Dipanggil ketika pesan match dengan command/alias (wajib)
     run: async (
       conn,         // Instance WASocket
       m,            // Object message
       {
         Api,        // Wrapper untuk fungsi terkait API. Lihat file lib/api.js
         Func,       // Kumpulan fungsi utility. Lihat file lib/function.js
         downloadM,  // Download media dari pesan
         quoted,     // Object pesan yang direply
         metadata,   // Metadata Group
         isOwner,    // Apakah sender adalah Owner
         isAdmin,    // Apakah sender adalah Admin Group
         isBotAdmin  // Apakah bot adalah Admin Group
       }
     ) => {
       // Kodemu di sini
     },

     // Dipanggil setiap ada pesan masuk (opsional)
     // Parameternya persis dengan fungsi run
     on: async (
       conn,
       m,
       { Api, Func, downloadM, quoted, metadata, isOwner, isAdmin, isBotAdmin }
     ) => {
       // Kodemu di sini
     }
   };
   ```

2. Autocomplete (JSDoc)

   Tambahkan baris JSDoc berikut tepat di atas `export default` file plugin:
   ```javascript
   /** @type {import('#lib/types.js').Plugin} */
   ```

---

## Struktur direktori (contoh)
```
ESEMPE-MD/
├── lib
│ ├── api.js
│ ├── color.js
│ ├── exif.js
│ ├── function.js
│ ├── loadPlugins.js
│ └── serialize.js
├── plugins
│ ├── downloader
│ ├── tools
│ └── utility
├── config.js
├── handler.js
├── index.js
├── package.json
```

---

## Kontribusi
Kontribusi kecil diterima (bugfix, perbaikan dokumentasi, penambahan perintah minimal). Langkah:
1. Fork repository
2. Buat branch: git checkout -b feat/nama-fitur
3. Commit & push
4. Buka Pull Request

Untuk perubahan fitur besar, buka issue dulu supaya dibahas.

---

## Kontak
Owner / Maintainer: AgusXzz  
Repo: https://github.com/AgusXzz/ESEMPE-MD

## Thanks To
[![Dika Ardnt](https://github.com/DikaArdnt.png?size=100)](https://github.com/DikaArdnt)
[![WhiskeySockets](https://github.com/WhiskeySockets.png?size=100)](https://github.com/WhiskeySockets/Baileys)

## Contributor
[![Agus](https://github.com/AgusXzz.png?size=100)](https://github.com/AgusXzz)
[![Senn](https://github.com/purrbits.png?size=100)](https://github.com/purrbits)
[![Vcepirit😂](https://github.com/vryptt.png?size=100)](https://github.com/vryptt)

---
Terima kasih sudah menggunakan ESEMPE-MD!
# CROTED BY EY AY
