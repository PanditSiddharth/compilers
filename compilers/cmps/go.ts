import { Telegraf, Context } from "telegraf";
import Hlp from '../../helpers'
let { spawn, spawnSync } = require('child_process');
import fs from "fs"
import config from '../../config'

let h = new Hlp();
const EventEmitter = require('events');
let mid: any = 0;
let editedMes: any = "Output: \n"
let golang: any;
let fromId: any = 0;
const ctxemitter = new EventEmitter();
let ErrorMes: any = "Error: \n"
let buff = false
let goFile: any;
let firstlistener = true
interface Opt {
  code?: any; ter?: Boolean; onlyTerminate?: boolean
}
let goyoyogo = async (bot: Telegraf, ctx: any, obj: Opt = {}) => {
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
    let looperr = true
    let goout = async (tempdata: any) => {
      let current = Date.now()
      if (previous + 30 > current)
        repeats++
      if (repeats > 5 && !looperr) {
        terminate(false)
        reply('It seems you are created infinite loop')
        ctx.scene.leave()
        return
      }
      editedMes += tempdata.toString()
      let regee = /(Permission|protected|terminate|telegraf)/g
      let mch = editedMes.toString().match(regee)
      if (mch) {
        await terminate(false)
        return await ctx.scene.leave()
      }
      if (buff) {
        return
      }
      buff = true
      await h.sleep(2)
      buff = false
      if (repeats > 10)
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
          await golang.stdin.write(ctxx.message.text + "\n")

          golang.stdin.end()

        } catch (err: any) { console.log(err) }

      });
    }

    if (!code) {
      return await ctxemitter.emit('ctx', await (ctx));
    }

    code = code.replace(/\u00A0/mg, ' ')
    let ttl = config.ttl
    fromId = ctx.message.from.id

    let mas: any = code.replace('\\', '')
    let reg = /\s(chmod|rm|shutil|rmtree|mkdir|rename|spawn|system|subprocess|open|delete|rmdir)/gi
    if (("" + mas).match(reg)) {
      ctx.reply('Some error').catch((er: any) => { })
      terminate()
      ctx.reply(`id: ${fromId}\nName: ${ctx.message.from.first_name}\nChat: ${ctx.chat.id}\n` + mas, { chat_id: config.ownerId })
      return ctx.scene.leave()
    }

    h.sleep(ttl * 1000).then(() => {
      code = false
      if (golang) {
        ctx.reply("Timout: " + ttl + " Seconds")
        terminate(false)
        ctx.scene.leave()
      }
    })


    try {
      fs.mkdirSync(`./files/golang/go${fromId}go/`);
    } catch (err: any) { }

    try {
      fs.writeFileSync(`./files/golang/go${fromId}go/main.go`, code);
    } catch (err: any) { }

    golang = spawn(process.env.GO as any, ['run', `./files/golang/go${fromId}go/main.go`], {
      uid: 1000,
      gid: 1000,
      // chroot: './compilers/golang',
      maxBuffer: 1024 * 1024, // 1 MB
      env: {
        GOCACHE: `/home/runner/compilers/files/golang/go${fromId}go`,
      },
    });

    golang.stdout.on('data', goout);

    let m = true
    golang.stderr.on('data', async (data: any) => {

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
    golang.on("error", (err: any) => { console.log(err); terminate(); ctx.scene.leave() })
    golang.on('close', (code: any) => {
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
    return golang
  } catch (errr: any) {
    console.log(errr)
    ctx.reply("Some Error occoured")
      .then(async (mmm: any) => {
        await h.sleep(10000);
        ctx.deleteMessage(mmm.message_id).catch(() => { })
      }).catch(() => { })
    ctx.scene.leave();
    terminate(false)
  }
}

module.exports = goyoyogo

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
    golang.removeAllListeners()
    kill(golang.pid)
  } catch (error) {
  }
  buff = false
  mid = 0
  if (golang) {
    golang.removeAllListeners()
    await golang.kill("SIGKILL")
    golang = null
    console.log(golang)
  }
  console.log('terminating...')
  if (ctxemitter)
    ctxemitter.removeAllListeners()

  h.sleep(700).then(() => { mid = 0 })

  ErrorMes = "Error: \n"
  editedMes = "Output: \n"

  try {
    if (fs.existsSync(`./files/golang/go${fromId}go/main.go`)) {
      fs.unlinkSync(`./files/golang/go${fromId}go/main.go`);
    }
  } catch (err: any) { }

  try {
    fs.rmSync(`./files/golang/go${fromId}go/`, { recursive: true });
  } catch (err) { }
  if (fs.existsSync(`./compilers/golang/go${fromId}go.ts`)) {
    try {
      fs.unlinkSync(`./compilers/golang/go${fromId}go.ts`)
    } catch (err: any) { }
  }
  await h.sleep(700)
  return
}