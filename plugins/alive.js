module.exports = {
  cmd: ['alive'],
  desc: 'Check if bot is alive',
  react: '👋',
  type: 'main',
  exec: async (m, { conn, reply }) => {
    await m.react('👋')
    const dateObj = new Date()
    const date = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const time = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    const greeting = (hour => {
      if (hour >= 5 && hour < 12) return '🌅 Good Morning'
      if (hour >= 12 && hour < 17) return '🌞 Good Afternoon'
      if (hour >= 17 && hour < 20) return '🌇 Good Evening'
      return '🌙 Good Night'
    })(dateObj.getHours())

    let message = `*╭─❖ нαѕιη∂υ м∂ ᴀℓινє ❖─╮*

${greeting}, *${m.pushName || 'User'}*!

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

    await m.sendButton(message, '🤖 Hasindu MD', buttons, 1)
  }
}
