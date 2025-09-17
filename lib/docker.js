"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = __importDefault(require("./helpers"));
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
let which = require("which");
const tools_1 = require("./tools");
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
let cmplr = async (ctx, obj = {}) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
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
        async function sendToTelegramCore() {
            if (newObj.mid == 0) {
                if (newObj.editedMes.length > 4020)
                    newObj.editedMes = newObj.editedMes.substring(0, 4020) + "....";
                let replyString = "" + newObj.editedMes + " ```";
                newObj.mid = await ctx.reply(replyString, {
                    parse_mode: "MarkdownV2",
                    reply_parameters: (newObj.inReply ? { message_id: newObj.inReply } : undefined)
                })
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
        async function sendToTelegram(tempdata) {
            var _a;
            newObj.editedMes += (_a = tempdata.toString()) === null || _a === void 0 ? void 0 : _a.replace("\\", "\\\\");
            if (newObj.mid == 0 && newObj.preTime == "undefined" || newObj.preTime && newObj.preTime + 350 < Date.now()) {
                newObj.preTime = Date.now();
                delete newObj.timeOutId;
                await sendToTelegramCore();
            }
            else {
                newObj.preTime = Date.now();
                if (newObj.timeOutId == "undefined") {
                    newObj.timeOutId = setTimeout(sendToTelegramCore, 350);
                }
                else {
                    clearTimeout(newObj.timeOutId);
                    newObj.timeOutId = setTimeout(sendToTelegramCore, 300);
                }
            }
        }
        async function messageFromUser() {
            let connt = 0;
            newObj.ctxemitter.on('ctx', async (ctxx) => {
                ctxx.deleteMessage().catch(() => { });
                try {
                    newObj.editedMes += ctxx.message.text.replace("\\", "\\\\") + "\n";
                    if (newObj.mid == 0)
                        newObj.mid = await ctx.reply("" + newObj.editedMes + " ```", { parse_mode: "MarkdownV2" });
                    else
                        await edit(newObj.mid.message_id, newObj.editedMes);
                    await newObj.node.stdin.write(ctxx.message.text.replace("\\", "\\\\") + "\n");
                    connt++;
                    if (/js|ts/.test(newObj.cmp) && connt >= newObj.countpp) {
                        newObj.node.stdin.end();
                    }
                }
                catch (err) {
                    console.error(err);
                }
            });
        }
        if (newObj.status == "input") {
            return await newObj.ctxemitter.emit('ctx', await (ctx));
        }
        newObj.first = true;
        obj[ctx.from.id].status = "input";
        messageFromUser();
        newObj.countpp = countp(newObj.code);
        newObj.code = newObj.code.replace(/\u00A0/mg, ' ');
        if (newObj.code.startsWith("-r") && ctx.message.reply_to_message) {
            newObj.code = (_a = newObj.code.replace(/^\-r/, "")) === null || _a === void 0 ? void 0 : _a.trim();
            newObj.inReply = ctx.message.reply_to_message.message_id;
        }
        else if (newObj.code.startsWith("-r")) {
            ctx.reply("-r flag only works when you send command with code in reply to any message");
            return await terminate(ctx, obj);
        }
        let ttl = ctx.scene.options.ttl;
        newObj.fromId = ctx.message.from.id;
        newObj.timeid = setTimeout(() => {
            newObj.code = false;
            if (newObj && newObj.node) {
                ctx.reply("Timout: " + ttl + " Seconds");
                return terminate(ctx, obj);
            }
        }, ttl * 1000);
        const commands = {
            "py": ["run", "-i", "--rm", "--memory=128m", "--cpus=0.5", "python:3.9-slim", "python3", "-uc", newObj.code],
            "js": ["run", "-i", "--rm", "--memory=128m", "--cpus=0.5", "node:23.4-slim", "node", "-e", newObj.code],
            "sh": ["run", "-i", "--rm", "--memory=128m", "--cpus=0.5", "ubuntu:24.10", "bash", '-c', newObj.code],
            "jv": ["run", "-i", "--rm", "--memory=128m", "--cpus=0.5", "openjdk:25-slim", "sh", "-c",
                `echo "${(_b = newObj === null || newObj === void 0 ? void 0 : newObj.code) === null || _b === void 0 ? void 0 : _b.replace(/"/g, '\\"')}" > ${(0, tools_1.findClass)(newObj.code)}.java && javac ${(0, tools_1.findClass)(newObj.code)}.java && java ${(0, tools_1.findClass)(newObj.code)}`
            ],
            "cc": ["run", "-i", "--rm", "--memory=128m", "--cpus=0.5", "gcc:14.3.0-trixie", "bash", "-c",
                `echo "${(_c = newObj === null || newObj === void 0 ? void 0 : newObj.code) === null || _c === void 0 ? void 0 : _c.replace(/"/g, '\\"')}" > main.c && gcc main.c -o main && stdbuf -o0 ./main`],
            "cpp": ["run", "-i", "--rm", "gcc:14.3.0-trixie", "bash", "-c",
                `echo "${(_d = newObj === null || newObj === void 0 ? void 0 : newObj.code) === null || _d === void 0 ? void 0 : _d.replace(/"/g, '\\"')}" > main.cpp && g++ main.cpp -o main && stdbuf -o0 ./main`],
            "rs": ["run", "-i", "--rm", "rust:1.83-slim", "bash", "-c",
                `echo "${(_e = newObj === null || newObj === void 0 ? void 0 : newObj.code) === null || _e === void 0 ? void 0 : _e.replace(/"/g, '\\"')}" > main.rs && rustc main.rs && ./main`],
            "go": ["run", "-i", "--rm", "golang:tip-alpine3.22", "sh", "-c",
                `echo "${(_f = newObj === null || newObj === void 0 ? void 0 : newObj.code) === null || _f === void 0 ? void 0 : _f.replace(/"/g, '\\"')}" > main.go && go build -o main main.go && ./main`
            ],
            "ts": ["run", "-i", "--rm", "mcr.microsoft.com/devcontainers/typescript-node:22", "bash", "-c",
                `echo "${(_g = newObj === null || newObj === void 0 ? void 0 : newObj.code) === null || _g === void 0 ? void 0 : _g.replace(/"/g, '\\"')}" > main.ts && tsc main.ts && node main.js`
            ],
        };
        if (!Object.keys(commands).includes(newObj.cmp)) {
            reply(ctx, "Invalid command: " + newObj.cmp, "\nAvailable commands: " + Object.keys(commands).join(", "));
            return terminate(ctx);
        }
        newObj.node = (0, child_process_1.spawn)("docker", commands[newObj.cmp]);
        (_h = newObj.node) === null || _h === void 0 ? void 0 : _h.setMaxListeners(0);
        newObj.node.stdout.on('data', sendToTelegram);
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
                reply(ctx, "Process exited with status code", statusCode);
            console.error("Process exited with status code", statusCode);
            terminate(ctx, obj);
        });
        return newObj.node;
    }
    catch (errr) {
        console.error(errr);
        reply(ctx, errr.message);
        terminate(ctx, obj);
    }
};
module.exports = cmplr;
async function reply(ctx, mss, tim = 10) {
    return await ctx.reply(mss).then(async (mi) => {
        await h.sleep(tim * 1000);
        return await ctx.deleteMessage(mi.message_id).catch((err) => { });
    })
        .catch((err) => { });
}
let terminate = async (ctx, options = {}) => {
    let newObj = options[ctx.from.id];
    if (newObj === null || newObj === void 0 ? void 0 : newObj.ok)
        return;
    if (!newObj)
        return;
    newObj.ok = true;
    if (newObj.conf.onEnd && typeof newObj.conf.onEnd == "function") {
        let end = newObj.conf.onEnd;
        if (end.length == 1) {
            await end(ctx);
        }
        else {
            await end(ctx, options);
        }
    }
    newObj.terminated = true;
    await h.sleep(options.sleepTime || 1000);
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
    try {
        if (fs_1.default.existsSync(newObj.root)) {
            fs_1.default.rmSync(newObj.root, { recursive: true });
        }
    }
    catch (err) { }
    if (newObj && newObj.ctxemitter)
        newObj.ctxemitter.removeAllListeners();
    await h.sleep(100);
    options[ctx.from.id] = undefined;
};
