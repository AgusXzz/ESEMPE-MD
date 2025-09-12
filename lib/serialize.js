import {
  areJidsSameUser,
  extractMessageContent,
  jidNormalizedUser
} from 'baileys';

// https://github.com/DikaArdnt/readsw/blob/master/lib/serialize.js
// Copy Punya Dika Ardnt
export default async function serialize(conn, msg) {
  if (!msg) return;
  let m = {}
  m.message = parseMessage(msg.message);

  if (msg.key) {
    m.key = msg.key
    m.id = m.key.id;
    m.device = /^3A/.test(m.id) ? 'ios' : /^3E/.test(m.id) ? 'web' : /^.{21}/.test(m.id) ? 'android' : /^.{18}/.test(m.id) ? 'desktop' : 'unknown';
    m.isBot = (m.id.startsWith("BAE5") || m.id.startsWith("3EB0"))
    m.chat = jidNormalizedUser(m.key.remoteJid)
    m.isGroup = m.chat.endsWith('@g.us');
    m.sender = await conn.getJid(m.key.participantPn || m.key.participant || m.chat, m.chat);
    m.chatMe = m.key.fromMe || areJidsSameUser(m.sender, jidNormalizedUser(conn?.user?.id))
  }

  if (m.isGroup) {
      m.metadata = (conn.chats[m.chat] || {}).metadata || await conn.groupMetadata(m.chat).catch(_ => null)
      m.groupAdmins = m.isGroup && (m.metadata.participants.reduce((memberAdmin, memberNow) => (memberNow.admin ? memberAdmin.push({ jid: memberNow.jid, admin: memberNow.admin }) : [...memberAdmin]) && memberAdmin, []))
      m.isAdmin = m.isGroup && !!m.groupAdmins.find((member) => member.jid === m.sender)
      m.isBotAdmin = m.isGroup && !!m.groupAdmins.find((member) => member.jid === jidNormalizedUser(conn.user.id))
   }

  m.pushname = msg.pushName;

  if (m.message) {
    m.type = getContentType(m.message);
    m.msg = parseMessage(m.message[m.type]) || m.message[m.type]
    let mention = [...(m.msg?.contextInfo?.mentionedJid || []), ...(m.msg?.contextInfo?.groupMentions?.map(v => v.groupJid) || [])]
    m.mentions = await Promise.all(mention.map(jid => conn.getJid(jid, m.chat)))
    m.expiration = m.msg?.contextInfo?.expiration || 0;
    m.body = m.msg?.text || m.msg?.conversation || m.msg?.caption || m.message?.conversation || m.msg?.selectedButtonId || m.msg?.singleSelectReply?.selectedRowId || m.msg?.selectedId || m.msg?.contentText || m.msg?.selectedDisplayText || m.msg?.title || m.msg?.name || "";
    m.prefix = new RegExp(`^[°•π÷×¶∆£¢€¥®™+✓=|/~!?@#%^&.©^]`, "gi").test(m.body) ? m.body.match(new RegExp(`^[°•π÷×¶∆£¢€¥®™+✓=|/~!?@#%^&.©^]`, "gi"))[0] : ""
    m.command = m.body && m.body.trim().replace(m.prefix, '').trim().split(/ +/).shift()
    m.args = m.body.trim().split(/ +/).slice(1)
    m.text = m.args.join(" ");
    m.isMedia = !!m.msg?.mimetype || !!m.msg?.thumbnailDirectPath;
    m.isQuoted = false
    // Quoted message handler
    if (m.msg?.contextInfo?.quotedMessage) {
      m.isQuoted = true
      m.quoted = {}
      m.quoted.message = parseMessage(m.msg?.contextInfo?.quotedMessage)
      if (m.quoted.message) {
        m.quoted.type = getContentType(m.quoted.message) || Object.keys(m.quoted.message)[0];
        m.quoted.msg = parseMessage(m.quoted.message[m.quoted.type]) || m.quoted.message[m.quoted.type];
        m.quoted.isMedia = !!m.quoted.msg?.mimetype || !!m.quoted.msg?.thumbnailDirectPath;
        m.quoted.key = {
          remoteJid: m.msg?.contextInfo?.remoteJid || m.chat,
          participant: jidNormalizedUser(m.msg?.contextInfo?.participant),
          fromMe: areJidsSameUser(jidNormalizedUser(m.msg?.contextInfo?.participant), jidNormalizedUser(conn?.user?.id)),
          id: m.msg?.contextInfo?.stanzaId
        }
        m.quoted.id = m.msg?.contextInfo?.stanzaId
        m.quoted.device = /^3A/.test(m.quoted.id) ? 'ios' : /^3E/.test(m.quoted.id) ? 'web' : /^.{21}/.test(m.quoted.id) ? 'android' : /^.{18}/.test(m.quoted.id) ? 'desktop' : 'unknown'
        m.quoted.from = /g\.us|status/.test(m.msg?.contextInfo?.remoteJid) ? m.quoted.key.participant : m.quoted.key.remoteJid
        m.quoted.fromMe = m.quoted.key.fromMe
        m.quoted.sender = await conn.getJid(jidNormalizedUser(m.msg?.contextInfo?.participant || m.quoted.from), m.chat)
        let mention = [...(m.quoted.msg?.contextInfo?.mentionedJid || []), ...(m.quoted.msg?.contextInfo?.groupMentions?.map(v => v.groupJid) || [])]
        m.quoted.mentions = await Promise.all(mention.map(jid => conn.getJid(jid, m.chat)))
        m.quoted.body = m.quoted.msg?.text || m.quoted.msg?.caption || m.quoted?.message?.conversation || m.quoted.msg?.selectedButtonId || m.quoted.msg?.singleSelectReply?.selectedRowId || m.quoted.msg?.selectedId || m.quoted.msg?.contentText || m.quoted.msg?.selectedDisplayText || m.quoted.msg?.title || m.quoted?.msg?.name || ""
        m.quoted.args = m.quoted.body.trim().split(/ +/).slice(1)
        m.quoted.text = m.quoted.args.join(" ")
      }
    }
  }
  // Quick reply
  m.reply = async (text, options = {}) => {
    if (typeof text === "string") {
      await conn.sendMessage(
        m.chat,
        {
          text,
          contextInfo: {
             mentionedJid: [...conn.parseMention(text)],
         },
          ...options,
        },
        {
          quoted: m,
          ephemeralExpiration: m.expiration,
          ...options,
        },
      );
    } else if (typeof text === "object" && typeof text !== "string") {
      await conn.sendMessage(
        m.chat,
        {
          ...text,
          ...options,
        },
        {
          quoted: m,
          ephemeralExpiration: m.expiration,
          ...options,
        },
      );
    }
  };

  return m;
}

function parseMessage(content) {
   content = extractMessageContent(content)

   if (content && content.viewOnceMessageV2Extension) {
      content = content.viewOnceMessageV2Extension.message
   }
   if (content && content.protocolMessage && content.protocolMessage.type == 14) {
      let type = getContentType(content.protocolMessage)
      content = content.protocolMessage[type]
   }
   if (content && content.message) {
      let type = getContentType(content.message)
      content = content.message[type]
   }

   return content
}

const getContentType = (content) => {
   if (content) {
      const keys = Object.keys(content);
      const key = keys.find(k => (k === 'conversation' || k.endsWith('Message') || k.includes('V2') || k.includes('V3')) && k !== 'senderKeyDistributionMessage');
      return key
   }
}