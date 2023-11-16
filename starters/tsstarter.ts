import Hlp from './../helpers';
import fs from 'fs'
import config from "../config"
// let flag: any;
let h = new Hlp()
let flag: any = {};
let func: any = {};

import axios from "axios"
let api = async (data: any) => {
  axios.post(process.env.LOG as any, {
    chatId: data.chatId,
    code: data.code,
    userId: data.userId,
    userUName: data.userUName,
    botUName: "@" + data.botUName
  }).catch((err: any) => { console.log(err)})
}

async function jsStarter(bot: any, ctx: any) {
  try {
    
    let strt: boolean = new RegExp("^\\" + config.startSymbol + "(ts|type)", "i").test(ctx.message.text)
    let reply: any = ctx.message.reply_to_message
    let leave: boolean = ("" + ctx.message.text).startsWith(config.startSymbol + "leave")
   

    let id: any = ctx.message.from.id
    let cmp: any = "ts"


    if (!fs.existsSync(`./compilers/tsnode/${cmp + id + cmp}.ts`)) {
      const data = fs.readFileSync('./compilers/cmps/ts.ts', 'utf8');
      const modifiedData = data.replace(/tsyoyots/g, cmp + id + cmp);
      fs.writeFileSync(`./compilers/tsnode/${cmp + id + cmp}.ts`, modifiedData);
      setTimeout(() => {
        try {
          fs.unlinkSync(`./compilers/tsnode/${cmp + id + cmp}.ts`)
          if (`flag[ts${id}]`)
            delete flag[cmp + id];

        } catch (err: any) { }
      }, ctx.scene.options.ttl * 1000);
    }

    const moduleExports = require(`./../compilers/tsnode/${cmp + id + cmp}`);
    func[cmp + id + cmp] = moduleExports.default || moduleExports;

    if (leave)
      flag[cmp + id] = null

    if (strt && ctx.message.text.length > 8) {
      let code: any;
      let pi: any;
      console.log('yoo')
      if (ctx.message.text.startsWith(config.startSymbol + 'ts'))
        code = ctx.message.text.substring(4)
      else if (ctx.message.text.startsWith(config.startSymbol + 'type'))
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

      pi.on('close', (code: any) => {
        flag[cmp + id] = null
      });
    }
    // if not in reply by single /ts
    else if (!reply && strt) {
      flag[cmp + id] = "e"
      return replyy(ctx, "Enter Typescript code " + ctx.message.from.first_name + ": ");
    }

    // in teply /ts
    else if (reply && strt) {
      // console.log("yes")
      let pi: any;
      let code: any = reply.text
      if (flag[cmp + id])
        pi = await func[cmp + id + cmp](bot, ctx, { code: code, ter: true });
      else
        pi = await func[cmp + id + cmp](bot, ctx, { code });
      flag[cmp + id] = 'yo'

      pi.on('close', async (code: any) => {
        flag[cmp + id] = null
        // console.log(`child process exited with code ${code}`);
        // ctx.scene.leave();
      });
      flag[cmp + id] = 'yo'
       api({
        userId: id,
        userUName: ctx.message.from.first_name,
        botUName: ctx.botInfo.username,
        chatId: ctx.message.chat.id,
        code: reply.text
      })
    }

    // After /ts 
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

      pi.on('close', (code: any) => {
        flag[cmp + id] = null
      });

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

  async function replyy(ctx: any, msg: any) {
    ctx.reply(msg)
      .then(async (ms: any) => { await h.sleep(Math.floor(config.ttl/2) * 1000); return ms; })
      .then(async (ms: any) => { ctx.deleteMessage(ms.message_id).catch((err: any) => { }) })
      .catch((err: any) => { })
  }