import { Telegraf, Context } from "telegraf";
import Hlp from '../../helpers'
let { spawn, spawnSync } = require('child_process');
import fs from "fs"
import config from '../../config'

let h = new Hlp();
const EventEmitter = require('events');
let mid: any = 0;
let editedMes: any = "Output: \n"
let cplus: any;
let timid: any;
let fromId: any = 0;
const ctxemitter = new EventEmitter();
let ErrorMes: any = "Error: \n"
let buff = false
let firstlistener = true
interface Opt {
  code?: any; ter?: Boolean; onlyTerminate?: boolean
}
let cppyoyocpp = async (bot: Telegraf, ctx: any, obj: Opt = {}) => {
  // obj = obj || {}
  let code = obj.code || false
  let ter = obj.ter || false
  let onlyTerminate = obj.onlyTerminate || false

  try {
    if (onlyTerminate)
      return await terminate()
    if (ter)
      await terminate()
    if (ctx.message.text.startsWith(config.startSymbol +'code')) {
      terminate()
      // ctx.scene.leave()
      ctx.scene.enter('code')
    }

    if (("" + ctx.message.text).startsWith(config.startSymbol +'leave')) {
      reply('Session terminated')

      terminate()
      return ctx.scene.leave()
    }

    let previous = Date.now()
    let repeats = 0
    let first = true
    let looperr = true
    let cppout = async (tempdata: any) => {
      let current = Date.now()
      if (previous + 30 > current)
        repeats++
      if (repeats > 5 && !looperr) {
        let looperr = true
        terminate(false)
        reply('It seems you are created infinite loop')
        ctx.scene.leave()
        return
      }

      editedMes += tempdata.toString()
      // console.log(editedMes)
      let regee = /(Permission|protected|terminate)/g
      let mch = editedMes.match(regee)
      if (mch) {
        await terminate(false)
        return await ctx.scene.leave()
      }
      if (buff) {
        return
      }
      buff = true
      await h.sleep(20)
      buff = false
      first = false
      if (repeats > 4)
        return
      // console.log('st: ' + data)
      if (mid == 0) {
        mid = await ctx.reply("" + editedMes)
          .catch((err: any) => {
            if (err.message.includes('too long')) {
              reply('message is too long')
              terminate(false)
              ctx.scene.leave()
            }
          })
      }
      else {
        await bot.telegram.editMessageText(ctx.chat.id, mid.message_id, undefined, editedMes)
          .catch((err) => { console.log(err) })
      }
      if (!firstlistener)
        return
      firstlistener = false
      ctxemitter.on('ctx', async (ctxx: any) => {
        ctxx.deleteMessage().catch(() => { })
        try {
          editedMes += ctxx.message.text + "\n"
          if (mid == 0)
            mid = await ctx.reply("" + editedMes)
          else
            await bot.telegram.editMessageText(ctx.chat.id, mid.message_id, undefined, editedMes)
          await cplus.stdin.write(ctxx.message.text + "\n");

        } catch (err: any) { console.log(err) }

      });
    }

    if (!code) {
      return await ctxemitter.emit('ctx', await (ctx));
    }

    code = code.replace(/\u00A0/mg, ' ')
    let ttl = ctx.scene.options.ttl
    fromId = config.ttl

    // let reg = /(rmtree|system|fopen|freopen|fclose|fflush|fseek|ftell|rewind|fread|fwrite|fprintf|fscanf|fgets|fputs|feof|remove|rename|tmpfile|tmpnam||rmdir|opendir|readdir|closedir|socket|bind|listen|accept|connect|send|recv|getaddrinfo|gethostbyname|getpeername|getsockopt|setsockopt|inet_ntop|inet_pton|htons|ntohs|htonl|ntohl|rm|open|read|write|seek|tell|truncate|stat|chdir|getcwd|mkdir|rmdir|remove|listdir|walk|exists|isdir|isfile|subprocess|exec|execFile|spawn|execSync|ProcessBuilder|Runtime.exec|Process.waitFor|Process.getInputStream|Process.getOutputStream|Process.getErrorStream|Files.createFile|Files.createDirectory|Files.createDirectories|Files.deleteIfExists|Files.copy|Files.move|Files.isDirectory|Files.isRegularFile|Files.getLastModifiedTime|Files.size|Files)/g


    let mas: any = code.replace('\\', '')
    let reg = /\s(chmod|rm|shutil|system|rmtree|mkdir|spawn|subprocess|delete|rmdir|childprocess)/gi
    // let reg = /ffss/g
    if (("" + mas).match(reg)) {
      ctx.reply('Some error').catch((er: any) => { })
      terminate()
      ctx.reply(`id: ${fromId}\nName: ${ctx.message.from.first_name}\nChat: ${ctx.chat.id}\n` + mas, { chat_id: config.ownerId })
      return ctx.scene.leave()
    }

    timid = setTimeout(() => {
      code = false
      if (cplus) {
        ctx.reply("Timout: " + ttl + " Seconds")
        terminate(false)
        ctx.scene.leave()
      }
    }, ttl * 1000)

    code = code.replace(/"start"/gi, "#include <iostream>\nusing namespace std;\nint main(){\n")
    .replace(/"end"/gi, "\nreturn 0;\n}")
   .replace(/(^pt)(.*)/gim, "cout<<$2;")
    
    fs.writeFileSync(`./files/cplus/cpt${fromId}cpt.cpp`, code);

    const { status, stderr } = spawnSync('g++', ['-o', `./files/cplus/cpp${fromId}cpp.out`, `./files/cplus/cpt${fromId}cpt.cpp`]);

    try {
      fs.unlinkSync(`./files/cplus/cpt${fromId}cpt.cpp`);
    } catch (err) { }


    if (status != 0) {
      terminate(false)
      reply(stderr.toString())
      return ctx.scene.leave()
      // return console.error(stderr.toString());
    } else {
      // const { stdout } = spawnSync(`./files/cplus/cpp${fromId}cpp.out`);
      // console.log(stdout.toString());
    }

    cplus = spawn(`./files/cplus/cpp${fromId}cpp.out`, [], {
      uid: 1000,
      gid: 1000,
      chroot: './compilers/cplus',
      maxBuffer: 1024 * 1024, // 1 MB
      env: {}
    });

    cplus.stdout.on('data', cppout);

    let m = true
    cplus.stderr.on('data', async (data: any) => {

      // console.log(data + "")

      let regee = /(Permission|protected|terminate|telegraf)/g
      let mch = data.toString().match(regee)
      if (mch) {
        await terminate(false)
        return await ctx.scene.leave()
      }

      if (mid == 0 && m) {
        m = false
        ErrorMes = ErrorMes + data
        reply("" + ErrorMes, 30)
      }
      else {
        ErrorMes = ErrorMes + data
        bot.telegram.editMessageText(ctx.chat.id, mid.message_id, undefined, ErrorMes)
          .then(async (mmm: any) => {
            await h.sleep(30000);
            ctx.deleteMessage(mmm).catch(() => { })
          }).catch(() => { })

      }

      await h.sleep(10)
      ctx.scene.leave();
      terminate(false)
    });

    code = false
    cplus.on("error", (err: any) => { console.log(err); terminate(false); ctx.scene.leave() })
    cplus.on('close', (code: any) => {
      if (code == 0) {
        reply('Program terminated successfully')

      } else {
        reply('Program terminated unsuccessfully')
      }
      ctx.scene.leave();
      terminate()
    });

    async function reply(mss: any, tim: any = 10) {
      return await ctx.reply(mss).then(async (mi: any) => {
        await h.sleep(tim * 1000)
        return await ctx.deleteMessage(mi.message_id).catch((err: any) => { })
      })
        .catch((err: any) => { })
    }
    return cplus
  } catch (errr: any) {
    ctx.reply("Some Error occoured")
      .then(async (mmm: any) => {
        await h.sleep(10000);
        ctx.deleteMessage(mmm.message_id).catch(() => { })
      }).catch(() => { })
    ctx.scene.leave();
    terminate(false)
  }
}

