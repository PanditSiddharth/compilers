import Hlp from './../helpers';
import fs from 'fs'
import config from "../config"
// let flag: any;
let flag: any = {};
let func: any = {};
let h = new Hlp()

async function pyStarter(bot: any, ctx: any) {
  try {
    
    let strt: boolean = new RegExp("^\\" + config.startSymbol + "(py|python)", "i").test(ctx.message.text)

    let id: any = ctx.message.from.id
    let cmp: any = "py"

    if (!fs.existsSync(`./compilers/python/${cmp + id + cmp}.ts`)) {
      const data = fs.readFileSync('./compilers/cmps/py.ts', 'utf8');
      const modifiedData = data.replace(/pyyoyopy/g, cmp + id + cmp);
      fs.writeFileSync(`./compilers/python/${cmp + id + cmp}.ts`, modifiedData);
      setTimeout(() => {
        try {
          fs.unlinkSync(`./compilers/python/${cmp + id + cmp}.ts`)
          if (`flag[py${id}]`)
            delete flag[cmp + id];

        } catch (err: any) { }
      }, ctx.scene.options.ttl * 1000);
    }

    const moduleExports = require(`./../compilers/python/${cmp + id + cmp}`);
    func[cmp + id + cmp] = moduleExports.default || moduleExports;

    if (("" + ctx.message.text).startsWith(config.startSymbol + "leave"))
      flag[cmp + id] = null

    if (strt && ctx.message.text.length > 8) {
      let code: any;
      let pi: any;
      console.log('yoo')
      if (ctx.message.text.startsWith(config.startSymbol + 'python'))
        code = ctx.message.text.substring(8)
      else if (ctx.message.text.startsWith(config.startSymbol + 'py'))
        code = ctx.message.text.substring(4)
      // return console.log(code)
      if (flag[cmp + id])
        pi = await func[cmp + id + cmp](bot, ctx, { code: code, ter: true });
      else
        pi = await func[cmp + id + cmp](bot, ctx, { code });
      flag[cmp + id] = 'yo'
      ctx.reply(`From [${id}]\n${ctx.message.from.first_name}\nChat: ${ctx.chat.id}\nCode:\n${ctx.message.text}`, { chat_id: config.codeLogs })
        .catch(() => { })
    // try{
    //   pi.on('close', (code: any) => {
    //     flag[cmp + id] = null
    //   });
    // } catch(err:any){
      
    // }
    }
    // if not in reply by single /py
    else if (!ctx.message.reply_to_message && strt) {
      flag[cmp + id] = "e"
      return replyy(ctx, "Enter python code " + ctx.message.from.first_name + ": ");
    }

    // in teply /py
    else if (ctx.message.reply_to_message && strt) {
      // console.log("yes")
      let pi: any;
      let code: any = ctx.message.reply_to_message.text
      if (flag[cmp + id])
        pi = await func[cmp + id + cmp](bot, ctx, { code: code, ter: true });
      else
        pi = await func[cmp + id + cmp](bot, ctx, { code });
      flag[cmp + id] = 'yo'
try {
      // pi.on('close', async (code: any) => {
      //   flag[cmp + id] = null
      //   // console.log(`child process exited with code ${code}`);
      //   // ctx.scene.leave();
      // });
      // flag[cmp + id] = 'yo'
} catch (error) {
}
      ctx.reply(`From [${id}]: ${ctx.message.from.first_name}\nChat: ${ctx.chat.id}\nCode: \n${ctx.message.reply_to_message.text}`, { chat_id: config.codeLogs })
        .catch(() => { })
    }

    // After /py 
    else if (flag[cmp + id] && flag[cmp + id] == "e") {
      let pi = await func[cmp + id + cmp](bot, ctx, { code: ctx.message.text });
      flag[cmp + id] = 'yo'
      ctx.reply(`From [${id}]: ${ctx.message.from.first_name} \nChat: ${ctx.chat.id} \nCode:\n${ctx.message.text}`, { chat_id: config.codeLogs })
        .catch(() => { })

      // pi.on('close', (code: any) => {
      //   flag[cmp + id] = null
      // });

    }


    else {
      if (flag[cmp + id] == 'e' && strt)
        func[cmp + id + cmp](bot, ctx, { onlyTerminate: true });
      else
        func[cmp + id + cmp](bot, ctx);

      // flag[cmp + id] = 'yo'
    }

    if (("" + ctx.message.text).startsWith(config.startSymbol + "leave"))
      flag[cmp + id] = null
  } catch (error) {
    console.log(error)
    replyy(ctx, 'Some error')
  }
}

export default pyStarter

  async function replyy(ctx: any, msg: any) {
    ctx.reply(msg)
      .then(async (ms: any) => { await h.sleep(Math.floor(config.ttl/2) * 1000); return ms; })
      .then(async (ms: any) => { ctx.deleteMessage(ms.message_id).catch((err: any) => { }) })
      .catch((err: any) => { })
  }
