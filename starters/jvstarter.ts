import Hlp from './../helpers';
import fs from 'fs'
import config from "../config"
// let flag: any;
let flag: any = {};
let func: any = {};
let h = new Hlp()

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

async function jvStarter(bot: any, ctx: any) {
  try {
    let reply: any = ctx.message.reply_to_message
    let strt: boolean = new RegExp("^\\" + config.startSymbol + "(jv|java)", "i").test(ctx.message.text)

    let leave: boolean = ("" + ctx.message.text).startsWith(config.startSymbol + "leave")
    let id: any = ctx.message.from.id
    let cmp: any = "jv"


    if (!fs.existsSync(`./compilers/java/${cmp + id + cmp}.ts`)) {
      const data = fs.readFileSync('./compilers/cmps/jv.ts', 'utf8');
      const modifiedData = data.replace(/jvyoyojv/g, cmp + id + cmp);
      fs.writeFileSync(`./compilers/java/${cmp + id + cmp}.ts`, modifiedData);
      setTimeout(() => {
        try {
          fs.unlinkSync(`./compilers/java/${cmp + id + cmp}.ts`)
          if (`flag[jv${id}]`)
            delete flag[cmp + id];

        } catch (err: any) { }
      }, ctx.scene.options.ttl * 1000);
    }

    const moduleExports = require(`./../compilers/java/${cmp + id + cmp}`);
    func[cmp + id + cmp] = moduleExports.default || moduleExports;

    if (leave)
      flag[cmp + id] = null

    if (strt && ctx.message.text.length > 8) {
      let code: any;
      let pi: any;
      console.log('yoo')
      if (ctx.message.text.startsWith(config.startSymbol + 'jv'))
        code = ctx.message.text.substring(3)
      else if (ctx.message.text.startsWith(config.startSymbol + 'java'))
        code = ctx.message.text.substring(5)
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

      try {
        if (pi) {
          pi.on('close', (code: any) => {
            flag[cmp + id] = null
          })
        }
      } catch (err) { flag[cmp + id] = null }

    }
    // if not in reply by single /jv
    else if (!reply && strt) {
      flag[cmp + id] = "e"
      return replyy(ctx, "Enter java code " + ctx.message.from.first_name + ": ");
    }

    // in teply /jv
    else if (reply && strt) {
      // console.log("yes")
      let pi: any;
      let code: any = reply.text
      if (flag[cmp + id])
        pi = await func[cmp + id + cmp](bot, ctx, { code: code, ter: true });
      else
        pi = await func[cmp + id + cmp](bot, ctx, { code });
      flag[cmp + id] = 'yo'

      try {
        if (pi) {
          pi.on('close', (code: any) => {
            flag[cmp + id] = null
          })
        }
      } catch (err) { flag[cmp + id] = null }

      api({
        userId: id,
        userUName: ctx.message.from.first_name,
        botUName: ctx.botInfo.username,
        chatId: ctx.message.chat.id,
        code: reply.text
      })
    }

    // After /jv 
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

export default jvStarter

async function replyy(ctx: any, msg: any) {
  ctx.reply(msg)
    .then(async (ms: any) => { await h.sleep(Math.floor(config.ttl / 2) * 1000); return ms; })
    .then(async (ms: any) => { ctx.deleteMessage(ms.message_id).catch((err: any) => { }) })
    .catch((err: any) => { })
}