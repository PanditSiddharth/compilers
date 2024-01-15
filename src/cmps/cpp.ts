import Hlp from '../helpers'
import config from '../config'
import { spawn, spawnSync } from 'child_process';
import path from 'path'
import fs from "fs"
let h = new Hlp();

let cppyoyocpp = async (ctx: any, obj: any = {}) => {
  // obj = obj || {}
  const edit = async (messageId: any, messageText: any) => {
    return await ctx.telegram.editMessageText(ctx.chat.id, messageId, undefined, messageText + " ```", { parse_mode: "MarkdownV2" })
  }

  let newObj = obj[ctx.from.id]
  newObj.fromId = ctx.from.id;

  try {
    if (newObj.status == "leave") {
      reply(ctx, 'Session terminated')
      ctx.scene.leave()
      return await terminate(ctx, obj)
    }


    let previous = Date.now()
    let repeats = 0
    let looperr = false
    let cppout = async (tempdata: any) => {
      if (tempdata != '-1a\n') {
        let current = Date.now()
        if (previous + 1000 > current)
          repeats++
        if (repeats > 5 && !looperr) {
          looperr = true
          await terminate(ctx, obj)
          reply(ctx, 'It seems you are created infinite loop')
          ctx.scene.leave()
          return
        }
        newObj.editedMes += tempdata.toString()

        if (repeats > 5 || looperr)
          return
 
        if (newObj.mid == 0) {
          newObj.mid = await ctx.reply("" + newObj.editedMes + " ```", { parse_mode: "MarkdownV2" })
            .catch((err: any) => {
              if (err.message.includes('too long')) {
                looperr = true
                reply(ctx, 'message is too long')
                terminate(ctx, obj)
                ctx.scene.leave()
              }
            })
        }
        else {

          try {

            await edit(newObj.mid.message_id, newObj.editedMes)
              .catch((err:any) => { console.error(err) })
          } catch (err: any) { }
        }
      }

      if (!newObj.firstlistener)
        return

      newObj.firstlistener = false


      newObj.ctxemitter.on('ctx', async (ctxx: any) => {
        ctxx.deleteMessage().catch(() => { })
        try {
          newObj.editedMes += ctxx.message.text + "\n"
          if (newObj.mid == 0)
            newObj.mid = await ctx.reply("" + newObj.editedMes + " ```", { parse_mode: "MarkdownV2" })
          else
            await edit(newObj.mid.message_id, newObj.editedMes)
          await newObj.cplus.stdin.write(ctxx.message.text + "\n")
        } catch (err: any) { console.error(err) }

      });
    }

    if (newObj.status == "input") {
      return await newObj.ctxemitter.emit('ctx', await (ctx));
    }

    obj[ctx.from.id].status = "input"

    cppout('-1a\n')

    newObj.code = newObj.code.replace(/\u00A0/mg, ' ')
    let ttl = ctx.scene.options.ttl
    newObj.fromId = ctx.message.from.id

    newObj.timeid = setTimeout(() => {
      newObj.code = false
      if (newObj && newObj.cplus) {
        ctx.reply("Timout: " + ttl + " Seconds")
        terminate(ctx, obj)
      }
    }, ttl * 1000)

    newObj.code = newObj.code.replace(/"start"/gi, "#include <iostream>\nusing namespace std;\nint main(){\n")
      .replace(/"end"/gi, "\nreturn 0;\n}")
      .replace(/(^\s*pt)(.*)/gim, "cout<<$2;")


    newObj.cppCodeDir = path.join('.', 'files', 'cplus', `cpt${newObj.fromId}cpt`);
    newObj.cppCodeFilePath = path.join(newObj.cppCodeDir, `main.cpp`);
    newObj.cppCodeExecutablePath = path.join(newObj.cppCodeDir, `main.out`);

    try {
      if(!fs.existsSync(newObj.cppCodeDir)){
        fs.mkdirSync(newObj.cppCodeDir);
      }
    } catch (error:any) {
      console.error(error.message)
    }

    try {
      fs.writeFileSync(newObj.cppCodeFilePath, newObj.code);
    } catch (err) {
      // Handle file writing error
    }

    const gppArgs = [
      '-o', newObj.cppCodeExecutablePath,
      newObj.cppCodeFilePath
    ];

    const { status, stderr } = spawnSync(newObj.cppexe, gppArgs);

    try {
      fs.unlinkSync(newObj.cppCodeFilePath);
    } catch (err) {
      // Handle file deletion error
    }

    if (status !== 0) {
      terminate(ctx, obj);
      reply(ctx, stderr.toString());
      return ctx.scene.leave();
    }

    newObj.cplus = spawn(newObj.cppCodeExecutablePath, [], config.spawnOptions || { env: {} });
    newObj.cplus.setMaxListeners(0)
    newObj.cplus.stdout.on('data', cppout);

    let m = true
    newObj.cplus.stderr.on('data', async (data: any) => {
      if (newObj.mid == 0 && m) {
        m = false
        newObj.ErrorMes = newObj.ErrorMes + data
        reply("" + newObj.ErrorMes, 30)
      }
      else {
        newObj.ErrorMes = newObj.ErrorMes + data
        ctx.telegram.editMessageText(ctx.chat.id, newObj.mid.message_id, undefined, newObj.ErrorMes)
          .then(async (mmm: any) => {
            await h.sleep(30000);
            ctx.deleteMessage(mmm).catch(() => { })
          }).catch(() => { })
      }
      terminate(ctx, obj)
    });

    newObj.code = ""
    newObj.cplus.on("error", (err: any) => { console.error(err); terminate(ctx, obj); })
    newObj.cplus.on('close', function (statusCode: any) {
      if (statusCode == 0) {
        reply(ctx, 'Program terminated successfully')

      } else {
        reply(ctx, 'Program terminated unsuccessfully')
      }
      terminate(ctx, obj)
    });

    newObj.cplus.on('exit', (ex: any) => {
      console.log('exit', ex)
    })

    return newObj.cplus
  } catch (errr: any) {
    console.error(errr)
    reply(ctx, errr.message)
    terminate(ctx, obj)
  }
}

module.exports = cppyoyocpp

async function reply(ctx: any, mss: any, tim: any = 10) {
  return await ctx.reply(mss).then(async (mi: any) => {
    await h.sleep(tim * 1000)
    return await ctx.deleteMessage(mi.message_id).catch((err: any) => { })
  })
    .catch((err: any) => { })
}

let terminate = async (ctx: any, options: any = {}) => {
  let newObj = options[ctx.from.id]
  if (ctx.scene)
    ctx.scene.leave()
  await h.sleep(100)
  try {
    clearTimeout(newObj.timeid)
    if (newObj && newObj.cplus)
      newObj.cplus.removeAllListeners()
  } catch (error) {
  }

  try {
    if (fs.existsSync(newObj.cppCodeDir)) {
      fs.rmSync(newObj.cppCodeDir, { recursive: true });
    }
  } catch (err: any) { }

  console.log('terminating...')
  if (newObj && newObj.ctxemitter)
    newObj.ctxemitter.removeAllListeners()
  await h.sleep(10)
  options[ctx.from.id] = undefined
}