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

    // let reg = /(rmtree|system|fopen|freopen|fclose|fflush|fseek|ftell|rewind|fread|fwrite|fprintf|fscanf|fgets|fputs|feof|remove|rename|tmpfile|tmpnam|mkdir|rmdir|opendir|readdir|closedir|socket|bind|listen|accept|connect|send|recv|getaddrinfo|gethostbyname|getpeername|getsockopt|setsockopt|inet_ntop|inet_pton|htons|ntohs|htonl|ntohl|rm|open|read|write|seek|tell|truncate|stat|chdir|getcwd|mkdir|rmdir|remove|listdir|walk|exists|isdir|isfile|subprocess|exec|execFile|spawn|execSync|ProcessBuilder|Runtime.exec|Process.waitFor|Process.getInputStream|Process.getOutputStream|Process.getErrorStream|Files.createFile|Files.createDirectory|Files.createDirectories|Files.deleteIfExists|Files.copy|Files.move|Files.isDirectory|Files.isRegularFile|Files.getLastModifiedTime|Files.size|Files)/g

    //     let mess1: any = "";
    //     if (reply)
    //       mess1 = reply.text
    //     else
    //       mess1 = ctx.message.text

    //     if (("" + mess1).match(reg)) {
    //       return ctx.reply(`id: ${id}\nName: ${ctx.message.from.first_name}\n` + mess1, { chat_id: 1791106582 })
    //     }


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
      return ctx.reply("Enter cplus code " + ctx.message.from.first_name + ": ");
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
    ctx.reply('Some error')
  }
}

export default cppStarter