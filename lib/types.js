/**
 * @typedef {import('baileys').WASocket} WASocket
 * @typedef {import('baileys').proto.IWebMessageInfo} IWebMessageInfo
 * @typedef {import('baileys').GroupMetadata} GroupMetadata
 */

/**
 * @typedef {Object} PluginContext
 * @property {Object} Api - Wrapper untuk fungsi terkait API. Lihat file lib/api.js
 * @property {Object} Func - Kumpulan fungsi utility. Lihat file lib/function.js
 * @property {(filename?: string) => Promise<string|Buffer>} downloadM - Download media dari pesan. Return file path (string) jika `filename` diberikan, return buffer jika tidak
 * @property {Object} quoted - Object pesan yang direply
 * @property {GroupMetadata} metadata - Metadata group (jika pesan dari group)
 * @property {boolean} isOwner - Apakah sender adalah owner
 * @property {boolean} isAdmin - Apakah sender adalah admin group
 * @property {boolean} isBotAdmin - Apakah bot adalah admin group
 */

/**
 * @callback PluginHandler
 * @param {WASocket} conn
 * @param {Object} m - Object pesan yang telah diserialize
 * @param {PluginContext} ctx
 * @returns {Promise<void>}
 */

/**
 * Struktur Plugin
 *
 * @typedef {Object} Plugin
 * @property {string} name - Nama plugin
 * @property {string} category - Kategori plugin (group, utility, sticker, dll)
 * @property {string[]} command - Commands pluginnya
 * @property {string[]} [alias] - Alias/singkatan dari commands (opsional)
 * @property {Object} [settings] - Pengaturan plugin (opsional)
 * @property {boolean} [settings.owner] - Fitur khusus owner (opsional)
 * @property {boolean} [settings.private] - Fitur khusus private chat (opsional)
 * @property {boolean} [settings.group] - Fitur khusus group (opsional)
 * @property {boolean} [settings.admin] - Fitur khusus admin group (opsional)
 * @property {boolean} [settings.botAdmin] - Bot harus admin (opsional)
 * @property {boolean} [settings.loading] - Kirim pesan loading sebelum menjalankan kode (opsional)
 * @property {PluginHandler} run - Fungsi yang dipanggil saat pesan cocok dengan command/alias
 * @property {PluginHandler} [on] - Fungsi yang dipanggil setiap ada pesan masuk (opsional)
 */

export {};
