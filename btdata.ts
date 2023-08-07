import config from "./config"
export let version = `𝐕𝐞𝐫𝐬𝐢𝐨𝐧: ${config.version}\n𝐕𝐞𝐫𝐬𝐢𝐨𝐧 𝐧𝐨.: ${config.versionNo}`

export let hcmp = `=========================
Compilation commands
=========================
Add @CodeCompiler_bot in group 
Add @IOChannel_bot in channel 
more help/updates @LogicBots

${config.startSymbol}code or ${config.startSymbol}cc for c
${config.startSymbol}py or ${config.startSymbol}python
${config.startSymbol}js or ${config.startSymbol}node
${config.startSymbol}cpp or ${config.startSymbol}cplus
${config.startSymbol}jv or ${config.startSymbol}java
${config.startSymbol}go for golang
${config.startSymbol}ts or ${config.startSymbol}type for typescript`

export let hAdmin = `=========================
Bot admin commands
=========================

${config.startSymbol}chats in which bot joined
${config.startSymbol}count chats count
${config.startSymbol}inf info of chat id with link
`
export let hUtil = `=========================
Control and info commands
=========================

${config.startSymbol}ping to see bot's running status
${config.startSymbol}version to see version and features
${config.startSymbol}start for basic info
@help for this help list

${config.channel + " " + config.group}
${config.owner ? "Owner: " + config.owner : "𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫: @PanditSiddharth"}
`
export let jUtil = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "Admin", callback_data: JSON.stringify({ ok: "help", action: "admin" }) },
      { text: "Compiler", callback_data: JSON.stringify({ ok: "help", action: "cmp" }) }
      ]
    ]
  }
}

export let jAdmin = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "Utility", callback_data: JSON.stringify({ ok: "help", action: "util" }) },
      { text: "Compiler", callback_data: JSON.stringify({ ok: "help", action: "cmp" }) }
      ]
    ]
  }
}

export let jcmp = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "Utility", callback_data: JSON.stringify({ ok: "help", action: "util" }) },
      { text: "Admin", callback_data: JSON.stringify({ ok: "help", action: "admin" }) },
      { text: "Close", callback_data: JSON.stringify({ ok: "help", action: "close" }) }
      ]
    ]
  }
}