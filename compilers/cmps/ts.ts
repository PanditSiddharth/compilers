import { Telegraf, Context } from "telegraf";
import Hlp from '../../helpers'
import config from '../../config'
let { spawn, exec, spawnSync } = require('child_process');
import fs from "fs"

let h = new Hlp();
const EventEmitter = require('events');
let mid: any = 0;
let editedMes: any = "Output: \n"
let node: any;
let timid: any;
let fromId: any = 0;
const ctxemitter = new EventEmitter();
let ErrorMes: any = "Error: \n"
let buff = false
let firstlistener = true
let err: any;
interface Opt {
  code?: any; ter?: Boolean; onlyTerminate?: boolean
}

import * as ts from 'typescript';

function tstojs(code: string): string {
  const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.CommonJS,
  };

  const result = ts.transpileModule(code, {
    compilerOptions,
  });

  if (result.diagnostics && result.diagnostics.length > 0) {
    const errors = ts.formatDiagnosticsWithColorAndContext(result.diagnostics, {
      getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
      getNewLine: () => ts.sys.newLine,
      getCanonicalFileName: (fileName: string) => fileName,
    });
    throw new Error(errors);
  }

  return result.outputText;
}



let tsyoyots = async (bot: Telegraf, ctx: any, obj: Opt = {}) => {
  // obj = obj || {}

  let code = obj.code || false
  let ter = obj.ter || false
  let onlyTerminate = obj.onlyTerminate || false

  try {
    if (onlyTerminate)
      return await terminate()
    if (ter)
      await terminate()
    if ((ctx.message.text + "").startsWith(config.startSymbol +'code')) {
      terminate()
      console.log("terminate from 33")

      ctx.scene.enter('code')
    }

    if (("" + ctx.message.text).startsWith(config.startSymbol +'leave')) {
      reply('Session terminated')
      console.log("terminate from 40")

      terminate()
      return ctx.scene.leave()
    }
    let previous = Date.now()
    let repeats = 0
    let looperr = false
    let jsout = async (tempdata: any) => {
      console.log(tempdata.toString())
      let current = Date.now()
      if (previous + 30 > current)
        repeats++
      if (repeats > 5 && !looperr) {
        looperr = true
        console.log("terminate from 55")

        terminate(false)
        reply('It seems you are created infinite loop')
        ctx.scene.leave()
        return
      }
      editedMes += tempdata.toString()
      // console.log(editedMes)
      let regee = /(Permission|protected|terminate)/g
      // let regee = /hdfsfd/
      let mch = (editedMes + "").match(regee)
      console.log(mch)
      if (mch) {
        console.log("terminate from 67")

        await terminate(false)
        return await ctx.scene.leave()
      }
      if (buff) {
        return
      }
      buff = true
      await h.sleep(20)
      buff = false
      if (repeats > 10)
        return

      if (mid == 0 && !err) {
        mid = await ctx.reply("" + editedMes)
          .catch((err: any) => {
            if (err.message.includes('too long')) {
              reply('message is too long')
              terminate(false)
              ctx.scene.leave()
            }
          })
      }
      else if (!err) {

        await bot.telegram.editMessageText(ctx.chat.id, mid.message_id, undefined, editedMes)
          .catch((err) => { console.log(err) })
      }
      // return
      console.log(firstlistener)
      if (!firstlistener)
        return
      firstlistener = false
      ctxemitter.on('ctx', async (ctxx: any) => {
        console.log('yes')
        ctxx.deleteMessage().catch(() => { })
        try {
          editedMes += ctxx.message.text + "\n"
          if (mid == 0)
            mid = await ctx.reply("" + editedMes)
          else
            await bot.telegram.editMessageText(ctx.chat.id, mid.message_id, undefined, editedMes)
          console.log(ctxx.message.text)
          await node.stdin.write(ctxx.message.text + "\n")

          node.stdin.end()

        } catch (err: any) { console.log(err) }

      });
    }

    if (!code) {
      return await ctxemitter.emit('ctx', ctx);
    }

    code = code.replace(/\u00A0/mg, ' ')
    let ttl = ctx.scene.options.ttl
    let fromId = ctx.message.from.id

    let mas: any = code.replace('\\', '')
    let reg = /\s(chmod|rm|shutil|rmtree|mkdir|spawn|system|subprocess|delete|rmdir)/gi
    if (("" + mas).match(reg)) {
      ctx.reply('Some error').catch((er: any) => { })
      console.log("terminate from 133")

      terminate()
      ctx.reply(`id: ${fromId}\nName: ${ctx.message.from.first_name}\nChat: ${ctx.chat.id}\n` + mas, { chat_id: config.ownerId })
      return ctx.scene.leave()
    }

    fromId = ctx.message.from.id

    timid = setTimeout(() => {
      code = false
      if (node && ![1791106582, config.ownerId].includes(fromId)) {
        ctx.reply("Timout: " + ttl + " Seconds")
        terminate(false)
        ctx.scene.leave()
      }
    }, ttl * 1000)

    code = code.replace(/(^pt)(.*)/gim, 'console.log($2);');
    fs.writeFileSync(`./files/tsnode/ts${fromId}ts.ts`, code)
    let tsc = spawnSync("tsc", [`./files/tsnode/ts${fromId}ts.ts`])

    // console.log(tsc.output)
    if (tsc.output[1] && tsc.output[1].length > 1) {
      send("Error\n" + tsc.output[1].toString().substring(25))
        .then((m) => { mid = m })
      err = true
      terminate(false)
    }

    if (tsc.stderr && tsc.stderr.toString().length > 1) {
      editedMes = tsc.stderr.toString()
      err = true
      send(editedMes).then((m: any) => { mid = m })
      terminate(false)
    }

    async function send(mass: string) {
      try {
        if (!mid)
          return await reply(mass, 25)
        else
          return await bot.telegram.editMessageText(ctx.chat.id, mid.message_id, undefined, mass).catch((err) => { })
      } catch (error) { }
    }

    await h.sleep(30)

    node = spawn(process.env.NODE as any, [`./files/tsnode/ts${fromId}ts.js`], {

      stdio: ['pipe', 'pipe', 'pipe'],
      uid: 1000,
      gid: 1000,
      chroot: './compilers/tsnode',
      maxBuffer: 1024 * 1024, // 1 MB
      env: { node: "/nix/store/dj805sw07vvpbxx39c8g67x8qddg0ikw-nodejs-18.12.1/bin/" }
    });

    node.stdout.on('data', jsout);

    let m = true
    node.stderr.on('data', async (data: any) => {
      console.log("terminate from 163")

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
      terminate()
    });

    code = false
    node.on("error", (err: any) => { console.log(err); terminate(); ctx.scene.leave() })
    node.on('close', (code: any) => {
      if (code == 0 && !err) {
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
    return node
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

module.exports = tsyoyots

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
    // node.stdin.pause()
    clearTimeout(timid)
    exec(`killall -9 -g ${node.pid}`, { shell: true })
    node.removeAllListeners()
    console.log(node.pid)
    kill(node.pid, "SIGKILL")
  } catch (error: any) {
    console.log(error.mesage)
  }
  mid = 0
  buff = false
  if (node) {
    node.removeAllListeners()
    await node.kill("SIGKILL")
    node = null
    console.log(node)
  }
  console.log('terminating...')
  if (ctxemitter)
    ctxemitter.removeAllListeners()

  h.sleep(500).then(() => { mid = 0; err = false })

  ErrorMes = "Error: \n"
  editedMes = "Output: \n"

  if (fs.existsSync(`./compilers/tsnode/ts${fromId}ts.ts`)) {
    try {
      fs.unlinkSync(`./compilers/tsnode/ts${fromId}ts.ts`)
    } catch (err: any) { }
  }

  if (fs.existsSync(`./files/tsnode/ts${fromId}ts.ts`)) {
    try {
      fs.unlinkSync(`./files/tsnode/ts${fromId}ts.ts`)
    } catch (err: any) { }
  }

  if (fs.existsSync(`./files/tsnode/ts${fromId}ts.js`)) {
    try {
      fs.unlinkSync(`./files/tsnode/ts${fromId}ts.js`)
    } catch (err: any) { }
  }

  await h.sleep(500)
  return
}
