import { Telegraf, Context } from "telegraf";
import axios from "axios"
const Database = require("@replit/database")
const db = new Database()

import Hlp from './helpers'
let h = new Hlp()
let version = `𝐕𝐞𝐫𝐬𝐢𝐨𝐧: 1.0.3\n𝐕𝐞𝐫𝐬𝐢𝐨𝐧 𝐧𝐨.: 14`
let langcmds = `/code or /cc for c
/py or /python
/js or /node
/cpp or /cplus
/jv or /java
/go for golang `

const bt = (bot: any) => {
  const fs = require('fs');
  const filePath = './data.txt';
  // mdb(bot as any)

  bot.on('my_chat_member', async (ctx: any) => {
    let chat: any = ctx.chat
  if(!(chat.id + "").startsWith("-100"))
      return
    let status: any = ctx.update.my_chat_member.new_chat_member.status
    console.log(status)
    let ostatus: any = ctx.update.my_chat_member.old_chat_member.status

    
    if (status != 'left' && !['member', 'administrator'].includes(ostatus)) {
      updateJSON(chat.id)
      return ctx.reply(`#NewChat

Title: ${chat.title}
ID: ${chat.id}
${chat.username ? "Username: @" + chat.username : ""}`, { chat_id: -1001988408261 })
    }

    if (status == 'left' || status == 'kicked') {
      removeId(chat.id)
      return ctx.reply(`#LeftChat

Title: ${chat.title}
ID: ${chat.id}
${chat.username ? "Username: @" + chat.username : ""}`, { chat_id: -1001988408261 })
    }
    return
  })

  let previous = Date.now()
  bot.hears(/^\/ping/, (ctx: any) => {
    let current = Date.now()
    let tsec = Math.floor((current - previous) / 1000)
    let sec = tsec % 60
    let min = (Math.floor(tsec / 60)) % 60
    let hr = Math.floor(tsec / 3600)
    ctx.reply(`=========================
𝗥𝗲𝗮𝗹𝘁𝗶𝗺𝗲 𝗶/𝗼 𝗰𝗼𝗺𝗽𝗶𝗹𝗲𝗿 𝗯𝗼𝘁
=========================

${version}
Uptime: ${hr} : ${min} : ${sec}
`).catch(() => { })
  })

  bot.hears(/^\/(version)/, (ctx: any) => {
    ctx.reply(`=========================
𝗥𝗲𝗮𝗹𝘁𝗶𝗺𝗲 𝗶/𝗼 𝗰𝗼𝗺𝗽𝗶𝗹𝗲𝗿 𝗯𝗼𝘁
=========================

${version}
𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫: @PanditSiddharth

𝗙𝗲𝗮𝘁𝘂𝗿𝗲𝘀:
  # 𝐍𝐨𝐝𝐞 𝐣𝐬 𝐜𝐨𝐦𝐩𝐢𝐥𝐞𝐫
  # 𝐏𝐲𝐭𝐡𝐨𝐧 𝐜𝐨𝐦𝐩𝐢𝐥𝐞𝐫
  # 𝐂 𝐜𝐨𝐦𝐩𝐢𝐥𝐞𝐫
  # 𝐂++ 𝐂𝐨𝐦𝐩𝐢𝐥𝐞𝐫
  # 𝐉𝐚𝐯𝐚 𝐜𝐨𝐦𝐩𝐢𝐥𝐞𝐫
  # G𝗼 𝐜𝐨𝐦𝐩𝐢𝐥𝐞𝐫
=========================
`).catch(() => { })
  })
  bot.start(async (ctx: any) => {
    ctx.reply(`𝗥𝗲𝗮𝗹𝘁𝗶𝗺𝗲 𝗶/𝗼 𝗰𝗼𝗺𝗽𝗶𝗹𝗲𝗿 𝗯𝗼𝘁
Its 100% free made for helping to students

${langcmds}
/𝗹𝗲𝗮𝘃𝗲 to leave session (if you not want excecute your code)
/help to see full help list

  bot owner @Panditsiddharth 
  Join @LogicBOts @LogicB_Support
`).catch(() => { })
  })

  bot.help(async (ctx: any) => {
    ctx.reply(`𝗥𝗲𝗮𝗹𝘁𝗶𝗺𝗲 𝗶/𝗼 𝗰𝗼𝗺𝗽𝗶𝗹𝗲𝗿 𝗯𝗼𝘁

/version to see latest version and features
${langcmds}
/leave to leave session (if you not want excecute your code)
/help to see updated commands in bot

bot owner @Panditsiddharth 
@LogicBOts @LogicB_Support
`);
  })

  bot.on('callback_query', async (ctx: Context, next: any) => {
    let ctxx: any = ctx
    let update: any = ctx.update
    let cb = update.callback_query

    if (!list.includes(cb.from.id))
      return ctx.answerCbQuery('You are not allowed', { show_alert: true })
    let data = JSON.parse(cb.data)
    ctx.deleteMessage(cb.message.message_id)
    if (!data.ok)
      return
    let mm = await ctx.reply('Ok sending this task in every group')
    let chats = await readJSON()

    let ingroups = 0
    let sid: any = await ctx.reply('Sending message').catch((err: any) => { })
    for (let i = 0; i < chats.length; i++) {
      try {
        await ctxx.copyMessage(chats[i], { message_id: data.mid })
        // console.log(readJSON())
        if (i % 30 == 0 && i != 0)
          await bot.telegram.editMessageText(ctxx.chat.id, sid.message_id, undefined, 'Message sent in ' + i + " groups").catch((err: any) => { })
        ingroups++
      } catch (err: any) { }
    }

    setTimeout(() => {
      ctxx.editMessageText(`Task sent in ${ingroups} groups`, { message_id: mm.message_id }).catch((err: any) => { })
    }, 2000)
  })

  bot.hears(/^\/sendtask/i, async (ctx: Context) => {
    let msg: any = ctx.message
    if (!msg.reply_to_message)
      return ctx.reply("Please reply to Question")

    ctx.reply("क्या आप अपने होशो हवास में हैं ?", {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'हाँ भाई हाँ', callback_data: JSON.stringify({ ok: true, mid: msg.reply_to_message.message_id }) }, { text: 'नहीं', callback_data: JSON.stringify({ ok: false }) }]
        ]
      }
    }).catch((err: any) => { })
  })

  async function reply(ctx: any, msg: any, tim: number = 10, mode: any = null) {
    ctx.reply(msg, { parse_mode: mode })
      .then(async (ms: any) => { await h.sleep(tim * 1000); return ms; })
      .then(async (ms: any) => { ctx.deleteMessage(ms.message_id).catch((err: any) => { }) })
      .catch((err: any) => { })
  }

  bot.hears(/^\/inf/i, async (ctx: any) => {

    let msg: any = ctx.message
    let id: any;
    let match: any = ctx.message.text.match(/@[a-zA-Z0-9_]+/)
    if (!match) {
      let idmatch = msg.text.match(/\-100[0-9_]+/)
      if (idmatch) {
        let idd = idmatch[0]
        let cid = await bot.telegram.getChat(idd).catch((err: any) => { })
        if (!cid)
          return reply(ctx, "Seems I'm not admin of given chat")
        return ctx.reply(`
Title: ${cid.title}
id : ${cid.id}
${cid.username ? "Username: @" + cid.username : ''}
${(list.includes(msg.from.id) && cid.invite_link) ? "Invite Link: " + cid.invite_link : ""}`, { disable_web_page_preview: true })
          .catch((err: any) => { reply(ctx, err.message, 20) })
      }
      // return reply(ctx, 'Seems you are not given username')
    }
    try {
      if (!match[0])
        return

      id = (await axios.get(`https://tguname.panditsiddharth.repl.co/${match[0]}`)).data
    } catch (error: any) {
    }
    if (!id)
      return
    if (id.className == 'User') {
      reply(ctx, `
id : \`${id.id}\`
username: ${match[0]}
firstName: ${id.firstName}${id.lastName ? "\nlastName: " + id.lastName : ""}
premium: ${id.premium ? "Yes" : 'No'}
restricted: ${id.restricted ? "Yes" : 'No'}
deleted: ${id.deleted ? "Yes" : 'No'}
isBot: ${id.bot ? "Yes" : 'No'}
`, 60)
    }
    else if (id.className == 'Channel') {
      reply(ctx, `
id : \`${"-100" + id.id}\`
username: *${match[0]}*
title: ${id.title}
supergroup: ${id.megagroup ? "Yes" : 'No'}
restricted: ${id.restricted ? "Yes" : 'No'}
`, 60, 'Markdown')
    }
    else {
      reply(ctx, 'User or Chat not found')
    }
  })


  bot.hears(/^\/sendTo/i, async (ctx: Context) => {
    let msg: any = ctx.message

    if (!list.includes(msg.from.id))
      return reply(ctx, 'You are not allowed')

    if (!msg.reply_to_message)
      return reply(ctx, 'Please reply to message')

    let match: any = ("" + msg.text).match(/[-]?\d{9,14}/)
    // console.log(match)

    if (!match)
      return reply(ctx, "Please give id where to send text")
    let ctxx: any = ctx
    bot.telegram.sendMessage(match[0], msg.reply_to_message.text)
      .catch((err: any) => { reply(ctx, err.message) })
    reply(ctx, "message successfully sent", 60)
  })

 bot.hears(/^\/(list|count)/i, async (ctx: Context) => {
    let msg: any = ctx.message
   let id;
   if(msg.reply_to_message)
   id = msg.reply_to_message.from.id
   else
     id = msg.from.id
   
    if(msg.text.startsWith("/list") && list.includes(id))
      ctx.reply(JSON.stringify(await readJSON())).catch((err: any)=> {})
       if(msg.text.startsWith("/count") && list.includes(id))
      ctx.reply((await readJSON()).length + "").catch((err: any)=> {})
  })
  
  let list: any = [1791106582, 1942730863, 1580821417, 1643271211]
  // Function to write a new JSON object to the file
  function writeJSON(data: any) {
  db.set("ids", data)
    .then((d: any)=> {console.log(d)})
  }

  async function readJSON() {
    return await db.get("ids")
  }

  // Function to update an existing JSON object in the file
  let updateJSON = async (value: any) => {
    let data: any = await readJSON();
    if (!isNaN(parseInt(value))) {
      try {
        if (data.indexOf(value) == -1) {
          data.push(parseInt(value))
          writeJSON(data);
        }
        return true
      } catch (error) { }
    }
    return false
  }

 
  
  async function removeId(id: any) {
    let data = readJSON();
    if (!isNaN(parseInt(id))) {
      let data = await readJSON();
      let farr = data.filter((idd: any) => { return idd != id });
      console.log(farr)
      writeJSON(farr);
      return true
    }
    return false
  }
}

export default bt;
