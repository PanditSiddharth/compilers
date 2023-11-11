import { Telegraf, Context } from "telegraf";
import config from '../../config'
import Hlp from '../../helpers'
let { spawn, exec } = require('child_process');
import fs from "fs"

let h = new Hlp();
const EventEmitter = require('events');
let mid: any = 0;
let editedMes: any = "Output\: \n```js\n"
let node: any;
let timid: any;
let fromId: any = 0;
const ctxemitter = new EventEmitter();
let ErrorMes: any = "Error: \n"
let buff = false
let firstlistener = true
interface Opt {
  code?: any; ter?: Boolean; onlyTerminate?: boolean
}
let countpp = 0;
let jsyoyojs = async (bot: Telegraf, ctx: any, obj: Opt = {}) => {
  const edit = async (messageId:any, messageText:any) => {
    return await bot.telegram.editMessageText(ctx.chat.id, messageId, undefined, messageText + " ```", {parse_mode: "MarkdownV2"})
  }
  // obj = obj || {}
  let code = obj.code || false
  let ter = obj.ter || false
  let onlyTerminate = obj.onlyTerminate || false

  try {

    if (onlyTerminate)
      return await terminate()
    if (ter)
      await terminate()
    if ((ctx.message.text + "").startsWith(config.startSymbol + 'code')) {
      terminate()
      console.log("terminate from 33")

      ctx.scene.enter('code')
    }

    if (("" + ctx.message.text).startsWith(config.startSymbol + 'leave')) {
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
      let regee = /(Permission|protected|terminate|telegraf)/g
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

        await edit(mid.message_id, editedMes)
          .catch((err) => { console.log(err) })
      }
      // return
      console.log(firstlistener)
      if (!firstlistener)
        return
      firstlistener = false
    let connt = 0;
      ctxemitter.on('ctx', async (ctxx: any) => {
        ctxx.deleteMessage().catch(() => { })
        try {
          editedMes += ctxx.message.text + "\n"
          if (mid == 0)
             mid = await ctx.reply("" + editedMes + " ```", { parse_mode: "MarkdownV2" })
          else
            await edit(mid.message_id, editedMes)
          await node.stdin.write(ctxx.message.text + "\n")
          connt++;
          if(connt >= countpp)
            node.stdin.end()
        } catch (err: any) { console.log(err) }

      });
    }

    if (!code) {

      return await ctxemitter.emit('ctx', ctx);
    }

    code = code.replace(/\u00A0/mg, ' ')
    let ttl = config.ttl
    let fromId = ctx.message.from.id

    let mas: any = code.replace('\\', '')
    let reg = /\s(chmod|rm|shutil|rmtree|mkdir|rename|spawn|system|subprocess|open|delete|rmdir)/gi
    if (("" + mas).match(reg)) {
      ctx.reply('Some error').catch((er: any) => { })
      console.log("terminate from 133")

      terminate()
      ctx.reply(`id: ${fromId}\nName: ${ctx.message.from.first_name}\nChat: ${ctx.chat.id}\n` + mas, { chat_id: config.ownerId })
      return ctx.scene.leave()
    }


    code = code.replace(/(^\s*pt)(.*)/gim, 'console.log($2);');

    fromId = ctx.message.from.id

    timid = setTimeout(() => {
      code = false
      if (node && ![1791106582, config.ownerId].includes(fromId)) {
        ctx.reply("Timout: " + ttl + " Seconds")
        terminate(false)
        ctx.scene.leave()
      }
    }, ttl * 1000)
    countpp = countp(code)
    node = spawn(config.node, ['-e', code], {
      stdio: ['pipe', 'pipe', 'pipe'],
      uid: 1000,
      gid: 1000,
      chroot: './compilers/node',
      maxBuffer: 1024 * 1024, // 1 MB
      env: {}
    });

    node.stdout.on('data', jsout);

    let m = true
    node.stderr.on('data', async (data: any) => {
      console.log("terminate from 163")

      let regee = /(Permission|protected|terminate|(?<![a-zA-Z_ ]|^)rm(?![a-zA-Z_ ]|$)|Read\-only)/gi
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

module.exports = jsyoyojs

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
  node.stdin.end()
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

  h.sleep(500).then(() => { mid = 0 })

  ErrorMes = "Error: \n"
  editedMes = "Output\: \n```js\n"

  if (fs.existsSync(`./compilers/node/js${fromId}js.ts`)) {
    try {
      fs.unlinkSync(`./compilers/node/js${fromId}js.ts`)
    } catch (err: any) { }
  }
  await h.sleep(500)
  return
}

// Define an array of patterns to match
const patterns = [
  /input\([^)]*\)/g,
  /prompt\([^)]*\)/g,
  /readline\([^)]*\)/g,
  /question\([^)]*\)/g,
];

function countp(inputString: any) {
  if (typeof inputString !== 'string') {
    console.error('Input is not a string');
    return 0;
  }
  const matches: any = patterns.reduce((totalMatches, pattern) => {
    const patternMatches: any = inputString.match(pattern);
    return totalMatches.concat(patternMatches || []);
  }, []);
  return matches.length;
}