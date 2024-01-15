import Hlp from '../helpers'
import config from '../config'
import { spawn } from 'child_process';
let h = new Hlp();

let pyyoyopy = async (ctx: any, obj: any = {}) => {
  // obj = obj || {}
  const edit = async (messageId: any, messageText: any) => {
    return await ctx.telegram.editMessageText(ctx.chat.id, messageId, undefined, messageText + " ```", { parse_mode: "MarkdownV2" })
  }

  let newObj = obj[ctx.from.id]

  try {
    if (newObj.status == "leave") {
      reply(ctx, 'Session terminated')
      ctx.scene.leave()
      return await terminate(ctx, obj)
    }


    let previous = Date.now()
    let repeats = 0
    let looperr = false
    let pyout = async (tempdata: any) => {

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
              .catch((err) => { console.error(err) })
          } catch (err: any) { }
        }
      }
      // return
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
          await newObj.python.stdin.write(ctxx.message.text + "\n")
        } catch (err: any) { console.error(err) }

      });
    }

    if (newObj.status == "input") {
      return await newObj.ctxemitter.emit('ctx', await (ctx));
    }

    obj[ctx.from.id].status = "input"

    pyout('-1a\n')

    newObj.code = newObj.code.replace(/\u00A0/mg, ' ')
    let ttl = ctx.scene.options.ttl
    newObj.fromId = ctx.message.from.id

    newObj.code = newObj.code.replace(/^(\s*)(pt)(.*)/gim, '$1print($3);');

    newObj.timeid = setTimeout(() => {
      newObj.code = false
      if (newObj && newObj.python) {
        ctx.reply("Timout: " + ttl + " Seconds")
        terminate(ctx, obj)
      }
    }, ttl * 1000)

    let python = spawn(newObj.pyexe, ['-c', newObj.code], config.spawnOptions ? config.spawnOptions : { env: {} });
    python.setMaxListeners(0)
    newObj.python = python;
    newObj.python.stdout.on('data', function (data: any) {
      console.error(data.toString())
    });
    newObj.python.stdout.on('data', pyout);

    let m = true
    newObj.python.stderr.on('data', async (data: any) => {
      if (newObj.mid == 0 && m) {
        m = false
        newObj.ErrorMes = newObj.ErrorMes + data
        reply(ctx, "" + newObj.ErrorMes, 30)
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
    newObj.python.on("error", (err: any) => { console.error(err); terminate(ctx, obj); })
    newObj.python.on('close', function (statusCode: any) {
      if (statusCode == 0) {
        reply(ctx, 'Program terminated successfully')

      } else {
        reply(ctx, 'Program terminated unsuccessfully')
      }
      terminate(ctx, obj)
    });

    newObj.python.on('exit', (ex: any) => {
      console.log('exit', ex)
    })

    return newObj.python
  } catch (errr: any) {
    console.error(errr)
    reply(ctx, errr.message)
    terminate(ctx, obj)
  }
}

module.exports = pyyoyopy

async function reply(ctx:any, mss: any, tim: any = 10) {
  return await ctx.reply(mss).then(async (mi: any) => {
    await h.sleep(tim * 1000)
    return await ctx.deleteMessage(mi.message_id).catch((err: any) => { })
  })
    .catch((err: any) => { })
}

let terminate = async (ctx: any, options: any = {}) => {
  let newObj = options[ctx.from.id]
  if(ctx.scene)
  ctx.scene.leave()
  await h.sleep(100)
  try {
    clearTimeout(newObj.timeid)
    if(newObj && newObj.python)
    newObj.python.removeAllListeners()
  } catch (error) {
  }

  console.log('terminating...')
  if (newObj && newObj.ctxemitter)
    newObj.ctxemitter.removeAllListeners()
  await h.sleep(10)
  options[ctx.from.id] = undefined
}