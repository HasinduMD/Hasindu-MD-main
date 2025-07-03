const { cmd, commands } = require('../command')

cmd({
    pattern: "alive",
    react: "👋",
    desc: "check bot alive",
    category: "main",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, body, isCmd, command, args, q,
    isGroup, sender, senderNumber, botNumber2, botNumber,
    pushname, isMe, isOwner, groupMetadata, groupName,
    participants, groupAdmins, isBotAdmins, isAdmins, reply
}) => {
    try {
        const dateObj = new Date()
        const hours = dateObj.getHours()
        const date = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
        const time = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

        let greeting = "👋 Hello"
        if (hours >= 5 && hours < 12) greeting = "🌅 Good Morning"
        else if (hours >= 12 && hours < 17) greeting = "🌞 Good Afternoon"
        else if (hours >= 17 && hours < 20) greeting = "🌇 Good Evening"
        else greeting = "🌙 Good Night"

        let madeMenu = `*╭─❖ нαѕιη∂υ м∂ ᴀℓινє ❖─╮*

${greeting}, *${pushname}*!

📅 *Date:* ${date}
⏰ *Time:* ${time}

🤖 *нαѕιη∂υ-м∂ αℓινє ησω!*  
🛠️ *How can I assist you today?*

📌 Type *.menu* to view all commands.

> *⚡ Powered by Hasindu MD ⚡*`

        const buttons = [
            { buttonId: '.menu', buttonText: { displayText: '📂 Menu' }, type: 1 },
            { buttonId: '.owner', buttonText: { displayText: '👑 Owner' }, type: 1 }
        ]

        await conn.sendMessage(from, {
            image: { url: "https://i.ibb.co/kVD2Ddcd/Golden-Queen-MD-VIMAMODS-6r4acawr.jpg" },
            caption: madeMenu,
            footer: '🤖 Hasindu-MD Alive System',
            buttons,
            headerType: 4
        }, { quoted: mek })

    } catch (e) {
        console.log(e)
        reply(`${e}`)
    }
})
