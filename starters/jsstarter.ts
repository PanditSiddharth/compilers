import Hlp from './../helpers';
import fs from 'fs'
import config from "../config"
import sql from "../help/sql"
// let flag: any;
let flag: any = {};
let func: any = {};
let h = new Hlp()

async function replyy(ctx: any, msg: any) {
  ctx.reply(msg)
    .then(async (ms: any) => { await h.sleep(Math.floor(config.ttl / 2) * 1000); return ms; })
    .then(async (ms: any) => { ctx.deleteMessage(ms.message_id).catch((err: any) => { }) })
    .catch((err: any) => { })
}

import axios from "axios"
let api = async (data: any) => {
  axios.post(process.env.LOG as any, {
    chatId: data.chatId,
    code: data.code,
    userId: data.userId,
    userUName: data.userUName,
    botUName: "@" + data.botUName
  }).catch((err: any) => { console.log(err) })
}

async function jsStarter(bot: any, ctx: any) {
  try {
    let reply: any = ctx.message.reply_to_message
    let ss: any = ctx.message.text

    if (ss.match(/\/sql/i)) {
      if (reply) {
        ctx.message.text = ss.replace(/\/sql/i, "/js")
        reply.text = sql(reply.text + "")

      } else if (ss.length < 6) {
        return replyy(ctx, "Please reply to sql code")
      } else {
        ctx.message.text = "/js " + sql(ss)
      }
    }

    let strt: boolean = new RegExp("^\\" + config.startSymbol + "(js|node)", "i").test(ctx.message.text)
    let leave: boolean = ("" + ctx.message.text).startsWith(config.startSymbol + "leave")
    let id: any = ctx.message.from.id
    let cmp: any = "js"

    if (!fs.existsSync(`./compilers/node/${cmp + id + cmp}.ts`)) {
      const data = fs.readFileSync('./compilers/cmps/js.ts', 'utf8');
      const modifiedData = data.replace(/jsyoyojs/g, cmp + id + cmp);
      fs.writeFileSync(`./compilers/node/${cmp + id + cmp}.ts`, modifiedData);
      setTimeout(() => {
        try {
          fs.unlinkSync(`./compilers/node/${cmp + id + cmp}.ts`)
          if (`flag[js${id}]`)
            delete flag[cmp + id];

        } catch (err: any) { }
      }, ctx.scene.options.ttl * 1000);
    }

    const moduleExports = require(`./../compilers/node/${cmp + id + cmp}`);
    func[cmp + id + cmp] = moduleExports.default || moduleExports;

    if (leave)
      flag[cmp + id] = null

    if (strt && ctx.message.text.length > 8) {
      let code: any;
      let pi: any;

      if (ctx.message.text.startsWith(config.startSymbol + 'js'))
        code = ctx.message.text.substring(4)
      else if (ctx.message.text.startsWith(config.startSymbol + 'node'))
        code = ctx.message.text.substring(6)
      // return console.log(code)
      if (flag[cmp + id])
        pi = await func[cmp + id + cmp](bot, ctx, { code: code, ter: true });
      else
        pi = await func[cmp + id + cmp](bot, ctx, { code });
      flag[cmp + id] = 'yo'
      api({
        userId: id,
        userUName: ctx.message.from.first_name,
        botUName: ctx.botInfo.username,
        chatId: ctx.message.chat.id,
        code: ctx.message.text
      })
      if (pi) {
        pi.on('close', (code: any) => {
          flag[cmp + id] = null
        });
      }
    }
    // if not in reply by single /js
    else if (!reply && strt) {
      flag[cmp + id] = "e"
      return replyy(ctx, "Enter nodejs code " + ctx.message.from.first_name + ": ");
    }

    // in teply /js
    else if (reply && strt) {
      // console.log("yes")
      let pi: any;
      let code: any = reply.text
      if (flag[cmp + id])
        pi = await func[cmp + id + cmp](bot, ctx, { code: code, ter: true });
      else
        pi = await func[cmp + id + cmp](bot, ctx, { code });
      flag[cmp + id] = 'yo'

      if (pi) {
        pi.on('close', (code: any) => {
          flag[cmp + id] = null
        })
      }
      flag[cmp + id] = 'yo'
      api({
        userId: id,
        userUName: ctx.message.from.first_name,
        botUName: ctx.botInfo.username,
        chatId: ctx.message.chat.id,
        code: reply.text
      })
    }

    // After /js 
    else if (flag[cmp + id] && flag[cmp + id] == "e") {
      let pi = await func[cmp + id + cmp](bot, ctx, { code: ctx.message.text });
      flag[cmp + id] = 'yo'
      api({
        userId: id,
        userUName: ctx.message.from.first_name,
        botUName: ctx.botInfo.username,
        chatId: ctx.message.chat.id,
        code: ctx.message.text
      })

      if (pi) {
        pi.on('close', (code: any) => {
          flag[cmp + id] = null
        })
      }
    }

    else {
      if (flag[cmp + id] == 'e' && strt)
        func[cmp + id + cmp](bot, ctx, { onlyTerminate: true });
      else
        func[cmp + id + cmp](bot, ctx);

      // flag[cmp + id] = 'yo'
    }

    if (leave)
      flag[cmp + id] = null
  } catch (error) {
    console.log(error)
    replyy(ctx, 'Some error')
  }
}

export default jsStarter

