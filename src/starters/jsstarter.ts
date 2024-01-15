import Hlp from './../helpers';
import config from "../config"
import * as tp from "../interfaces"
import EventEmitter from 'events';
import sql from "../help/sql"
let which = require("which")
let jsexe =  which.sync('node', { nothrow: true })
// let flag: any;
let flag: any = {};
let func: any = {};
let h = new Hlp()

async function jsStarter(bot: any, ctx: any, conf: tp.Config) {
  try {

    let id: any = ctx.message.from.id
    let cmp: any = "js"
    let msg = ctx.message;
    let reply: any = ctx.message.reply_to_message
    let text: any = ctx.message.text

    if (text.match(/\/sql/i)) {
    if (reply) {
     ctx.message.text = text.replace(/\/sql/i, "/js")
     reply.text = sql(reply.text + "")
       
      } else if (text.length < 6) {
        return replyy(ctx, "Please reply to sql code")
      } else {
      ctx.message.text = "/js " + sql(text)
      }
    }

    msg.text = msg.text.replace(/\/(node|js)/i, "").trim()

    // if first time
    if (!func[id]) {
      func[id] = {};
      const moduleExports = require(`../cmps/${cmp}`);
      func[id].run = moduleExports.default || moduleExports;
      func[id].editedMes = "Output\: \n```js\n"
      let ctxemitter = new EventEmitter();
      ctxemitter.setMaxListeners(0)
      func[id].ctxemitter = ctxemitter;
      func[id].buff = false;
      func[id].firstlistener = true;
      func[id].ErrorMes = "Error: \n"
      func[id].mid = 0;
      func[id].jsexe = jsexe;
    }

    // if user only used /js command
    if (!(msg.text + "") && !msg.reply_to_message) {
      func[id].status = "pending"
      return replyy(ctx, "Enter nodejs code " + ctx.from.first_name + ":")
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

export default jsStarter

async function replyy(ctx: any, msg: any) {
  ctx.reply(msg)
    .then(async (ms: any) => { await h.sleep(Math.floor(config.ttl / 2) * 1000); return ms; })
    .then(async (ms: any) => { ctx.deleteMessage(ms.message_id).catch((err: any) => { }) })
    .catch((err: any) => { })
}
