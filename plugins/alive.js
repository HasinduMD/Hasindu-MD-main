const Config = require('../config')

module.exports = {
  cmd: ['alive', 'bot', 'online'],
  desc: 'Check if bot is alive',
  type: 'info',
  exec: async (m, {
    conn
  }) => {
    const aliveText = `╭─────────────◆\n│ *🤖 Hasindu-MD Bot is Online!*\n│\n│ 👑 *Owner:* ${Config.ownername}\n│ 🏷️ *Version:* 1.0.0\n│ 🧠 *AI Powered:* ChatGPT\n│ 🌐 *Prefix:* . (dot)\n│ 📆 *Uptime:* ${runtime(process.uptime())}\n╰─────────────◆`

    const buttons = [
      { buttonId: '.menu', buttonText: { displayText: '📂 Menu' }, type: 1 },
      { buttonId: '.owner', buttonText: { displayText: '👑 Owner' }, type: 1 }
    ]

    await m.sendButton(aliveText, '🔥 Powered by Hasindu MD', buttons, 1)
  }
}

function runtime(seconds) {
  seconds = Number(seconds)
  var d = Math.floor(seconds / (3600 * 24))
  var h = Math.floor(seconds % (3600 * 24) / 3600)
  var m = Math.floor(seconds % 3600 / 60)
  var s = Math.floor(seconds % 60)
  return `${d}d ${h}h ${m}m ${s}s`
}
