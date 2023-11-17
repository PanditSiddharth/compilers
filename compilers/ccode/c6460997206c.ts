import { Telegraf, Context } from "telegraf";
import Hlp from '../../helpers'
import config from '../../config'
let { spawn, spawnSync } = require('child_process');
import fs from "fs"

let h = new Hlp();
const EventEmitter = require('events');
let mid: any = 0;
let editedMes: any = "Output\: \n```c\n"
let ccode: any;
let timid: any;
let fromId: any = 0;
const ctxemitter = new EventEmitter();
let ErrorMes: any = "Error: \n"
let buff = false
let firstlistener = true
interface Opt {
  code?: any; ter?: Boolean; onlyTerminate?: boolean
}
let c6460997206c = async (bot: Telegraf, ctx: any, obj: Opt = {}) => {
  // obj = obj || {}
  let code = obj.code || false
  let ter = obj.ter || false
  let onlyTerminate = obj.onlyTerminate || false

  try {
    if (onlyTerminate)
      return await terminate()
    if (ter)
      await terminate()

    if (("" + ctx.message.text).startsWith(config.startSymbol + 'leave')) {
      reply('Session terminated')

      terminate()
      return ctx.scene.leave()
    }

    let previous = Date.now()
    let repeats = 0
    let first = true
    let looperr = true
    let ccout = async (tempdata: any) => {
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
      let regee = /(Permission|protected|index|terminate|telegraf|(?<![a-zA-Z_ ]|^)rm(?![a-zA-Z_ ]|$)|Read\-only)/gi

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
        mid = await ctx.reply("" + editedMes + " ```", { parse_mode: "MarkdownV2" })
          .catch((err: any) => {
            if (err.message.includes('too long')) {
              reply('message is too long')
              terminate(false)
              ctx.scene.leave()
            }
          })
      }
      else {
        await ctx.telegram.editMessageText(ctx.chat.id, mid.message_id, undefined, editedMes + " ```", { parse_mode: "MarkdownV2" })
          .catch((err: any) => { console.log(err) })
      }
      if (!firstlistener)
        return
      firstlistener = false
      ctxemitter.on('ctx', async (ctxx: any) => {
        ctxx.deleteMessage().catch(() => { })
        try {
          editedMes += ctxx.message.text + "\n"
          if (mid == 0)
            mid = await ctx.reply("" + editedMes + " ```", { parse_mode: "MarkdownV2" })
          else
            await ctx.telegram.editMessageText(ctx.chat.id, mid.message_id, undefined, editedMes + " ```", { parse_mode: "MarkdownV2" })
          await ccode.stdin.write(ctxx.message.text + "\n");

        } catch (err: any) { console.log(err) }

      });
    }

    if (!code) {
      return await ctxemitter.emit('ctx', await (ctx));
    }

    code = code.replace(/\u00A0/mg, ' ')
    let ttl = config.ttl
    fromId = ctx.message.from.id

    // let reg = /(rmtree|system|fopen|freopen|fclose|fflush|fseek|ftell|rewind|fread|fwrite|fprintf|fscanf|fgets|fputs|feof|remove|rename|tmpfile|tmpnam||rmdir|opendir|readdir|closedir|socket|bind|listen|accept|connect|send|recv|getaddrinfo|gethostbyname|getpeername|getsockopt|setsockopt|inet_ntop|inet_pton|htons|ntohs|htonl|ntohl|rm|open|read|write|seek|tell|truncate|stat|chdir|getcwd|mkdir|rmdir|remove|listdir|walk|exists|isdir|isfile|subprocess|exec|execFile|spawn|execSync|ProcessBuilder|Runtime.exec|Process.waitFor|Process.getInputStream|Process.getOutputStream|Process.getErrorStream|Files.createFile|Files.createDirectory|Files.createDirectories|Files.deleteIfExists|Files.copy|Files.move|Files.isDirectory|Files.isRegularFile|Files.getLastModifiedTime|Files.size|Files)/g

    code = code.replace(/"start"/gi, "#include <stdio.h>\nint main(){\n")
      .replace(/"end"/gi, "\nreturn 0;\n}")
      .replace(/(^\s*pt)(.*)/gim, "printf($2);")
      .replace(/#include\s*\<conio\.h\>/, `#include "conio.h"`)

    code = code.replace(/.*\n.*printf\(.+\);/g, (match: any) => {
      console.log(match);
      if (match.includes("if")) {
        return match;
      }
      else return match + " fflush(stdout);";
    })

    let mas: any = code.replace('\\', '')
    let reg = /\s(chmod|rm|shutil|system|rmtree|mkdir|rename|spawn|subprocess|open|rmdir|childprocess)/gi
    // let reg = /ffss/g
    if (("" + mas).match(reg)) {
      ctx.reply('Some error').catch((er: any) => { })
      terminate()
      ctx.reply(`id: ${fromId}\nName: ${ctx.message.from.first_name}\nChat: ${ctx.chat.id}\n` + mas, { chat_id: config.ownerId })
      return ctx.scene.leave()
    }

    timid = setTimeout(() => {
      code = false
      if (ccode) {
        ctx.reply("Timout: " + ttl + " Seconds")
        terminate(false)
        ctx.scene.leave()
      }
    }, ttl * 1000)

    fs.writeFileSync(`./files/ccode/c${fromId}c.c`, code);

    const { status, stderr } = spawnSync('gcc', [
      '-I/home/runner/compilers/lib/',
      '-o',
      `./files/ccode/c${fromId}c`,
      `./files/ccode/c${fromId}c.c`, "./lib/conio.c", "-lm"]);

    try {
      // fs.unlinkSync(`./files/ccode/c${fromId}c.c`);
    } catch (err) { }


    if (status != 0) {
      terminate(false)
      reply(stderr.toString().replace(/\.\/files\/ccode\/c\d+c.c/g, "See"))
      return ctx.scene.leave()
      // return console.error(stderr.toString());
    } else {
      // const { stdout } = spawnSync(`./files/ccode/c${fromId}c`);
      // console.log(stdout.toString());
    }

    ccode = spawn(`./files/ccode/c${fromId}c`, [], {
      uid: 1000,
      gid: 1000,
      chroot: './compilers/ccode',
      maxBuffer: 1024 * 1024, // 1 MB
      env: {}
    });

    ccode.stdout.on('data', ccout);

    let m = true
    ccode.stderr.on('data', async (data: any) => {

      // console.log(data + "")
      let dstr = data.toString()
      let regee = /(Permission|protected|index|terminate|telegraf)/g
      let mch = dstr.match(regee)
      if (mch) {
        await terminate(false)
        return await ctx.scene.leave()
      }
      dstr = dstr.replace(/\.\/files\/ccode\/c\d+c\.c/g, "See")
      if (mid == 0 && m) {
        m = false
        ErrorMes = ErrorMes + dstr
        reply("" + ErrorMes, 30)
      }
      else {
        ErrorMes = ErrorMes + dstr
        ctx.telegram.editMessageText(ctx.chat.id, mid.message_id, undefined, ErrorMes)
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
    ccode.on("error", (err: any) => { console.log(err); terminate(false); ctx.scene.leave() })
    ccode.on('close', (code: any) => {
      if (code == 0) {
        reply('Program terminated successfully')

      } else {
        reply('Program terminated unsuccessfully')
      }
      ctx.scene.leave();
      terminate()
    });

    async function reply(mss: any, tim: any = 20) {
      return await ctx.reply(mss).then(async (mi: any) => {
        await h.sleep(tim * 1000)
        return await ctx.deleteMessage(mi.message_id).catch((err: any) => { })
      })
        .catch((err: any) => { })
    }
    return ccode
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

module.exports = c6460997206c

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
    ccode.removeAllListeners()
    kill(ccode.pid)
  } catch (error: any) {
    console.log(error.message)
  }

  buff = false
  mid = 0
  if (ccode) {
    ccode.removeAllListeners()
    await ccode.kill("SIGKILL")
    ccode = null
    console.log(ccode)
  }
  console.log('terminating...')
  if (ctxemitter)
    ctxemitter.removeAllListeners()

  h.sleep(700).then(() => { mid = 0 })

  ErrorMes = "Error: \n"
  editedMes = "Output\: \n```c\n"

  try {
    if (fs.existsSync(`./files/ccode/c${fromId}c`)) {
      fs.unlinkSync(`./files/ccode/c${fromId}c`);
    }
  } catch (err: any) { }

  try {
    if (fs.existsSync(`./files/ccode/c${fromId}c.c`)) {
      fs.unlinkSync(`./files/ccode/c${fromId}c.c`);
    }
  } catch (err: any) { }

  await h.sleep(700)
  return
}
