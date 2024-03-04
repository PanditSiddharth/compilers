"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = __importDefault(require("./helpers"));
const config_1 = __importDefault(require("./config"));
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
let which = require("which");
const path_1 = __importDefault(require("path"));
const findclass_1 = __importDefault(require("./help/findclass"));
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
                newObj.editedMes += tempdata.toString().replace("\\", "\\\\");
                if (repeats > 5 || looperr)
                    return;
                if (newObj.mid == 0) {
                    let replyString = "" + newObj.editedMes + " ```";
                    newObj.mid = await ctx.reply(replyString, { parse_mode: "MarkdownV2" })
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
        };
        if (newObj.status == "input") {
            return await newObj.ctxemitter.emit('ctx', await (ctx));
        }
        obj[ctx.from.id].status = "input";
        jsout('-1a\n');
        newObj.countpp = countp(newObj.code);
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
        /**
         * For python language
         */
        if (newObj.cmp == "py") {
            newObj.code = newObj.code.replace(/^(\s*)(pt)(.*)/gim, '$1print($3);');
            newObj.node = (0, child_process_1.spawn)(newObj.exe, ['-c', newObj.code], config_1.default.spawnOptions || { env: {} });
        }
        /**
         * Some mid things in c/cpp and go compiler
         */
        else if (/c|cpp|go/.test(newObj.cmp)) {
            // newObj.root = path.join('.', 'files', `${newObj.cmp}${newObj.fromId}`);
            newObj.root = path_1.default.join(require('os').tmpdir(), `${newObj.cmp}${newObj.fromId}`);
            newObj.filePath = path_1.default.join(newObj.root, `main.${newObj.cmp}`);
            try {
                if (!fs_1.default.existsSync(newObj.root))
                    fs_1.default.mkdirSync(newObj.root);
            }
            catch (err) {
                // Handle file writing error
                console.error(err);
                return terminate(ctx, obj);
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
                    .replace(/(int\s+main\s*\([\s\S]*\)\s*\{)/, "$1 setbuf(stdout, NULL);");
                try {
                    fs_1.default.writeFileSync(newObj.filePath, newObj.code);
                }
                catch (err) {
                    // Handle file writing error
                    console.error(err);
                    return terminate(ctx, obj);
                }
                let cexefile = path_1.default.join(newObj.root, "main");
                const gccArgs = [
                    '-I', path_1.default.join(__dirname, 'lib'),
                    '-o', cexefile, newObj.filePath,
                    path_1.default.join(__dirname, 'lib', 'conio.c'),
                    '-lm'
                ];
                const { status, stderr } = (0, child_process_1.spawnSync)(newObj.exe, gccArgs);
                if (status !== 0) {
                    terminate(ctx, obj);
                    reply(ctx, stderr.toString().replace(new RegExp(newObj.filePath, 'g'), 'See'));
                    return ctx.scene.leave();
                }
                newObj.node = (0, child_process_1.spawn)(cexefile, [], config_1.default.spawnOptions || { env: {} });
            }
            /**
             * For c++ code
             */
            else if (newObj.cmp == "cpp") {
                newObj.code = newObj.code.replace(/"start"/gi, "#include <iostream>\nusing namespace std;\nint main(){\n")
                    .replace(/"end"/gi, "\nreturn 0;\n}")
                    .replace(/(^\s*pt)(.*)/gim, "cout<<$2;");
                let cppexefile = path_1.default.join(newObj.root, `main.out`);
                try {
                    fs_1.default.writeFileSync(newObj.filePath, newObj.code);
                }
                catch (err) {
                    // Handle file writing error
                    console.error(err);
                    return terminate(ctx, obj);
                }
                const gppArgs = [
                    '-o', cppexefile,
                    newObj.filePath
                ];
                const { status, stderr } = (0, child_process_1.spawnSync)(newObj.exe, gppArgs);
                if (status !== 0) {
                    terminate(ctx, obj);
                    return reply(ctx, stderr.toString());
                }
                newObj.node = (0, child_process_1.spawn)(cppexefile, [], newObj.conf.spawnOptions || { env: {} });
            }
            /**
             * For go language
             */
            else if (newObj.cmp == "go") {
                newObj.code = newObj.code.replace(/^(\s*)(pt)(.*)/gim, '$1fmt.Println!($3);');
                try {
                    fs_1.default.writeFileSync(newObj.filePath, newObj.code);
                }
                catch (err) {
                    // Handle file writing error
                    console.error(err);
                    return terminate(ctx, obj);
                }
                newObj.node = (0, child_process_1.spawn)(newObj.exe, ['run', newObj.filePath], newObj.conf.spawnOptions || {
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
            newObj.countpp = countp(newObj.code);
            newObj.code = newObj.code.replace(/(^\s*pt)(.*)/gim, 'console.log($2);');
            if (newObj.cmp.includes("ts"))
                newObj.node = (0, child_process_1.spawn)(path_1.default.join('.', 'node_modules', '.bin', 'tsx'), ['-e', newObj.code], newObj.conf.spawnOptions || {
                    env: {
                        PATH: path_1.default.dirname(newObj.exe)
                    }
                });
            else
                newObj.node = (0, child_process_1.spawn)(newObj.exe, ['-e', newObj.code], newObj.conf.spawnOptions ||
                    { env: {} });
        }
        /**
         * For java language
         */
        else if (newObj.cmp == "java") {
            newObj.code = newObj.code.replace(/"start"/gi, 'public class Main {\npublic static void main(String[] args){')
                .replace(/"end"/gi, '\t}\n}')
                .replace(/(^\s*pt)(.*)/gim, 'System.out.println($2);');
            // const regex = /(?<=class\s*)\w+(?=\s*\{?\s*[\n\s]{0,3}public\s*static\s*void\s*main)/g;
            const found = (0, findclass_1.default)(newObj.code);
            if (found) {
                newObj.javaFile = found;
            }
            else {
                terminate(ctx, obj);
                ctx.reply('No main class found ask @LogicB_support why this error.').catch((err) => { });
                return ctx.scene.leave();
            }
            // newObj.root = path.join('.', 'files', `${newObj.cmp}${newObj.fromId}`);
            newObj.root = path_1.default.join(require('os').tmpdir(), `${newObj.cmp}${newObj.fromId}`);
            newObj.filePath = path_1.default.join(newObj.root, `${newObj.javaFile}.${newObj.cmp}`);
            try {
                fs_1.default.mkdirSync(newObj.root);
                fs_1.default.writeFileSync(newObj.filePath, newObj.code);
            }
            catch (err) {
                // Handle file writing error
                console.error(err);
                return terminate(ctx, obj);
            }
            const { status, stderr } = (0, child_process_1.spawnSync)(which.sync('javac', { nothrow: true }), [newObj.filePath]);
            if (status !== 0) {
                terminate(ctx, obj);
                reply(ctx, stderr.toString());
                return ctx.scene.leave();
            }
            newObj.node = (0, child_process_1.spawn)(newObj.exe, ['-cp', newObj.root, newObj.javaFile], config_1.default.spawnOptions || { env: {} });
        }
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
