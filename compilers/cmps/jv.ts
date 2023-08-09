import { Telegraf, Context } from "telegraf";
import Hlp from '../../helpers'
import config from '../../config'
let { spawn, spawnSync } = require('child_process');
import fs from "fs"

let h = new Hlp();
const EventEmitter = require('events');
let mid: any = 0;
let editedMes: any = "Output: \n"
let java: any;
let timid: any;
let fromId: any = 0;
const ctxemitter = new EventEmitter();
let ErrorMes: any = "Error: \n"
let buff = false
let javaFile: any;
let firstlistener = true

interface Opt {
  code?: any; ter?: Boolean; onlyTerminate?: boolean
}
let jvyoyojv = async (bot: Telegraf, ctx: any, obj: Opt = {}) => {
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
    let looperr = false
    let jvout = async (tempdata: any) => {
      let current = Date.now()
      if (previous + 30 > current)
        repeats++
      if (repeats > 5 && !looperr) {
        looperr = true
        terminate(false)
        reply('It seems you are created infinite loop')
        ctx.scene.leave()
        return
      }
      editedMes += tempdata.toString()
      // console.log(editedMes)
      let regee = /(Permission|protected|terminate)/g
      let mch = editedMes.toString().match(regee)
      if (mch) {
        await terminate(false)
        return await ctx.scene.leave()
      }
      if (buff) {
        return
      }
      buff = true
      await h.sleep(50)
      buff = false
      if (repeats > 5)
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
          await java.stdin.write(ctxx.message.text + "\n")
          java.stdin.end()

        } catch (err: any) { console.log(err) }

      });
    }

    if (!code) {
      return await ctxemitter.emit('ctx', await (ctx));
    }

    code = code.replace(/\u00A0/mg, ' ')
    let ttl = ctx.scene.options.ttl
    fromId = ctx.message.from.id

    let mas: any = code.replace('\\', '')
    let reg = /\s(chmod|rm|rmtree)/g
    if (("" + mas).match(reg)) {
      ctx.reply('Some error').catch((er: any) => { })
      terminate()
      ctx.reply(`id: ${fromId}\nName: ${ctx.message.from.first_name}\nChat: ${ctx.chat.id}\n` + mas, { chat_id: config.ownerId })
      return ctx.scene.leave()
    }

    timid = setTimeout(() => {
      code = false
      if (java) {
        ctx.reply("Timout: " + ttl + " Seconds")
        terminate(false)
        ctx.scene.leave()
      }
    }, ttl * 1000)

      code = code.replace(/"startjv"/gi, 'public class Main {\npublic static void main(String[] args){')
      .replace(/"endjv"/gi, '\t}\n}');

    code = code.replace(/(p)("[^"\n]*")/gi, 'System.out.println($2);');

      const regex = /(?<=class\s*)\w+(?=\s*\{?\s*[\n\s]{0,3}public\s*static\s*void\s*main)/g;

    const match = code.match(regex)
    console.log(match[0])
    console.log("yes")
    if (match) {
      javaFile = match[0];
      console.log('Found main class:' + javaFile);
    } else {
      terminate(false)
      ctx.reply('No main class found').catch((err: any) => { })
      console.log('No main class found.');
      return ctx.scene.leave()
    }

    try {
      fs.mkdirSync(`./files/java/jv${fromId}jv/`);
    } catch (err: any) { }

    try {
      fs.writeFileSync(`./files/java/jv${fromId}jv/${javaFile}.java`, code);
    } catch (err: any) { }

    const { status, stderr } = spawnSync(config.javac, [`./files/java/jv${fromId}jv/${javaFile}.java`]);

    // try {
    //   fs.unlinkSync(`./files/java/jv${fromId}jv/${javaFile}.java`);
    // } catch (err) { }


    if (status != 0) {
      terminate()
      reply(stderr.toString())
      return ctx.scene.leave()
      // return console.error(stderr.toString());
    } else {
      // const { stdout } = spawnSync(`./files/java/jv${fromId}jv/${javaFile}.class`);
      // console.log(stdout.toString());
    }
    // ['-cp', '/path/to/compiled/class', 'Hello']
    java = spawn(config.java, ['-cp', `./files/java/jv${fromId}jv/`, javaFile], {
      uid: 1000,
      gid: 1000,
      chroot: './compilers/java',
      maxBuffer: 1024 * 1024, // 1 MB
      env: {}
    });

    java.stdout.on('data', jvout);

    let m = true
    java.stderr.on('data', async (data: any) => {

      let regee = /(Permission|protected|index|cplus|terminate|telegraf)/g
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
    java.on("error", (err: any) => { console.log(err); terminate(); ctx.scene.leave() })
    java.on('close', (code: any) => {
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
    return java
  } catch (errr: any) {
    console.log(errr)
    ctx.reply("Some Error occoured")
      .then(async (mmm: any) => {
        await h.sleep(10000);
        ctx.deleteMessage(mmm.message_id).catch(() => { })
      }).catch(() => { })
    ctx.scene.leave();
    terminate()
  }
}

module.exports = jvyoyojv

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
    java.removeAllListeners()
    kill(java.pid)
  } catch (error) {
  }
  buff = false
  mid = 0
  if (java) {
    java.removeAllListeners()
    await java.kill("SIGKILL")
    java = null
    console.log(java)
  }
  console.log('terminating...')
  if (ctxemitter)
    ctxemitter.removeAllListeners()

  h.sleep(700).then(() => { mid = 0 })

  ErrorMes = "Error: \n"
  editedMes = "Output: \n"

  try {
    if (fs.existsSync(`./files/java/jv${fromId}jv/${javaFile}.class`)) {
      fs.unlinkSync(`./files/java/jv${fromId}jv/${javaFile}.class`);
    }
  } catch (err: any) { }

  try {
    if (fs.existsSync(`./files/java/jv${fromId}jv/${javaFile}.java`)) {
      fs.unlinkSync(`./files/java/jv${fromId}jv/${javaFile}.java`);
    }
  } catch (err: any) { }

  try {
    fs.rmSync(`./files/java/jv${fromId}jv/`, { recursive: true });
  } catch (err) { }

  if (fs.existsSync(`./compilers/java/jv${fromId}jv.ts`)) {
    try {
      fs.unlinkSync(`./compilers/java/jv${fromId}jv.ts`)
    } catch (err: any) { }
  }
  await h.sleep(700)
  return
}
