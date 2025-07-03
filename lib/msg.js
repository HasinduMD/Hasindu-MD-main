const { proto, downloadContentFromMessage, getContentType } = require('@whiskeysockets/baileys')
const fs = require('fs')

// Download any type of media
const downloadMediaMessage = async (m, filename) => {
    if (m.type === 'viewOnceMessage') {
        m.type = m.msg.type
    }
    const getStream = async (msg, type, name) => {
        const stream = await downloadContentFromMessage(msg, type)
        let buffer = Buffer.from([])
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
        fs.writeFileSync(name, buffer)
        return fs.readFileSync(name)
    }
    if (m.type === 'imageMessage') {
        return getStream(m.msg, 'image', filename ? filename + '.jpg' : 'undefined.jpg')
    } else if (m.type === 'videoMessage') {
        return getStream(m.msg, 'video', filename ? filename + '.mp4' : 'undefined.mp4')
    } else if (m.type === 'audioMessage') {
        return getStream(m.msg, 'audio', filename ? filename + '.mp3' : 'undefined.mp3')
    } else if (m.type === 'stickerMessage') {
        return getStream(m.msg, 'sticker', filename ? filename + '.webp' : 'undefined.webp')
    } else if (m.type === 'documentMessage') {
        const ext = m.msg.fileName.split('.')[1].toLowerCase().replace('jpeg', 'jpg').replace('png', 'jpg').replace('m4a', 'mp3')
        return getStream(m.msg, 'document', filename ? filename + '.' + ext : 'undefined.' + ext)
    }
}

