import config from "./config"
export let version = `𝐕𝐞𝐫𝐬𝐢𝐨𝐧: ${config.version}\n`

export let hcmp = `=========================
Compilation commands
=========================

${config.startSymbol}cc for c
${config.startSymbol}py for python code
${config.startSymbol}js for node js code
${config.startSymbol}cpp fro c++ code
${config.startSymbol}jv for java code 
${config.startSymbol}rs for rust code
${config.startSymbol}go for golang
${config.startSymbol}ts for typescript code
${config.startSymbol}sql for sql code
${config.startSymbol}sh for shell script (bash)
${config.startSymbol}ps for powershell

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
      [[ob("Admin", "admin"), ob("Compiler", "cmp")], [
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
      [[ob("Utility", "util"), ob("Compiler", "cmp")], [
        ob("Close", "close")
      ]]
  }
}

export let jcmp = {
  reply_markup: {
    inline_keyboard:
      [[ob("Utility", "util"), ob("Admin", "admin")], [
        ob("Close", "close")
      ]]
  }
}