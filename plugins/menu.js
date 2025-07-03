const Config = require('../config')

module.exports = {
  cmd: ['menu', 'help', '?'],
  desc: 'Display command menu',
  type: 'main',
  exec: async (m, { conn }) => {

    const menu = `╭─────〔 *🤖 Hasindu MD Menu* 〕─────◆
│ 👋 Hello, *${m.pushName || 'there'}*!
│
│ 📌 Use the buttons below to navigate.
│ 🔰 Prefix: .
╰────────────────────────────◆`

    const buttons = [
      { buttonId: '.alive', buttonText: { displayText: '📡 Alive' }, type: 1 },
      { buttonId: '.owner', buttonText: { displayText: '👑 Owner' }, type: 1 },
      { buttonId: '.system', buttonText: { displayText: '💻 System Info' }, type: 1 },
    ]

    await m.sendButton(menu, '© Hasindu MD • Powered by OpenAI ⚡', buttons, 1)
  }
}
