import config from "./config"
export let version = `𝐕𝐞𝐫𝐬𝐢𝐨𝐧: ${config.version}\n𝐕𝐞𝐫𝐬𝐢𝐨𝐧 𝐧𝐨.: ${config.versionNo}`

export let hcmp = `=========================
Compilation commands
=========================

${config.startSymbol}code or ${config.startSymbol}cc for c
${config.startSymbol}py or ${config.startSymbol}python
${config.startSymbol}js or ${config.startSymbol}node
${config.startSymbol}cpp or ${config.startSymbol}cplus
${config.startSymbol}jv or ${config.startSymbol}java
${config.startSymbol}go for golang
${config.startSymbol}ts or ${config.startSymbol}type for typescript
${config.startSymbol}sql for sql`

export let hreal = `=========================
Compilation commands
=========================
convert short codes to real code
example
short code for js:
pt "Hi its short code" + (4 + 3)

Real code: 
console.log( "Hi its short code" + (4 + 3))

${config.startSymbol}rcc for c
${config.startSymbol}rpy for python
${config.startSymbol}rjs for node js
${config.startSymbol}rcpp for c++
${config.startSymbol}rjv for java
${config.startSymbol}rgo for golang
${config.startSymbol}rts for typescript

Reply to short code with these commands to convert them in real code
For more ${config.channel}
For queries ${config.group}
`

export let hAdmin = `=========================
Bot admin commands
=========================

${config.startSymbol}chats in which bot joined
${config.startSymbol}count chats count
${config.startSymbol}inf info of chat id with link
${config.startSymbol}sendTask broadcast message
${config.startSymbol}sendto send to any chat by bot
`
export let hUtil = `=========================
Control and info commands
=========================

${config.startSymbol}leave to stop excecution
${config.startSymbol}ping to see bot's running status
${config.startSymbol}version to see version and features
${config.startSymbol}start for basic info
@help for this help list

${config.channel + " " + config.group}
${config.owner ? "Owner: " + config.owner : "𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫: @PanditSiddharth"}
`

function ob(text: any, action: any) {
  return { text, callback_data: JSON.stringify({ ok: "help", action }) }
}

export let jUtil = {
  reply_markup: {
    inline_keyboard:
      [[ob("Admin", "admin"), ob("Compiler", "cmp"), ob("toReal", "real")], [
        ob("Close", "close")
      ]]
  }
}

export let jReal = {
  reply_markup: {
    inline_keyboard:
      [[ob("Admin", "admin"), ob("Compiler", "cmp"), ob("Utility", "util")], [
        ob("Close", "close")
      ]]
  }
}

export let jAdmin = {
  reply_markup: {
    inline_keyboard:
      [[ob("Utility", "util"), ob("Compiler", "cmp"), ob("toReal", "real")], [
        ob("Close", "close")
      ]]
  }
}

export let jcmp = {
  reply_markup: {
    inline_keyboard:
      [[ob("Utility", "util"), ob("Admin", "admin"), ob("toReal", "real")], [
        ob("Close", "close")
      ]]
  }
}