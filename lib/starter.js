"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = __importDefault(require("./helpers"));
const config_1 = __importDefault(require("./config"));
const events_1 = __importDefault(require("events"));
const sql_1 = __importDefault(require("./help/sql"));
const config_2 = __importDefault(require("./config"));
// let flag: any;
let flag = {};
let func = {};
let h = new helpers_1.default();
let sqlite;
async function starter(ctx, usr) {
    var _a, _b, _c, _d, _e, _f;
    try {
        let id = ctx.message.from.id;
        let msg = ctx.message;
        let reply = ctx.message.reply_to_message;
        let text = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text;
        if (text.match(/\/sql/i)) {
            try {
                if (!sqlite)
                    sqlite = require('sqlite3');
            }
            catch (error) {
                ctx.scene.leave();
                console.error("Sqlite3 not installed but can be installed using command\nnpm i sqlite3");
                return ctx.reply("sqlite3 npm package not installed").catch((err) => console.error(err));
            }
            if (reply) {
                ctx.message.text = text.replace(/\/sql/i, "/js");
                reply.text = (0, sql_1.default)(reply.text + "");
            }
            else if (text.length < 6) {
                return replyy(ctx, "Please reply to sql code");
            }
            else {
                ctx.message.text = "/js " + (0, sql_1.default)(text);
            }
        }
        msg.text = msg.text.replace(new RegExp(`\\/(${(_b = config_2.default.commands) === null || _b === void 0 ? void 0 : _b.join("|")})`, "i"), "").trim();
        // if first time
        if (!func[id]) {
            func[id] = { ...usr };
            const moduleExports = require((config_1.default.mode == "private" || ((_d = (_c = config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.root) === null || _c === void 0 ? void 0 : _c.allowed) === null || _d === void 0 ? void 0 : _d.includes(id)) && ((_e = text === null || text === void 0 ? void 0 : text.trim()) === null || _e === void 0 ? void 0 : _e.startsWith("/" + ((_f = config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.root) === null || _f === void 0 ? void 0 : _f.command)))) ? "./compiler" : `./docker`);
            func[id].run = moduleExports.default || moduleExports;
            let ctxemitter = new events_1.default();
            ctxemitter.setMaxListeners(0);
            func[id].ctxemitter = ctxemitter;
            func[id].buff = false;
            func[id].firstlistener = true;
            func[id].ErrorMes = "Error: \n";
            func[id].mid = 0;
            func[id].editedMes = "Output\: \n```" + usr.cmp + "\n";
            func[id][usr.cmp + "exe"] = usr.exe;
            func[id].cmp = usr.cmp;
        }
        // if user only used /js command
        if (!(msg.text + "") && !msg.reply_to_message) {
            func[id].status = "pending";
            return replyy(ctx, "Enter " + usr.cmp + " code " + ctx.from.first_name + ":");
        }
        // forcefully terminating session
        if (func[id] && ctx.message.text.match(/^\/leave/i))
            func[id].status = 'leave';
        // // for entering code after command
        // else if (func[id] && func[id].status == "pending") {
        //   func[id].status = "code";
        //   func[id].code = ctx.message.text;
        // }
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
        func[id].conf = config_1.default;
        func[id].run(ctx, func);
    }
    catch (error) {
        console.error(error);
        replyy(ctx, 'Some error');
    }
}
exports.default = starter;
async function replyy(ctx, msg) {
    ctx.reply(msg)
        .then(async (ms) => { await h.sleep(Math.floor((config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.ttl) / 2) * 1000); return ms; })
        .then(async (ms) => { ctx.deleteMessage(ms.message_id).catch((err) => { }); })
        .catch((err) => { });
}