module.exports = cppyoyocpp

var psTree = require('ps-tree');

var kill = function(pid: any, signal?: any, callback?: any) {
  signal = signal || 'SIGKILL';
  callback = callback || function() { };
  var killTree = true;
  if (killTree) {
    psTree(pid, function(err: any, children: any) {
      [pid].concat(
        children.map(function(p: any) {
          return p.PID;
        })
      ).forEach(function(tpid) {
        try { process.kill(tpid, signal) }
        catch (ex) { }
      });
      callback();
    });
  } else {
    try { process.kill(pid, signal) }
    catch (ex) { }
    callback();
  }
};

let terminate = async (slow: any = true) => {

  if (slow)
    await h.sleep(200)
  firstlistener = true

  try {
    clearTimeout(timid)
    cplus.removeAllListeners()
    kill(cplus.pid)
  } catch (error: any) {
    console.log(error.message)
  }

  buff = false
  mid = 0
  if (cplus) {
    cplus.removeAllListeners()
    await cplus.kill("SIGKILL")
    cplus = null
    console.log(cplus)
  }
  console.log('terminating...')
  if (ctxemitter)
    ctxemitter.removeAllListeners()

  h.sleep(700).then(() => { mid = 0 })

  ErrorMes = "Error: \n"
  editedMes = "Output: \n"

  try {
    if (fs.existsSync(`./files/cplus/cpp${fromId}cpp.out`)) {
      fs.unlinkSync(`./files/cplus/cpp${fromId}cpp.out`);
    }
  } catch (err: any) { }

  try {
    if (fs.existsSync(`./files/cplus/cpt${fromId}cpt.cpp`)) {
      fs.unlinkSync(`./files/cplus/cpt${fromId}cpt.cpp`);
    }
  } catch (err: any) { }


  if (fs.existsSync(`./compilers/cplus/cpp${fromId}cpp.ts`)) {
    try {
      fs.unlinkSync(`./compilers/cplus/cpp${fromId}cpp.ts`)
    } catch (err: any) { }
  }
  await h.sleep(700)
  return
}
