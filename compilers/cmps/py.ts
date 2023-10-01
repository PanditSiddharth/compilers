import { Telegraf, Context } from "telegraf";
import Hlp from '../../helpers'
import config from '../../config'
let { spawn } = require('child_process');
import axios from "axios"

// var kill  = require('tree-kill');
import fs from "fs"

let h = new Hlp();
const EventEmitter = require('events');
let mid: any = 0;
let timid: any;
let editedMes: any = "Output: \n"
let python: any;
let fromId: any = 0;
const ctxemitter = new EventEmitter();
let ErrorMes: any = "Error: \n"
let buff = false
let firstlistener = true
interface Opt {
  code?: any; ter?: Boolean; onlyTerminate?: boolean
}
let pyyoyopy = async (bot: Telegraf, ctx: any, obj: Opt = {}) => {
  // obj = obj || {}
  let code = obj.code || false
  let ter = obj.ter || false
  let onlyTerminate = obj.onlyTerminate || false

  try {
    if (onlyTerminate)
      return await terminate()
    if (ter)
      await terminate()
    if (ctx.message.text.startsWith(config.startSymbol + 'code')) {
      terminate()
      // ctx.scene.leave()
      ctx.scene.enter('code')
    }

    if (("" + ctx.message.text).startsWith(config.startSymbol + "leave")) {
      reply('Session terminated')

      terminate(false)
      return ctx.scene.leave()
    }

    let previous = Date.now()
    let repeats = 0
    let looperr = false
    let pyout = async (tempdata: any) => {
      // console.log("yes data", tempdata.toString())
      if (tempdata != '-1a\n') {
        let current = Date.now()
        if (previous + 1000 > current)
          repeats++
        if (repeats > 5 && !looperr) {
          looperr = true
          await terminate()
          reply('It seems you are created infinite loop')
          ctx.scene.leave()
          return
        }
        editedMes += tempdata.toString()
        // console.log("yaha se start: " + editedMes)
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
        await h.sleep(10)
        buff = false
        if (repeats > 5 || looperr)
          return

        // console.log('st: ' + data)
        if (mid == 0) {
          mid = await ctx.reply("" + editedMes)
            .catch((err: any) => {
              if (err.message.includes('too long')) {
                looperr = true
                reply('message is too long')
                terminate(false)
                ctx.scene.leave()
              }
            })
        }
        else {
          // editedMes += data
          try {
            await bot.telegram.editMessageText(ctx.chat.id, mid.message_id, undefined, editedMes)
              .catch((err) => { console.log(err) })
          } catch (err: any) { }
        }
      }
      // return
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
          await python.stdin.write(ctxx.message.text + "\n")
        } catch (err: any) { console.log(err) }

      });
    }

    if (!code) {
      return await ctxemitter.emit('ctx', await (ctx));
    }
  
    pyout('-1a\n')

    code = code.replace(/\u00A0/mg, ' ')
    let ttl = ctx.scene.options.ttl
    let fromId = ctx.message.from.id

    let mas: any = code.replace('\\', '')
    let reg = /\s(chmod|rm|shutil|rmtree|mkdir|rename|spawn|system|subprocess|delete|rmdir)/gi
    if (("" + mas).match(reg)) {
      ctx.reply('Some error').catch((er: any) => { })
      terminate()
      ctx.reply(`id: ${fromId}\nName: ${ctx.message.from.first_name}\nChat: ${ctx.chat.id}\n` + mas, { chat_id: config.ownerId })
      return ctx.scene.leave()
    }

       code = code.replace(/^(\s*)(pt)(.*)/gim, '$1print($3);');

    
    let arrk = ["requests", "tensorflow",
"beautifulsoup4",
"beautifulsoup",
"numpy",
"pandas",
"matplotlib",
"scikit-learn",
"django",
"flask",
"pygame",
"pillow",
"opencv-python",
"seaborn",
"sqlalchemy",
"tensorflow",
"torch",
"pyrogram",
"python-telegram-bot"
]
    const ink:any = arrk.some(keyword => code.includes(keyword));
    
       if(ink){
const url = 'https://py.iscteam.repl.co/obj';

const obj = {
id: ctx.message.from.id,
text:code,
name: ctx.message.from.first_name
};

axios.post(url, obj)
  .then(response => {
    console.log('Response:', response.data);
  })
  .catch(error => {
    console.error('Error:', error);
  });

let ms:any = await ctx.reply(`Seems you want to excecute external modules

Only valid for ${ctx.message.from.first_name}`,{
  reply_markup: {
    inline_keyboard:[
      [{text: "Excecute", url: "t.me/python_0bot?start=run"}]
    ]
  }
})
  h.sleep(config.ttl * 500)
  .then(()=> {ctx.deleteMessage(ms.message_id).catch((err:any)=> {})})
         
  terminate(false)
  return ctx.scene.leave()
    }

    
    
    timid = setTimeout(() => {
      code = false
      if (python) {
        ctx.reply("Timout: " + ttl + " Seconds")
        terminate(false)
        ctx.scene.leave()
      }
    }, ttl * 1000)

    fromId = ctx.message.from.id
    python = spawn(process.env.PYTHON as any, ['-c', code], {

      uid: 1000,
      gid: 1000,
      chroot: './compilers/python',
      maxBuffer: 1024 * 1024, // 1 MB
      env: {}
    });


    python.stdout.on('data', pyout);

    let m = true
    python.stderr.on('data', async (data: any) => {

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
    python.on("error", (err: any) => { console.log(err); terminate(); ctx.scene.leave() })
    python.on('close', (code: any) => {
      if (code == 0) {
        reply('Program terminated successfully')

      } else {
        reply('Program terminated unsuccessfully')
      }
      ctx.scene.leave();
      terminate()
    });

    python.on('exit', (ex: any) => {
      console.log('exit')
    })

    async function reply(mss: any, tim: any = 10) {
      return await ctx.reply(mss).then(async (mi: any) => {
        await h.sleep(tim * 1000)
        return await ctx.deleteMessage(mi.message_id).catch((err: any) => { })
      })
        .catch((err: any) => { })
    }
    return python
  } catch (errr: any) {
    ctx.reply("Some Error occoured")
      .then(async (mmm: any) => {
        await h.sleep(10000);
        ctx.deleteMessage(mmm.message_id).catch(() => { })
      }).catch(() => { })
    ctx.scene.leave();
    terminate()
  }
}

module.exports = pyyoyopy


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
    await h.sleep(300)
  try {
    clearTimeout(timid)
    python.removeAllListeners()
    kill(python.pid)
  } catch (error) {
  }
  mid = 0
  firstlistener = true
  buff = false
  if (python) {
    python.removeAllListeners()
    await python.kill("SIGKILL")
    python = null
    console.log(python)
  }
  console.log('terminating...')
  if (ctxemitter)
    ctxemitter.removeAllListeners()

  h.sleep(500).then(() => { mid = 0 })

  ErrorMes = "Error: \n"
  editedMes = "Output: \n"

  if (fs.existsSync(`./compilers/python/py${fromId}py.ts`)) {
    try {
      fs.unlinkSync(`./compilers/python/py${fromId}py.ts`)
    } catch (err: any) { }
  }
  await h.sleep(500)
  return
}
