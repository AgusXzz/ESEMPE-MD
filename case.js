import axios from 'axios';

import util from 'util';
import cp from 'child_process';

export default async function Command(conn, m) {
    let quoted = m.isQuoted ? m.quoted : m;
    let downloadM = async (filename) => await conn.downloadMedia(quoted, filename);
    let isCommand = m.prefix && m.body.startsWith(m.prefix) || false

    const isOwner = m.fromMe || ownerNumber.includes(m.sender.split('@')[0])
    const wait = (jid, keys) => {
        conn.sendMessage(jid, { react: { text: "⌛", key: keys } });
    }

    if (!mode && !isOwner) return;

    switch (isCommand ? m.command?.toLowerCase() : false) {
        case 'menu': {
        //
        }
        break;
        case 'ping': {
            const start = performance.now();
            m.reply(`Kecepatan respon: ${(performance.now() - start).toFixed(2)} ms`);
        }
        break;
        case 'ai': {
          wait(m.chat, m.key)
          const res = await (await fetch(`https://api.nekolabs.my.id/ai/claude/sonnet-4?text=${m.text}`)).json()
          if (!res.status) return m.reply("servernya burik")
          m.reply(res.result)
        }
        break;
        case 'rvo': {
            if (!m.quoted?.msg?.viewOnce) return m.reply("Reply Pesan Sekali Lihat");
            m.quoted.msg.viewOnce = false;
            conn.sendMessage(m.chat, { forward: m.quoted, force: true });
        }
        break;
        default:
    }

    if ([">", "=>"].some(a => m.body.toLowerCase().startsWith(a)) && isOwner) {
        let evalCmd = ""
        try {
            evalCmd = /await/i.test(m.text) ? eval("(async() => { " + m.text + " })()") : eval(m.text)
        } catch (e) {
            evalCmd = e
        }
        new Promise(async (resolve, reject) => {
                try {
                    resolve(evalCmd)
                } catch (err) {
                    reject(err)
                }
            })
            ?.then((res) => m.reply(util.format(res)))
            ?.catch((err) => m.reply(util.format(err)))
    }

    if (m.body.startsWith('$') && isOwner) {
        const exec = util.promisify(cp.exec).bind(cp)
        let o
        try {
            o = await exec(m.text)
        } catch (e) {
            o = e
        } finally {
            let { stdout, stderr } = o
            if (stdout.trim()) m.reply(stdout)
            if (stderr.trim()) m.reply(stderr)
        }
    }
}
