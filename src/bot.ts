import { Telegraf, Context } from "telegraf";
import config from "./config";
import Hlp from './helpers'
import * as dt from './btdata'
import pjson from "../package.json"

let h = new Hlp()

const bt = async (bot: any) => {

  const fs = require('fs');
  const filePath = './data.txt';
  // mdb(bot as any)

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
  # 𝐑𝐮𝐬𝐭 𝐂𝐨𝐦𝐩𝐢𝐥𝐞𝐫
  # 𝐁𝐚𝐬𝐡 𝐂𝐨𝐦𝐩𝐢𝐥𝐞𝐫
  # 𝐏𝐨𝐰𝐞𝐫𝐬𝐡𝐞𝐥𝐥 𝐂𝐨𝐦𝐩𝐢𝐥𝐞𝐫

=========================
`).catch(() => { })
  })

  async function hsend(ctx: any, json: any = {}) {
    try {
      return await bot.telegram.editMessageText(ctx.chat.id, json.mid, undefined, json.txt, json.json).catch((err: any) => { })
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

}

export default bt;
