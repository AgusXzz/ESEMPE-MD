import('./config.js')

import makeWASocket, {
    Browsers,
    DisconnectReason,
    delay,
    downloadMediaMessage,
    jidNormalizedUser,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore
} from 'baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import fs from 'fs';

import color from './lib/color.js';

async function startWA() {
    const { state, saveCreds } = await useMultiFileAuthState('sessions');

    const conn = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino().child({ level: 'silent', stream: 'store' }))
        },
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu('Chrome'),
        markOnlineOnConnect: false,
        generateHighQualityLinkPreview: true,
    });
    conn.ev.on('creds.update', saveCreds);

    if (!conn.chats) conn.chats = {}

    if (!conn.authState.creds.registered) {
        setTimeout(async () => {
            try {
                const code = await conn.requestPairingCode(PAIRING_NUMBER);
                console.log(color.green(`Kode Pairing: ${code?.match(/.{1,4}/g)?.join('-')}`))
            } catch (err) {
                console.log(color.red('[+] Gagal mengambil pairing code:'), err)
            }
        }, 3000);
    }

    conn.downloadMedia = async (msg) => {
        return await downloadMediaMessage(msg, 'buffer', {}, {
            logger: pino({ timestamp: () => `,"time":"${new Date().toJSON()}"`, level: 'fatal' }),
            reuploadRequest: conn.updateMediaMessage,
        });
    };

    conn.getJid = async (sender, groupId) => {
        if (!sender.endsWith("@lid") || !groupId.endsWith("@g.us")) return sender;

        conn.isLid = conn.isLid || {};
        if (conn.isLid[sender]) return conn.isLid[sender];

        const metadata = (conn.chats[groupId] || {}).metadata || await conn.groupMetadata(groupId).catch(() => null);
        const participant = metadata?.participants?.find(p => p.id === sender);

        return conn.isLid[sender] = participant?.jid;
    };

    conn.insertAllGroup = async () => {
        const groups = await conn.groupFetchAllParticipating().catch(_ => null) || {}
        for (const group in groups) conn.chats[group] = { ...(conn.chats[group] || {}), id: group, subject: groups[group].subject, isChats: true, metadata: groups[group] }
        return conn.chats
    };

    conn.parseMention = (text = "") => {
      return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(
        (v) => v[1] + "@s.whatsapp.net",
      );
    };

    conn.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
        if (connection) console.log(color.yellow(`[+] Connection Status : ${connection}`))
        if (connection === 'close') {
            const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
            switch (statusCode) {
                case 408:
                    console.log(color.red('[+] Connection timed out. restarting...'))
                    await startWA()
                    break
                case 503:
                    console.log(color.red('[+] Unavailable service. restarting...'))
                    await startWA()
                    break
                case 428:
                    console.log(color.cyan('[+] Connection closed, restarting...'))
                    await startWA()
                    break
                case 515:
                    console.log(color.cyan('[+] Need to restart, restarting...'))
                    await startWA()
                    break
                case 401:
                    console.log(color.cyan('[+] Session Logged Out.. Recreate session...'))
                    fs.rmSync('./sessions', { recursive: true, force: true })
                    await startWA()
                    break
                case 403:
                    console.log(color.red(`[+] Your WhatsApp Has Been Baned :D`))
                    fs.rmSync('./sessions', { recursive: true, force: true })
                    await startWA()
                    break

                case 405:
                    console.log(color.cyan('[+] Session Not Logged In.. Recreate session...'))
                    fs.rmSync('./sessions', { recursive: true, force: true })
                    await startWA()
                    break
                default:
                    console.log("Unhandled connection issue.", statusCode);
                    return process.exit(1);
            }
        }

        if (connection === 'open') {
            console.log(color.green('[+] Bot Connected.'))
            conn.insertAllGroup();
        }
    });

    conn.ev.on('messages.upsert', async ({ messages }) => {
        if (!messages[0]) return;

        let m = await (await import(`./lib/serialize.js?v=${Date.now()}`)).default(conn, messages[0]);

        if(m.chat.endsWith('@broadcast') || m.chat.endsWith('@newsletter')) return
        if (m.message && !m.isBot) {
            let name = m.isGroup ? m.metadata?.subject || 'Unknown' : m.pushname
            console.log(color.cyan(' - FROM'), color.cyan(name), color.blueBright(m.chat));
            console.log(color.yellowBright(' - CHAT'), color.yellowBright(m.isGroup ? `Grup (${m.sender} : ${name})` : 'Pribadi'));
            console.log(color.greenBright(' - PESAN'), color.greenBright(m.body || m.type));
            console.log(color.magentaBright('-'.repeat(40)))
        }

        await (await import(`./case.js?v=${Date.now()}`)).default(conn, m);
    });

    conn.ev.on('group-participants.update', async ({ id, participants, action }) => {
        if (!id) return
        id = jidNormalizedUser(id)
        if (id === 'status@broadcast') return
        if (!(id in conn.chats)) conn.chats[id] = { id }
        let chats = conn.chats[id]
        chats.isChats = true
        const groupMetadata = await conn.groupMetadata(id).catch(_ => null)
        if (!groupMetadata) return
        chats.subject = groupMetadata.subject
        chats.metadata = groupMetadata
    });

    conn.ev.on('groups.update', async (groupsUpdates) => {
        try {
            for (const update of groupsUpdates) {
                const id = jidNormalizedUser(update.id)
                if (!id || id === 'status@broadcast') continue
                const isGroup = id.endsWith('@g.us')
                if (!isGroup) continue
                let chats = conn.chats[id]
                if (!chats) chats = conn.chats[id] = { id }
                chats.isChats = true
                const metadata = await conn.groupMetadata(id).catch(_ => null)
                if (metadata) chats.metadata = metadata
                if (update.subject || metadata?.subject) chats.subject = update.subject || metadata.subject
            }
        } catch (e) {
            console.error(e)
        }
    });

}

startWA();
process.on('uncaughtException', console.error);