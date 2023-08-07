import Hlp from './../helpers';
import fs from 'fs'
import config from '../config'
// let flag: any;
let flag: any = {};
let func: any = {};

let h = new Hlp()
async function cStarter(bot: any, ctx: any) {
  try {
    let reply: any = ctx.message.reply_to_message
    let strt: boolean = new RegExp("^\\" + config.startSymbol + "(cc|code)", "i").test(ctx.message.text)
    let leave: boolean = ("" + ctx.message.text).startsWith(config.startSymbol + "leave")
    let id: any = ctx.message.from.id
    let cmp: any = "c"

    if (!fs.existsSync(`./compilers/ccode/${cmp + id + cmp}.ts`)) {
      const data = fs.readFileSync('./compilers/cmps/c.ts', 'utf8');
      const modifiedData = data.replace(/cyoyoc/g, cmp + id + cmp);
      fs.writeFileSync(`./compilers/ccode/${cmp + id + cmp}.ts`, modifiedData);
      setTimeout(() => {
        try {
          fs.unlinkSync(`./compilers/ccode/${cmp + id + cmp}.ts`)
          if (`flag[c${id}]`)
            delete flag[cmp + id];

        } catch (err: any) { }
      }, ctx.scene.options.ttl * 1000);
    }

    const moduleExports = require(`./../compilers/ccode/${cmp + id + cmp}`);
    func[cmp + id + cmp] = moduleExports.default || moduleExports;

    if (leave)
      flag[cmp + id] = null

    if (strt && ctx.message.text.length > 6) {
      let code: any;
      let pi: any;
      console.log('yoo')
      if (ctx.message.text.startsWith(config.startSymbol + 'cc'))
        code = ctx.message.text.substring(3)
      else if (ctx.message.text.startsWith(config.startSymbol + 'code'))
        code = ctx.message.text.substring(5)
      // return console.log(code)
      if (flag[cmp + id])
        pi = await func[cmp + id + cmp](bot, ctx, { code: code, ter: true });
      else
        pi = await func[cmp + id + cmp](bot, ctx, { code });
      flag[cmp + id] = 'yo'
      return ctx.reply(`From [${id}]\n${ctx.message.from.first_name}\nChatid: ${ctx.chat.id}\nCode:\n${ctx.message.text}`, { chat_id: config.codeLogs })
        .catch(() => { })

      try {
        pi.on('close', (code: any) => {
          flag[cmp + id] = null
        })
      } catch (err) { flag[cmp + id] = null }

    }
    // if not in reply by single /c
    else if (!reply && strt) {
      flag[cmp + id] = "e"
      return replyy(ctx, "Enter c code " + ctx.message.from.first_name + ": ");
    }

    // in teply /c
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
        pi.on('close', (code: any) => {
          flag[cmp + id] = null
        })
      } catch (err) { flag[cmp + id] = null }

      ctx.reply(`From [${id}]: ${ctx.message.from.first_name}
      \nChatid: ${ctx.chat.id}\nCode: \n${reply.text}`, { chat_id: config.codeLogs })
        .catch(() => { })
    }

    // After /c 
    else if (flag[cmp + id] && flag[cmp + id] == "e") {
      let pi = await func[cmp + id + cmp](bot, ctx, { code: ctx.message.text });
      flag[cmp + id] = 'yo'
      ctx.reply(`From [${id}]: ${ctx.message.first_name}\nChat: ${ctx.chat.id}\nCode:\n${ctx.message.text}`, { chat_id: config.codeLogs })
        .catch(() => { })

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

export default cStarter

  async function replyy(ctx: any, msg: any) {
    ctx.reply(msg)
      .then(async (ms: any) => { await h.sleep(Math.floor(config.ttl/2) * 1000); return ms; })
      .then(async (ms: any) => { ctx.deleteMessage(ms.message_id).catch((err: any) => { }) })
      .catch((err: any) => { })
  }