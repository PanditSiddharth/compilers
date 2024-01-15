"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const helpers_1 = __importDefault(require("./helpers"));
const dt = __importStar(require("./btdata"));
let h = new helpers_1.default();
const bt = async (bot) => {
    const fs = require('fs');
    const filePath = './data.txt';
    // mdb(bot as any)
    let previous = Date.now();
    bot.hears(new RegExp("^\\" + config_1.default.startSymbol + "ping", 'i'), (ctx) => {
        let current = Date.now();
        let tsec = Math.floor((current - previous) / 1000);
        let sec = tsec % 60;
        let min = (Math.floor(tsec / 60)) % 60;
        let hr = Math.floor(tsec / 3600);
        ctx.reply(`=========================
𝗥𝗲𝗮𝗹𝘁𝗶𝗺𝗲 𝗶/𝗼 𝗰𝗼𝗺𝗽𝗶𝗹𝗲𝗿 𝗯𝗼𝘁
=========================

${dt.version}
Uptime: ${hr} : ${min} : ${sec}
`).catch(() => { });
    });
    bot.hears(new RegExp("^\\" + config_1.default.startSymbol + "(version)", 'i'), (ctx) => {
        ctx.reply(`=========================
𝗥𝗲𝗮𝗹𝘁𝗶𝗺𝗲 𝗶/𝗼 𝗰𝗼𝗺𝗽𝗶𝗹𝗲𝗿 𝗯𝗼𝘁
=========================

${dt.version}
${config_1.default.owner ? "Owner: " + config_1.default.owner : "𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫: @PanditSiddharth"}

𝗙𝗲𝗮𝘁𝘂𝗿𝗲𝘀:
  # 𝐍𝐨𝐝𝐞 𝐣𝐬 𝐜𝐨𝐦𝐩𝐢𝐥𝐞𝐫
  # 𝐏𝐲𝐭𝐡𝐨𝐧 𝐜𝐨𝐦𝐩𝐢𝐥𝐞𝐫
  # 𝐂 𝐜𝐨𝐦𝐩𝐢𝐥𝐞𝐫
  # 𝐂++ 𝐂𝐨𝐦𝐩𝐢𝐥𝐞𝐫
  # 𝐉𝐚𝐯𝐚 𝐜𝐨𝐦𝐩𝐢𝐥𝐞𝐫
  # G𝗼 𝐜𝐨𝐦𝐩𝐢𝐥𝐞𝐫
  # T𝐬 𝐜𝐨𝐦𝐩𝐢𝐥𝐞𝐫
=========================
`).catch(() => { });
    });
    async function hsend(ctx, json = {}) {
        try {
            return await bot.telegram.editMessageText(ctx.chat.id, json.mid, undefined, json.txt, json.json).catch((err) => { });
        }
        catch (error) { }
    }
    bot.on('callback_query', (ctx, next) => {
        try {
            let cb = ctx.update.callback_query;
            if (!cb.data.includes('help'))
                return next();
            ctx.answerCbQuery();
            let jdata = JSON.parse(cb.data);
            if (jdata.action == 'admin') {
                hsend(ctx, { mid: cb.message.message_id, txt: dt.hAdmin, json: dt.jAdmin });
            }
            else if (jdata.action == 'cmp') {
                hsend(ctx, { mid: cb.message.message_id, txt: dt.hcmp, json: dt.jcmp });
            }
            else if (jdata.action == 'util') {
                hsend(ctx, { mid: cb.message.message_id, txt: dt.hUtil, json: dt.jUtil });
            }
            else if (jdata.action == 'real') {
                hsend(ctx, { mid: cb.message.message_id, txt: dt.hreal, json: dt.jReal });
            }
            else if (jdata.action == 'close') {
                // hsend(ctx, {mid: cb.message.message_id ,txt: dt.hUtil, json: dt.jUtil})
                ctx.deleteMessage();
            }
        }
        catch (error) { }
    });
    bot.hears(new RegExp("^(\\" + config_1.default.startSymbol + "|\\/|@)(help|start)", 'i'), async (ctx, next) => {
        if (ctx.message.text.includes("run"))
            return next();
        ctx.reply(`𝗥𝗲𝗮𝗹𝘁𝗶𝗺𝗲 𝗶/𝗼 𝗰𝗼𝗺𝗽𝗶𝗹𝗲𝗿 𝗯𝗼𝘁

${dt.hcmp}
`, dt.jcmp);
    });
    async function reply(ctx, msg, tim = 10, mode = null) {
        ctx.reply(msg, { parse_mode: mode })
            .then(async (ms) => { await h.sleep(tim * 1000); return ms; })
            .then(async (ms) => { ctx.deleteMessage(ms.message_id).catch((err) => { }); })
            .catch((err) => { });
    }
    let minf = `bot owner ${config_1.default.owner ? config_1.default.owner : "@PanditSiddharth"}
${config_1.default.channel + " " + config_1.default.group}`;
};
exports.default = bt;
