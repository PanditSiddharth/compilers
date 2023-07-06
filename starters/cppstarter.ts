import Hlp from './../helpers';
import fs from 'fs'
import config from '../config'

// let flag: any;
let flag: any = {};
let func: any = {};

async function cppStarter(bot: any, ctx: any) {
  try {
    let reply: any = ctx.message.reply_to_message
    let strt: boolean = new RegExp("^\\" + config.startSymbol + "(cpp|cplus)", "i").test(ctx.message.text)
    let leave: boolean = ("" + ctx.message.text).startsWith(config.startSymbol + "leave")

    let id: any = ctx.message.from.id
    let cmp: any = "cpp"


    if (!fs.existsSync(`./compilers/cplus/${cmp + id + cmp}.ts`)) {
      const data = fs.readFileSync('./compilers/cmps/cpp.ts', 'utf8');
      const modifiedData = data.replace(/cppyoyocpp/g, cmp + id + cmp);
      fs.writeFileSync(`./compilers/cplus/${cmp + id + cmp}.ts`, modifiedData);
      setTimeout(() => {
        try {
          fs.unlinkSync(`./compilers/cplus/${cmp + id + cmp}.ts`)
          if (`flag[cpp${id}]`)
            delete flag[cmp + id];

        } catch (err: any) { }
      }, ctx.scene.options.ttl * 1000);
    }

    const moduleExports = require(`./../compilers/cplus/${cmp + id + cmp}`);
    func[cmp + id + cmp] = moduleExports.default || moduleExports;

    if (leave)
      flag[cmp + id] = null

    if (strt && ctx.message.text.length > 8) {
      let code: any;
      let pi: any;
      console.log('yoo')
      if (ctx.message.text.startsWith(config.startSymbol + 'cpp'))
        code = ctx.message.text.substring(4)
      else if (ctx.message.text.startsWith(config.startSymbol + 'cplus'))
        code = ctx.message.text.substring(6)
      // return console.log(code)
      if (flag[cmp + id])
        pi = await func[cmp + id + cmp](bot, ctx, { code: code, ter: true });
      else
        pi = await func[cmp + id + cmp](bot, ctx, { code });
      flag[cmp + id] = 'yo'
      return ctx.reply(`From [${id}]\n${ctx.message.from.ffirst_name}\nChatid: ${ctx.chat.id}\nCode:\n${ctx.message.text}`, { chat_id: config.codeLogs })
        .catch(() => { })

      try {
        pi.on('close', (code: any) => {
          flag[cmp + id] = null
        })
      } catch (err) { flag[cmp + id] = null }

    }
    // if not in reply by single /cpp
    else if (!reply && strt) {
      flag[cmp + id] = "e"
      return replyy(ctx, "Enter cplus code " + ctx.message.from.first_name + ": ");
    }

    // in teply /cpp
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

    // After /cpp 
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
    ctx.replyy('Some error')
  }
}

export default cppStarter

let h = new Hlp()
  async function replyy(ctx: any, msg: any) {
    ctx.reply(msg)
      .then(async (ms: any) => { await h.sleep(Math.floor(config.ttl/2) * 1000); return ms; })
      .then(async (ms: any) => { ctx.deleteMessage(ms.message_id).catch((err: any) => { }) })
      .catch((err: any) => { })
  }