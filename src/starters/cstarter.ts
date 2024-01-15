import Hlp from './../helpers';
import fs from 'fs'
import config from "../config"
import * as tp from "../interfaces"
import EventEmitter from 'events';
let which = require("which")
// let flag: any;
let flag: any = {};
let func: any = {};
let h = new Hlp()
let gcc = which.sync('gcc', { nothrow: true })
async function cStarter(bot: any, ctx: any, conf: tp.Config) {
  try {

    let strt: boolean = new RegExp("^\\" + config.startSymbol + "(cc|code)", "i").test(ctx.message.text)

    let id: any = ctx.message.from.id
    let cmp: any = "c"
    let msg = ctx.message;
    msg.text = msg.text.replace(/\/(code|cc)/i, "").trim()
    // if first time
    if (!func[id]) {
      func[id] = {};
      const moduleExports = require(`../cmps/${cmp}`);
      func[id].run = moduleExports.default || moduleExports;
      func[id].editedMes = "Output\: \n```c\n"
      let ctxemitter = new EventEmitter();
      ctxemitter.setMaxListeners(0)
      func[id].ctxemitter = ctxemitter;
      func[id].buff = false;
      func[id].firstlistener = true;
      func[id].ErrorMes = "Error: \n"
      func[id].mid = 0;
      func[id].gcc = gcc;
    }

    // if user only used /cc command
    if (!(msg.text + "") && !msg.reply_to_message) {
      func[id].status = "pending"
      return replyy(ctx, "Enter c code:")
    }

    // forcefully terminating session
    if (func[id] && ctx.message.text.match(/^\/leave/i))
      func[id].status = 'leave'

    // // for entering code after command
    // else if (func[id] && func[id].status == "pending") {
    //   func[id].status = "code";
    //   func[id].code = ctx.message.text;
    // }
    else if(func[id].status == "input"){
      func[id].code = ctx.message.text;
    }

    // if user replied but it have much text
    else if (msg.text && func[id].status != "input") {

      func[id].code = msg.text;
      func[id].status = "code";
    }

    // user replied to text
    else if (msg.reply_to_message.text && func[id].status != "input") {
      func[id].code = msg.reply_to_message.text;
      func[id].status = "code";
    }

    // replied to not text
    else if(func[id].status != "input") {
      func[id] = ''
      delete func[id];
      ctx.scene.leave();
      return replyy(ctx, "Reply to code")
    }

    func[id].conf = conf;
    func[id].run(ctx, func)

  } catch (error:any) {
    console.error(error)
    replyy(ctx, 'Some error')
  }
}

export default cStarter

async function replyy(ctx: any, msg: any) {
  ctx.reply(msg)
    .then(async (ms: any) => { await h.sleep(Math.floor(config.ttl / 2) * 1000); return ms; })
    .then(async (ms: any) => { ctx.deleteMessage(ms.message_id).catch((err: any) => { }) })
    .catch((err: any) => { })
}