// Message wrapper
const sms = (conn, m, store) => {
    if (!m) return m
    let M = proto.WebMessageInfo
    if (m.key) {
        m.id = m.key.id
        m.isBot = m.id.startsWith('BAES') && m.id.length === 16
        m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16
        m.chat = m.key.remoteJid
        m.fromMe = m.key.fromMe
        m.isGroup = m.chat.endsWith('@g.us')
        m.sender = m.fromMe ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : m.isGroup ? m.key.participant : m.key.remoteJid
    }

    if (m.message) {
        m.mtype = getContentType(m.message)
        m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype])
        try {
            m.body = (m.mtype === 'conversation') ? m.message.conversation :
                (m.mtype == 'imageMessage') ? m.message.imageMessage.caption :
                    (m.mtype == 'videoMessage') ? m.message.videoMessage.caption :
                        (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text :
                            (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId :
                                (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                                    (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId :
                                        (m.mtype === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : ''
        } catch { m.body = false }

        let quoted = (m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null)
        m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []

        if (m.quoted) {
            let type = getContentType(quoted)
            m.quoted = m.quoted[type]
            if (['productMessage'].includes(type)) {
                type = getContentType(m.quoted)
                m.quoted = m.quoted[type]
            }
            if (typeof m.quoted === 'string') m.quoted = { text: m.quoted }

            if (quoted.viewOnceMessageV2) {
                console.log("entered ==================================== ")
            } else {
                m.quoted.mtype = type
                m.quoted.id = m.msg.contextInfo.stanzaId
                m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat
                m.quoted.isBot = m.quoted.id ? m.quoted.id.startsWith('BAES') && m.quoted.id.length === 16 : false
                m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false
                m.quoted.sender = conn.decodeJid(m.msg.contextInfo.participant)
                m.quoted.fromMe = m.quoted.sender === (conn.user && conn.user.id)
                m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || ''
                m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
                m.getQuotedObj = m.getQuotedMessage = async () => {
                    if (!m.quoted.id) return false
                    let q = await store.loadMessage(m.chat, m.quoted.id, conn)
                    return exports.sms(conn, q, store)
                }
                const key = {
                    remoteJid: m.chat,
                    fromMe: false,
                    id: m.quoted.id,
                    participant: m.quoted.sender
                }
                m.quoted.delete = async () => await conn.sendMessage(m.chat, { delete: key })
                m.forwardMessage = (jid, forceForward = true, options = {}) => conn.copyNForward(jid, M.fromObject({
                    key,
                    message: quoted,
                    ...(m.isGroup ? { participant: m.quoted.sender } : {})
                }), forceForward, { contextInfo: { isForwarded: false } }, options)
                m.quoted.download = () => conn.downloadMediaMessage(m.quoted)
            }
        }
    }

    if (m.msg.url) m.download = () => conn.downloadMediaMessage(m.msg)
    m.text = m.msg.text || m.msg.caption || m.message.conversation || m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || ''

    m.copy = () => exports.sms(conn, M.fromObject(M.toObject(m)))
    m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => conn.copyNForward(jid, m, forceForward, options)

    m.sticker = (stik, id = m.chat, option = { mentions: [m.sender] }) => conn.sendMessage(id, { sticker: stik, contextInfo: { mentionedJid: option.mentions } }, { quoted: m })

    m.replyimg = (img, teks, id = m.chat, option = { mentions: [m.sender] }) => conn.sendMessage(id, { image: img, caption: teks, contextInfo: { mentionedJid: option.mentions } }, { quoted: m })

    m.imgurl = (img, teks, id = m.chat, option = { mentions: [m.sender] }) => conn.sendMessage(id, { image: { url: img }, caption: teks, contextInfo: { mentionedJid: option.mentions } }, { quoted: m })

    m.reply = async (content, opt = {}, type = "text") => {
        switch (type.toLowerCase()) {
            case "text":
                return await conn.sendMessage(m.chat, { text: content }, { quoted: m })
            case "image":
                return Buffer.isBuffer(content) ?
                    await conn.sendMessage(m.chat, { image: content, ...opt }, { quoted: m }) :
                    isUrl(content) ? conn.sendMessage(m.chat, { image: { url: content }, ...opt }, { quoted: m }) : null
            case "video":
                return Buffer.isBuffer(content) ?
                    await conn.sendMessage(m.chat, { video: content, ...opt }, { quoted: m }) :
                    isUrl(content) ? await conn.sendMessage(m.chat, { video: { url: content }, ...opt }, { quoted: m }) : null
            case "audio":
                return Buffer.isBuffer(content) ?
                    await conn.sendMessage(m.chat, { audio: content, ...opt }, { quoted: m }) :
                    isUrl(content) ? await conn.sendMessage(m.chat, { audio: { url: content }, ...opt }, { quoted: m }) : null
            case "template":
                let optional = await generateWAMessage(m.chat, content, opt)
                let message = { viewOnceMessage: { message: { ...optional.message } } }
                await conn.relayMessage(m.chat, message, { messageId: optional.key.id })
                break
            case "sticker":
                let { data, mime } = await conn.getFile(content)
                if (mime === "image/webp") {
                    let buff = await writeExifWebp(data, opt)
                    await conn.sendMessage(m.chat, { sticker: { url: buff }, ...opt }, { quoted: m })
                } else {
                    mime = mime.split("/")[0]
                    await conn.sendImageAsSticker(m.chat, content, opt)
                }
                break
        }
    }

    // Send document
    m.senddoc = (doc, type, id = m.chat, option = {
        mentions: [m.sender], filename: Config.ownername, mimetype: type,
        externalAdRepl: {
            title: Config.ownername,
            body: ' ',
            thumbnailUrl: ``,
            thumbnail: log0,
            mediaType: 1,
            mediaUrl: '',
            sourceUrl: gurl,
        }
    }) => conn.sendMessage(id, {
        document: doc,
        mimetype: option.mimetype,
        fileName: option.filename,
        contextInfo: {
            externalAdReply: option.externalAdRepl,
            mentionedJid: option.mentions
        }
    }, { quoted: m })

    // Send contact
    m.sendcontact = (name, info, number) => {
        let vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nORG:${info};\nTEL;type=CELL;type=VOICE;waid=${number}:+${number}\nEND:VCARD`
        conn.sendMessage(m.chat, {
            contacts: { displayName: name, contacts: [{ vcard }] }
        }, { quoted: m })
    }

    // Send emoji reaction
    m.react = (emoji) => conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } })

    // ✅ Send Button Message
    m.sendButton = async (text, footer, buttons = [], headerType = 1, quoted = m) => {
        return conn.sendMessage(m.chat, {
            text,
            footer,
            buttons,
            headerType
        }, { quoted })
    }

    return m
}

module.exports = { sms, downloadMediaMessage }
