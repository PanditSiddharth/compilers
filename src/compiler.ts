import Hlp from './helpers'
import config from './config'
import { spawn, spawnSync } from 'child_process';
import fs from 'fs'
let which = require("which")
import path from "path"
import {findClass} from './tools';
import { Context, Scenes } from 'telegraf';
import { Update } from 'telegraf/types';
import { CustomCtx } from './types';

let h = new Hlp();

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


let cmplr0 = async (ctx: CustomCtx, obj: any = {}) => {
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

    async function sendToTelegramCore() {
      if (newObj.mid == 0) {
        if (newObj.editedMes.length > 4020)
          newObj.editedMes = newObj.editedMes.substring(0, 4020) + "...."
        let replyString = "" + newObj.editedMes + " ```";

        newObj.mid = await ctx.reply(replyString, {
          parse_mode: "MarkdownV2",
          reply_parameters: (newObj.inReply ? { message_id: newObj.inReply } : undefined)
        })
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
        // newObj.editedMes += data
        try {
          await edit(newObj.mid.message_id, newObj.editedMes)
            .catch((err) => { console.error(err) })
        } catch (err: any) { }
      }
    }

    async function sendToTelegram(tempdata: any) {
      // let current = Date.now()
      // if (previous + 1000 > current)
      //   repeats++
      // console.log(repeats, tempdata.toString())
      // if (repeats > 15 && !looperr) {
      //   looperr = true
      //   await terminate(ctx, obj)
      //   reply(ctx, 'It seems you are created infinite loop')
      //   ctx.scene.leave()
      //   return await h.sleep(500)
      // }

      newObj.editedMes += tempdata.toString().replace("\\", "\\\\")

      if (newObj.mid == 0 && newObj.preTime == "undefined" || newObj.preTime && newObj.preTime + 350 < Date.now()) {
        newObj.preTime = Date.now()
        delete newObj.timeOutId;
        await sendToTelegramCore()
      } else {
        newObj.preTime = Date.now()

        if (newObj.timeOutId == "undefined") {
          newObj.timeOutId = setTimeout(sendToTelegramCore, 350)
        } else {
          clearTimeout(newObj.timeOutId)
          newObj.timeOutId = setTimeout(sendToTelegramCore, 300)
        }

      }

    }

    async function messageFromUser() {
      let connt = 0;

      newObj.ctxemitter.on('ctx', async (ctxx: any) => {
        ctxx.deleteMessage().catch(() => { })
        try {
          newObj.editedMes += ctxx.message.text.replace("\\", "\\\\") + "\n"
          if (newObj.mid == 0)
            newObj.mid = await ctx.reply("" + newObj.editedMes + " ```", { parse_mode: "MarkdownV2" })
          else
            await edit(newObj.mid.message_id, newObj.editedMes)
          await newObj.node.stdin.write(ctxx.message.text.replace("\\", "\\\\") + "\n")
          connt++;
          if (/js|ts/.test(newObj.cmp) && connt >= newObj.countpp) {
            newObj.node.stdin.end()
          }
        } catch (err: any) { console.error(err) }

      });
    }

    if (newObj.status == "input") {
      return await newObj.ctxemitter.emit('ctx', await (ctx));
    }
    newObj.first = true;

    obj[ctx.from.id].status = "input"
    messageFromUser()
    newObj.countpp = countp(newObj.code)
    newObj.code = newObj.code.replace(/\u00A0/mg, ' ')

    if (newObj.code.startsWith("-r") && (ctx.message as any).reply_to_message) {
      newObj.code = newObj.code.replace(/^\-r/, "")?.trim()
      newObj.inReply = (ctx.message as any).reply_to_message.message_id;
    } else if (newObj.code.startsWith("-r")) {
      ctx.reply("-r flag only works when you send command with code in reply to any message")
     return await terminate(ctx, obj)
    }

    let ttl = (ctx.scene as any).options.ttl

    newObj.fromId = ctx.message.from.id

    newObj.timeid = setTimeout(() => {
      newObj.code = false
      if (newObj && newObj.node) {
        ctx.reply("Timout: " + ttl + " Seconds")
        return terminate(ctx, obj)
      }
    }, ttl * 1000)


    /**
     * For python language
     */
    if (newObj.cmp == "py") {

      newObj.node = spawn(newObj.exe, ['-u', '-c', newObj.code], config.spawnOptions || { env: {} });
      // newObj.node = spawn(
      //   "docker",
      //   [ "run", "-i", "--rm", "python:3.9-slim", "python3", "-uc", newObj.code] );
    }

    /**
     * For PowerShell commands
     */
    if (newObj.cmp == "ps") {
      newObj.node = spawn(newObj.exe, ['-Command', newObj.code], config.spawnOptions || {});
    }

    /**
     * For Bash commands
     */
    else if (newObj.cmp == "sh" || newObj.cmp == config?.root?.command) {
    
      newObj.node = spawn(newObj.exe, ['-c', newObj.code], config.spawnOptions || {});
    }


    /**
     * Some mid things in c/cpp and go compiler
     */
    else if (/c|cpp|go|rs/.test(newObj.cmp)) {

      // newObj.root = path.join('.', 'files', `${newObj.cmp}${newObj.fromId}`);
      newObj.root = path.join(require('os').tmpdir(), `${newObj.cmp}${newObj.fromId}`);
      newObj.filePath = path.join(newObj.root, `main.${newObj.cmp}`);

      try {
        if (!fs.existsSync(newObj.root))
          fs.mkdirSync(newObj.root);
      } catch (err: any) {
        // Handle file writing error
        console.error(err);
        return terminate(ctx, obj)
      }

      /**
       * For c language 
       */
      if (newObj.cmp == "c") {
        newObj.code = newObj.code.replace(/^(\s*)(pt)(.*)/gim, '$1printf($3);');
        newObj.code = newObj.code.replace(/"start"/gi, "#include <stdio.h>\nint main(){\n")
          .replace(/"end"/gi, "\nreturn 0;\n}")
          .replace(/(^\s*pt)(.*)/gim, "printf($2);")
          .replace(/#include\s*\<conio\.h\>/, `#include "conio.h"`)
          .replace(/(int\s+main\s*\([\s\S]*\)\s*\{)/, "$1 setbuf(stdout, NULL);")

        try {
          fs.writeFileSync(newObj.filePath, newObj.code);
        } catch (err: any) {
          // Handle file writing error
          console.error(err);
          return terminate(ctx, obj)
        }


        let cexefile = path.join(newObj.root, "main")
        const gccArgs = [
          '-I', path.join(__dirname, 'lib'),
          '-o', cexefile, newObj.filePath,
          path.join(__dirname, 'lib', 'conio.c'),
          '-lm'
        ];

        const { status, stderr } = spawnSync(newObj.exe, gccArgs);

        if (status !== 0) {
          terminate(ctx, obj);
          reply(ctx, stderr.toString().replace(new RegExp(newObj.filePath, 'g'), 'See'));
          return ctx.scene.leave();
        }

        newObj.node = spawn(cexefile, [], config.spawnOptions || { env: {} });
      }

      /**
       * For c++ code
       */
      else if (newObj.cmp == "cpp") {
        newObj.code = newObj.code.replace(/"start"/gi, "#include <iostream>\nusing namespace std;\nint main(){\n")
          .replace(/"end"/gi, "\nreturn 0;\n}")
          .replace(/(^\s*pt)(.*)/gim, "cout<<$2;")

        let cppexefile = path.join(newObj.root, `main.out`);


        try {
          fs.writeFileSync(newObj.filePath, newObj.code);
        } catch (err: any) {
          // Handle file writing error
          console.error(err);
          return terminate(ctx, obj)
        }


        const gppArgs = [
          '-o', cppexefile,
          newObj.filePath
        ];

        const { status, stderr } = spawnSync(newObj.exe, gppArgs);

        if (status !== 0) {
          terminate(ctx, obj);
          return reply(ctx, stderr.toString());
        }

        newObj.node = spawn(cppexefile, [], newObj.conf.spawnOptions || { env: {} });
      }

     /**
       * For rust code
       */
     else if (newObj.cmp == "rs") {
      newObj.code = newObj.code
        .replace(/(^\s*pt)(.*)/gim, "println!($2);")

      let rsexefile = path.join(newObj.root, `main`);

      try {
        fs.writeFileSync(newObj.filePath, newObj.code);
      } catch (err: any) {
        // Handle file writing error
        console.error(err);
        return terminate(ctx, obj)
      }


      const rsArgs = [
        newObj.filePath,
        '-o', rsexefile
      ];

      const { status, stderr } = spawnSync(newObj.exe, rsArgs);

      if (status !== 0) {
        terminate(ctx, obj);
        return reply(ctx, stderr.toString());
      }

      newObj.node = spawn(rsexefile, [], newObj.conf.spawnOptions || { env: {} });
    }

      /**
       * For go language
       */
      else if (newObj.cmp == "go") {
        newObj.code = newObj.code.replace(/^(\s*)(pt)(.*)/gim, '$1fmt.Println!($3);');
        try {
          fs.writeFileSync(newObj.filePath, newObj.code);
        } catch (err: any) {
          // Handle file writing error
          console.error(err);
          return terminate(ctx, obj)
        }

        newObj.node = spawn(newObj.exe, ['run', newObj.filePath], newObj.conf.spawnOptions || {
          env: {
            GOCACHE: newObj.root,
          },
        });
      }
    }

    /**
     * For js/ts languages
     */
    else if ((/js|ts/.test(newObj.cmp))) {
      newObj.countpp = countp(newObj.code)
      newObj.code = newObj.code.replace(/(^\s*pt)(.*)/gim, 'console.log($2);');
      if (newObj.cmp.includes("ts"))
        newObj.node = spawn(path.join('.', 'node_modules', '.bin', 'tsx'), ['-e', newObj.code],
          newObj.conf.spawnOptions || {
            env: {
              PATH: path.dirname(newObj.exe)
            }
          });
      else{
        console.log(newObj.exe, newObj.code, newObj.conf.spawnOptions)
        newObj.node = spawn(newObj.exe, ['-e', newObj.code], newObj.conf.spawnOptions ||
          { env: {} });   
      }
        
      // newObj.node = spawn(
      //   "docker",
      //   [ "run", "-i", "--rm", "node:23.4-slim", "node", "-e", newObj.code],
      //   {
      //     ...newObj.conf.spawnOptions, // Use any custom spawn options
      //   }
      // );
    }

    /**
     * For java language
     */
    else if (newObj.cmp == "java") {

      newObj.code = newObj.code.replace(/"start"/gi, 'public class Main {\npublic static void main(String[] args){')
        .replace(/"end"/gi, '\t}\n}')
        .replace(/(^\s*pt)(.*)/gim, 'System.out.println($2);');
      // const regex = /(?<=class\s*)\w+(?=\s*\{?\s*[\n\s]{0,3}public\s*static\s*void\s*main)/g;
      const found = findClass(newObj.code)

      if (found) {
        newObj.javaFile = found
      } else {
        terminate(ctx, obj)
        ctx.reply('No main class found ask @LogicB_support why this error.').catch((err: any) => { })
        return ctx.scene.leave()
      }

      // newObj.root = path.join('.', 'files', `${newObj.cmp}${newObj.fromId}`);
      newObj.root = path.join(require('os').tmpdir(), `${newObj.cmp}${newObj.fromId}`);
      newObj.filePath = path.join(newObj.root, `${newObj.javaFile}.${newObj.cmp}`);

      try {
        fs.mkdirSync(newObj.root);
        fs.writeFileSync(newObj.filePath, newObj.code);
      } catch (err) {
        // Handle file writing error
        console.error(err);
        return terminate(ctx, obj)
      }

      const { status, stderr } = spawnSync(which.sync('javac', { nothrow: true }), [newObj.filePath]);

      if (status !== 0) {
        terminate(ctx, obj);
        reply(ctx, stderr.toString());
        return ctx.scene.leave();
      }

      newObj.node = spawn(newObj.exe, ['-cp', newObj.root, newObj.javaFile], config.spawnOptions || { env: {} });
    }

    newObj.node.setMaxListeners(0)
    newObj.node.stdout.on('data', sendToTelegram);

    let m = true
    newObj.node.stderr.on('data', async (data: any) => {
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
    newObj.node.on("error", (err: any) => { console.error(err); terminate(ctx, obj); })
    newObj.node.on('close', function (statusCode: any) {
      if (statusCode == 0) {
        reply(ctx, 'Program terminated successfully')

      } else {
        reply(ctx, 'Program terminated unsuccessfully')
      }

      terminate(ctx, obj)
    });

    newObj.node.on('exit', (statusCode: any) => {
      if (statusCode != 0)
        reply(ctx, "Process exited with status code", statusCode)
      console.error("Process exited with status code", statusCode)
      terminate(ctx, obj)

    })

    return newObj.node
  } catch (errr: any) {
    console.error(errr)
    reply(ctx, errr.message)
    terminate(ctx, obj)
  }
}

module.exports = cmplr0

async function reply(ctx: any, mss: any, tim: any = 10) {
  return await ctx.reply(mss).then(async (mi: any) => {
    await h.sleep(tim * 1000)
    return await ctx.deleteMessage(mi.message_id).catch((err: any) => { })
  })
    .catch((err: any) => { })
}

let terminate = async (ctx: any, options: any = {}) => {
  let newObj = options[ctx.from.id]
  if(newObj?.ok)
    return
  if(!newObj) return
  newObj.ok = true;
  if(newObj.conf.onEnd && typeof newObj.conf.onEnd == "function"){

    let end = newObj.conf.onEnd
    if(end.length == 1){
      await end(ctx)
    } else {
      await end(ctx, options)
    }
  }
  newObj.terminated = true;
  await h.sleep(options.sleepTime || 1000)
  if (ctx.scene)
    ctx.scene.leave()

  if (newObj && newObj.node) {
    newObj.node.stdin.end()
  }
  try {
    clearTimeout(newObj.timeid)
    if (newObj && newObj.node)
      newObj.node.removeAllListeners()
  } catch (error) {
  }

  try {
    if (fs.existsSync(newObj.root)) {
      fs.rmSync(newObj.root, { recursive: true });
    }
  } catch (err: any) { }

  if (newObj && newObj.ctxemitter)
    newObj.ctxemitter.removeAllListeners()
  await h.sleep(100)
  options[ctx.from.id] = undefined
}