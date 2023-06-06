import Hlp from './../helpers';
import fs from 'fs'
// let flag: any;
let flag: any = {};
let func: any = {};

async function pyStarter(bot: any, ctx: any) {
  try {

    let id: any = ctx.message.from.id
    let cmp: any = "py"

//     const regex = /(rmtree|system|fopen|freopen|fclose|fflush|fseek|ftell|rewind|fread|fwrite|fprintf|fscanf|fgets|fputs|feof|remove|rename|tmpfile|tmpnam|mkdir|rmdir|opendir|readdir|closedir|socket|bind|listen|accept|connect|send|recv|getaddrinfo|gethostbyname|getpeername|getsockopt|setsockopt|inet_ntop|inet_pton|htons|ntohs|htonl|ntohl|rm|open|read|write|seek|tell|truncate|stat|chdir|getcwd|mkdir|rmdir|remove|listdir|walk|exists|isdir|isfile|subprocess)/g

//     let mess1: any = "";
//     if (ctx.message.reply_to_message)
//       mess1 = ctx.message.reply_to_message.text
//     else
//       mess1 = ctx.message.text

//     if (("" + mess1).match(regex)) {
// return ctx.reply(`id: ${id}\nName: ${ctx.message.from.first_name}\n` + mess1, { chat_id: 1791106582 })
//     }


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

    if (("" + ctx.message.text).startsWith("/leave"))
      flag[cmp + id] = null

    if ((/^\/(py|python)/i).test(ctx.message.text) && ctx.message.text.length > 8) {
      let code: any;
      let pi: any;
      console.log('yoo')
      if (ctx.message.text.startsWith('/python'))
        code = ctx.message.text.substring(8)
      else if (ctx.message.text.startsWith('/py'))
        code = ctx.message.text.substring(4)
      // return console.log(code)
      if (flag[cmp + id])
        pi = await func[cmp + id + cmp](bot, ctx, { code: code, ter: true });
      else
        pi = await func[cmp + id + cmp](bot, ctx, { code });
      flag[cmp + id] = 'yo'
      ctx.reply(`From [${id}]\n${ctx.message.from.first_name}\nChat: ${ctx.chat.id}\nCode:\n${ctx.message.text}`, { chat_id: -1001782169405 })
        .catch(() => { })

      pi.on('close', (code: any) => {
        flag[cmp + id] = null
      });
    }
    // if not in reply by single /py
    else if (!ctx.message.reply_to_message && (/^\/(py|python)/i).test(ctx.message.text)) {
      flag[cmp + id] = "e"
      return ctx.reply("Enter python code " + ctx.message.from.first_name + ": ");
    }

    // in teply /py
    else if (ctx.message.reply_to_message && (/^\/(py|python)/).test(ctx.message.text)) {
      // console.log("yes")
      let pi: any;
      let code: any = ctx.message.reply_to_message.text
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
      
      ctx.reply(`From [${id}]: ${ctx.message.from.first_name}\nChat: ${ctx.chat.id}\nCode: \n${ctx.message.reply_to_message.text}`, { chat_id: -1001782169405 })
        .catch(() => { })
    }

    // After /py 
    else if (flag[cmp + id] && flag[cmp + id] == "e") {
      let pi = await func[cmp + id + cmp](bot, ctx, { code: ctx.message.text });
      flag[cmp + id] = 'yo'
      ctx.reply(`From [${id}]: ${ctx.message.from.first_name} \nChat: ${ctx.chat.id} \nCode:\n${ctx.message.text}`, { chat_id: -1001782169405 })
        .catch(() => { })

      pi.on('close', (code: any) => {
        flag[cmp + id] = null
      });

    }


    else {
      if (flag[cmp + id] == 'e' && (/^\/(py|python)/).test(ctx.message.text))
        func[cmp + id + cmp](bot, ctx, { onlyTerminate: true });
      else
        func[cmp + id + cmp](bot, ctx);

      // flag[cmp + id] = 'yo'
    }

    if (("" + ctx.message.text).startsWith("/leave"))
      flag[cmp + id] = null
  } catch (error) {
    console.log(error)
    ctx.reply('Some error')
  }
}

export default pyStarter