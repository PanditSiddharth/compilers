"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = __importDefault(require("../helpers"));
const config_1 = __importDefault(require("../config"));
const child_process_1 = require("child_process");
let h = new helpers_1.default();
// Define an array of patterns to match
const patterns = [
    /input\([^)]*\)/g,
    /prompt\([^)]*\)/g,
    /readline\([^)]*\)/g,
    /question\([^)]*\)/g,
];
function countp(inputString) {
    if (typeof inputString !== 'string') {
        console.error('Input is not a string');
        return 0;
    }
    const matches = patterns.reduce((totalMatches, pattern) => {
        const patternMatches = inputString.match(pattern);
        return totalMatches.concat(patternMatches || []);
    }, []);
    return matches.length;
}
let jsyoyojs = async (ctx, obj = {}) => {
    // obj = obj || {}
    const edit = async (messageId, messageText) => {
        return await ctx.telegram.editMessageText(ctx.chat.id, messageId, undefined, messageText + " ```", { parse_mode: "MarkdownV2" });
    };
    let newObj = obj[ctx.from.id];
    try {
        if (newObj.status == "leave") {
            reply(ctx, 'Session terminated');
            ctx.scene.leave();
            return await terminate(ctx, obj);
        }
        let previous = Date.now();
        let repeats = 0;
        let looperr = false;
        let jsout = async (tempdata) => {
            if (tempdata != '-1a\n') {
                let current = Date.now();
                if (previous + 1000 > current)
                    repeats++;
                if (repeats > 5 && !looperr) {
                    looperr = true;
                    await terminate(ctx, obj);
                    reply(ctx, 'It seems you are created infinite loop');
                    ctx.scene.leave();
                    return;
                }
                newObj.editedMes += tempdata.toString();
                if (repeats > 5 || looperr)
                    return;
                if (newObj.mid == 0) {
                    newObj.mid = await ctx.reply("" + newObj.editedMes + " ```", { parse_mode: "MarkdownV2" })
                        .catch((err) => {
                        if (err.message.includes('too long')) {
                            looperr = true;
                            reply(ctx, 'message is too long');
                            terminate(ctx, obj);
                            ctx.scene.leave();
                        }
                    });
                }
                else {
                    // newObj.editedMes += data
                    try {
                        await edit(newObj.mid.message_id, newObj.editedMes)
                            .catch((err) => { console.error(err); });
                    }
                    catch (err) { }
                }
            }
            // return
            if (!newObj.firstlistener)
                return;
            newObj.firstlistener = false;
            let connt = 0;
            newObj.ctxemitter.on('ctx', async (ctxx) => {
                ctxx.deleteMessage().catch(() => { });
                try {
                    newObj.editedMes += ctxx.message.text + "\n";
                    if (newObj.mid == 0)
                        newObj.mid = await ctx.reply("" + newObj.editedMes + " ```", { parse_mode: "MarkdownV2" });
                    else
                        await edit(newObj.mid.message_id, newObj.editedMes);
                    await newObj.node.stdin.write(ctxx.message.text + "\n");
                    connt++;
                    if (connt >= newObj.countpp) {
                        newObj.node.stdin.end();
                    }
                }
                catch (err) {
                    console.error(err);
                }
            });
        };
        if (newObj.status == "input") {
            return await newObj.ctxemitter.emit('ctx', await (ctx));
        }
        newObj.countpp = countp(newObj.code);
        obj[ctx.from.id].status = "input";
        newObj.code = newObj.code.replace(/(^\s*pt)(.*)/gim, 'console.log($2);');
        jsout('-1a\n');
        newObj.code = newObj.code.replace(/\u00A0/mg, ' ');
        let ttl = ctx.scene.options.ttl;
        newObj.fromId = ctx.message.from.id;
        newObj.timeid = setTimeout(() => {
            newObj.code = false;
            if (newObj && newObj.node) {
                ctx.reply("Timout: " + ttl + " Seconds");
                terminate(ctx, obj);
            }
        }, ttl * 1000);
        newObj.node = (0, child_process_1.spawn)(newObj.jsexe, ['-e', newObj.code], config_1.default.spawnOptions ? config_1.default.spawnOptions : { env: {} });
        newObj.node.setMaxListeners(0);
        newObj.node.stdout.on('data', jsout);
        let m = true;
        newObj.node.stderr.on('data', async (data) => {
            if (newObj.mid == 0 && m) {
                m = false;
                newObj.ErrorMes = newObj.ErrorMes + data;
                reply(ctx, "" + newObj.ErrorMes, 30);
            }
            else {
                newObj.ErrorMes = newObj.ErrorMes + data;
                ctx.telegram.editMessageText(ctx.chat.id, newObj.mid.message_id, undefined, newObj.ErrorMes)
                    .then(async (mmm) => {
                    await h.sleep(30000);
                    ctx.deleteMessage(mmm).catch(() => { });
                }).catch(() => { });
            }
            terminate(ctx, obj);
        });
        newObj.code = "";
        newObj.node.on("error", (err) => { console.error(err); terminate(ctx, obj); });
        newObj.node.on('close', function (statusCode) {
            if (statusCode == 0) {
                reply(ctx, 'Program terminated successfully');
            }
            else {
                reply(ctx, 'Program terminated unsuccessfully');
            }
            terminate(ctx, obj);
        });
        newObj.node.on('exit', (statusCode) => {
            if (statusCode != 0)
                console.error("Process exited with status code", statusCode);
        });
        return newObj.node;
    }
    catch (errr) {
        console.error(errr);
        reply(ctx, errr.message);
        terminate(ctx, obj);
    }
};
module.exports = jsyoyojs;
async function reply(ctx, mss, tim = 10) {
    return await ctx.reply(mss).then(async (mi) => {
        await h.sleep(tim * 1000);
        return await ctx.deleteMessage(mi.message_id).catch((err) => { });
    })
        .catch((err) => { });
}
let terminate = async (ctx, options = {}) => {
    let newObj = options[ctx.from.id];
    await h.sleep(200);
    if (ctx.scene)
        ctx.scene.leave();
    if (newObj && newObj.node) {
        newObj.node.stdin.end();
    }
    try {
        clearTimeout(newObj.timeid);
        if (newObj && newObj.node)
            newObj.node.removeAllListeners();
    }
    catch (error) {
    }
    console.log('terminating...');
    if (newObj && newObj.ctxemitter)
        newObj.ctxemitter.removeAllListeners();
    await h.sleep(10);
    options[ctx.from.id] = undefined;
};
