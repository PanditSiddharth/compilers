import Hlp from '../helpers'
import config from '../config'
import { SpawnOptions, spawn, spawnSync } from 'child_process';
import path from 'path'
import fs from "fs"
let which = require('which')
let h = new Hlp();

let jvyoyojv = async (ctx: any, obj: any) => {
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
    let jvout = async (tempdata: any) => {
  
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
          await newObj.java.stdin.write(ctxx.message.text + "\n")
        } catch (err: any) { console.error(err) }

      });
    }

    if (newObj.status == "input") {
      return await newObj.ctxemitter.emit('ctx', await (ctx));
    }

    obj[ctx.from.id].status = "input"

    jvout('-1a\n')

    newObj.code = newObj.code.replace(/\u00A0/mg, ' ')
    let ttl = ctx.scene.options.ttl

    newObj.timeid = setTimeout(() => {
      newObj.code = false
      if (newObj && newObj.java) {
        ctx.reply("Timout: " + ttl + " Seconds")
        terminate(ctx, obj)
      }
    }, ttl * 1000)

    newObj.code = newObj.code.replace(/"start"/gi, 'public class Main {\npublic static void main(String[] args){')
    .replace(/"end"/gi, '\t}\n}');

  newObj.code = newObj.code.replace(/(^\s*pt)(.*)/gim, 'System.out.println($2);');

  const regex = /(?<=class\s*)\w+(?=\s*\{?\s*[\n\s]{0,3}public\s*static\s*void\s*main)/g;

  const match = newObj.code.match(regex)
  
  if (match) {
    newObj.javaFile = match[0];
  } else {
    terminate(ctx, obj)
    ctx.reply('No main class found ask @LogicB_support why this error.').catch((err: any) => { })
    return ctx.scene.leave()
  }

  newObj.javaProjectDir = path.join('.', 'files', 'java', `jv${newObj.fromId}jv`);
  newObj.javaFilePath = path.join(newObj.javaProjectDir, `${newObj.javaFile}.java`);

  try {
    fs.mkdirSync(newObj.javaProjectDir, { recursive: true });
  } catch (err) {
    // Handle directory creation error
  }
  
  try {
    fs.writeFileSync(newObj.javaFilePath, newObj.code);
  } catch (err) {
    // Handle file writing error
  }

  const { status, stderr } = spawnSync(which.sync('javac', {nothrow: true}), [newObj.javaFilePath]);
  
  if (status !== 0) {
    terminate(ctx, obj);
    reply(ctx, stderr.toString());
    return ctx.scene.leave();
  }
  
  newObj.java = spawn(newObj.jvexe, ['-cp', newObj.javaProjectDir, newObj.javaFile], config.spawnOptions ? config.spawnOptions : { env: {} } as SpawnOptions);
  newObj.java.stdout.on('data', jvout);

    let m = true
    newObj.java.stderr.on('data', async (data: any) => {
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
    newObj.java.on("error", (err: any) => { console.error(err); terminate(ctx, obj); })
    newObj.java.on('close', function (statusCode: any) {
      if (statusCode == 0) {
        reply(ctx, 'Program terminated successfully')

      } else {
        reply(ctx, 'Program terminated unsuccessfully')
      }
      terminate(ctx, obj)
    });

    newObj.java.on('exit', (ex: any) => {
      console.log('exit', ex)
    })

    return newObj.java
  } catch (errr: any) {
    console.error(errr)
    reply(ctx, errr.message)
    terminate(ctx, obj)
  }
}

module.exports = jvyoyojv

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
    if(newObj && newObj.java)
    newObj.java.removeAllListeners()
  } catch (error) {
  }

  try {
    if (fs.existsSync(path.join(newObj.javaProjectDir, `${newObj.javaFile}.class`))) {
      fs.unlinkSync(path.join(newObj.javaProjectDir, `${newObj.javaFile}.class`));
    }
  } catch (err: any) { }

  try {
    if (fs.existsSync(newObj.javaFilePath)) {
      fs.unlinkSync(newObj.javaFilePath);
    }
  } catch (err: any) { }

  try {
    fs.rmSync(newObj.javaProjectDir, { recursive: true });
  } catch (err) { }

  console.log('terminating...')
  if (newObj && newObj.ctxemitter)
    newObj.ctxemitter.removeAllListeners()
  await h.sleep(10)
  options[ctx.from.id] = undefined
}