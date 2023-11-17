import { Telegraf, Context } from "telegraf";
import config from "./config";
import axios from "axios"
const Database = require("@replit/database")
export const db = new Database()
import Hlp from './helpers'
import * as dt from './btdata'

let h = new Hlp()

const bt = async (bot: any) => {

  const fs = require('fs');
  const filePath = './data.txt';

  let previous = Date.now()
  bot.hears(new RegExp("^\\" + config.startSymbol + "ping", 'i'), (ctx: any) => {
    let current = Date.now()
    let tsec = Math.floor((current - previous) / 1000)
    let sec = tsec % 60
    let min = (Math.floor(tsec / 60)) % 60
    let hr = Math.floor(tsec / 3600)
    ctx.reply(`=========================
𝗥𝗲𝗮𝗹𝘁𝗶𝗺𝗲 𝗶/𝗼 𝗰𝗼𝗺𝗽𝗶𝗹𝗲𝗿 𝗯𝗼𝘁
=========================

${dt.version}
Uptime: ${hr} : ${min} : ${sec}
`).catch(() => { })
  })

  bot.hears(new RegExp("^\\" + config.startSymbol + "(version)", 'i'), (ctx: any) => {
    ctx.reply(`=========================
𝗥𝗲𝗮𝗹𝘁𝗶𝗺𝗲 𝗶/𝗼 𝗰𝗼𝗺𝗽𝗶𝗹𝗲𝗿 𝗯𝗼𝘁
=========================

${dt.version}
${config.owner ? "Owner: " + config.owner : "𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫: @PanditSiddharth"}

𝗙𝗲𝗮𝘁𝘂𝗿𝗲𝘀:
  # 𝐍𝐨𝐝𝐞 𝐣𝐬 𝐜𝐨𝐦𝐩𝐢𝐥𝐞𝐫
  # 𝐏𝐲𝐭𝐡𝐨𝐧 𝐜𝐨𝐦𝐩𝐢𝐥𝐞𝐫
  # 𝐂 𝐜𝐨𝐦𝐩𝐢𝐥𝐞𝐫
  # 𝐂++ 𝐂𝐨𝐦𝐩𝐢𝐥𝐞𝐫
  # 𝐉𝐚𝐯𝐚 𝐜𝐨𝐦𝐩𝐢𝐥𝐞𝐫
  # G𝗼 𝐜𝐨𝐦𝐩𝐢𝐥𝐞𝐫
  # T𝐬 𝐜𝐨𝐦𝐩𝐢𝐥𝐞𝐫
=========================
`).catch(() => { })
  })

  async function hsend(ctx: any, json: any = {}) {
    try {
      return await ctx.telegram.editMessageText(ctx.chat.id, json.mid, undefined, json.txt, json.json).catch((err: any) => { })
    } catch (error) { }
  }

  bot.on('callback_query', (ctx: any, next: any) => {
    try {
      let cb = ctx.update.callback_query
      if (!cb.data.includes('help'))
        return next()

      ctx.answerCbQuery()
      let jdata = JSON.parse(cb.data)

      if (jdata.action == 'admin') {
        hsend(ctx, { mid: cb.message.message_id, txt: dt.hAdmin, json: dt.jAdmin })
      } else if (jdata.action == 'cmp') {
        hsend(ctx, { mid: cb.message.message_id, txt: dt.hcmp, json: dt.jcmp })
      } else if (jdata.action == 'util') {
        hsend(ctx, { mid: cb.message.message_id, txt: dt.hUtil, json: dt.jUtil })
      } else if (jdata.action == 'real') {
        hsend(ctx, { mid: cb.message.message_id, txt: dt.hreal, json: dt.jReal })
      } else if (jdata.action == 'close') {
        // hsend(ctx, {mid: cb.message.message_id ,txt: dt.hUtil, json: dt.jUtil})
        ctx.deleteMessage()
      }

    } catch (error) { }
  })

  bot.hears(new RegExp("^(\\" + config.startSymbol + "|\\/|@)(help|start)", 'i'), async (ctx: any, next: any) => {
    if (ctx.message.text.includes("run"))
      return next()
    ctx.reply(`𝗥𝗲𝗮𝗹𝘁𝗶𝗺𝗲 𝗶/𝗼 𝗰𝗼𝗺𝗽𝗶𝗹𝗲𝗿 𝗯𝗼𝘁

${dt.hcmp}
`, dt.jcmp);
  })

 
  
  async function reply(ctx: any, msg: any, tim: number = 10, mode: any = null) {
    ctx.reply(msg, { parse_mode: mode })
      .then(async (ms: any) => { await h.sleep(tim * 1000); return ms; })
      .then(async (ms: any) => { ctx.deleteMessage(ms.message_id).catch((err: any) => { }) })
      .catch((err: any) => { })
  }

  let minf = `bot owner ${config.owner ? config.owner : "@PanditSiddharth"}
${config.channel + " " + config.group}`


  // bot.hears(new RegExp("^\\" + config.startSymbol + "sendto", 'i'), async (ctx: Context, next: any) => {
  //   let msg: any = ctx.message

  //   if (config.admins.includes(msg.from.id))
  //     return next();

  //   if (!msg.reply_to_message)
  //     return reply(ctx, 'Please reply to message')

  //   let match: any = ("" + msg.text).match(/[-]?\d{9,14}/)
  //   // console.log(match)

  //   if (!match)
  //     return reply(ctx, "Please give id where to send text")
  //   let ctxx: any = ctx
  //   ctxx.telegram.sendMessage(match[0], msg.reply_to_message.text)
  //     .catch((err: any) => { reply(ctx, err.message) })
  //   reply(ctx, "message successfully sent", 60)
  // })

  /*
  bot.hears(new RegExp("^\\" + config.startSymbol + "chats|count", 'i'), async (ctx: Context) => {
    let msg: any = ctx.message
    let id;
    if (msg.reply_to_message)
      id = msg.reply_to_message.from.id
    else
      id = msg.from.id
    let chats = await readJSON()
    if (!chats)
      return reply(ctx, "Chats not found")
    if (msg.text.startsWith(config.startSymbol + "chats") && config.admins.includes(id))
      ctx.reply(JSON.stringify(await readJSON())).catch((err: any) => { })
    if (msg.text.startsWith(config.startSymbol + "count") && config.admins.includes(id))
      ctx.reply((await readJSON()).length + "").catch((err: any) => { })
  })
  */

  // Function to write a new JSON object to the file
  function writeJSON(data: any) {
    db.set("ids", data)
      .then((d: any) => { console.log(d) })
      .catch((err: any) => { console.log(err.message) })
  }

  bot.hears(/\/setdb/i, async (ctx: any) => {
    try {
      if (!ctx.message.reply_to_message)
        return reply(ctx, "Please reply to message")
      if (ctx.message.from.id != config.ownerId)
        return reply(ctx, "You are not allowed")
      let data: any = ctx.message.reply_to_message.text
      data = JSON.parse(data)
      writeJSON(data)
    } catch (err: any) { }
  })

  async function readJSON() {
    try {
      let a = await db.get("ids")
      if (!a) {
        return []
      } else if (a.length == undefined) {
        return []
      }
      return a
    } catch (er: any) {
      return [];
    }
  }

  // Function to update an existing JSON object in the file
  let updateJSON = async (value: any) => {
    let data: any = await readJSON();
    if (!data)
      data = [];

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
