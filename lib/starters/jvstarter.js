"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = __importDefault(require("./../helpers"));
const config_1 = __importDefault(require("../config"));
const events_1 = __importDefault(require("events"));
let which = require("which");
// let flag: any;
let flag = {};
let func = {};
let h = new helpers_1.default();
let jvexe = which.sync('java', { nothrow: true });
async function jvStarter(bot, ctx, conf) {
    try {
        let strt = new RegExp("^\\" + config_1.default.startSymbol + "(jv|java)", "i").test(ctx.message.text);
        let id = ctx.message.from.id;
        let cmp = "java";
        let msg = ctx.message;
        msg.text = msg.text.replace(/\/(jv|java)/i, "").trim();
        // if first time
        if (!func[id]) {
            func[id] = {};
            const moduleExports = require(`../cmps/${cmp}`);
            func[id].run = moduleExports.default || moduleExports;
            func[id].editedMes = "Output\: \n```java\n";
            let ctxemitter = new events_1.default();
            ctxemitter.setMaxListeners(0);
            func[id].ctxemitter = ctxemitter;
            func[id].buff = false;
            func[id].firstlistener = true;
            func[id].ErrorMes = "Error: \n";
            func[id].mid = 0;
            func[id].jvexe = jvexe;
        }
        // if user only used /cc command
        if (!(msg.text + "") && !msg.reply_to_message) {
            func[id].status = "pending";
            return replyy(ctx, "Enter java code " + ctx.from.first_name + ":");
        }
        // forcefully terminating session
        if (func[id] && ctx.message.text.match(/^\/leave/i))
            func[id].status = 'leave';
        else if (func[id].status == "input") {
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
        else if (func[id].status != "input") {
            func[id] = '';
            delete func[id];
            ctx.scene.leave();
            return replyy(ctx, "Reply to code");
        }
        func[id].conf = conf;
        func[id].run(ctx, func);
    }
    catch (error) {
        console.error(error);
        replyy(ctx, 'Some error');
    }
}
exports.default = jvStarter;
async function replyy(ctx, msg) {
    ctx.reply(msg)
        .then(async (ms) => { await h.sleep(Math.floor(config_1.default.ttl / 2) * 1000); return ms; })
        .then(async (ms) => { ctx.deleteMessage(ms.message_id).catch((err) => { }); })
        .catch((err) => { });
}
