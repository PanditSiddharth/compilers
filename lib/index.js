"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compiler = void 0;
const bot_1 = __importDefault(require("./bot"));
const helpers_1 = __importDefault(require("./helpers"));
const config_1 = __importDefault(require("./config"));
const real_1 = __importDefault(require("./help/real"));
let which = require("which");
let exes = {
    gcc: which.sync('gcc', { nothrow: true }),
    cpp: which.sync('g++', { nothrow: true }),
    node: which.sync('node', { nothrow: true }),
    go: which.sync('go', { nothrow: true }),
    java: which.sync('java', { nothrow: true }),
    javac: which.sync('javac', { nothrow: true }),
    python: which.sync('python', { nothrow: true }),
    python3: which.sync('python3', { nothrow: true })
};
// 2 global dependencies
const telegraf_1 = require("telegraf");
const starter_1 = __importDefault(require("./starter"));
let objj = {};
// this will run web server and always make it alive
// Helper class object where sleep function etc listed
let h = new helpers_1.default();
// global object for all updates
let func = {};
// Helper function which replace bot username if exists in command
function cmdd(ctx) {
    if (ctx.message && ctx.message.text) {
        ctx.message.text = ctx.message.text.replace(new RegExp("^\\" + config_1.default.startSymbol + "[a-zA-Z0-9]{2,9}@" + ctx.botInfo.username, 'i'), (match) => match.replace("@" + ctx.botInfo.username, ""));
    }
}
function compiler(token, conf = {}) {
    // Some default configurations
    conf.version = "3.0.0";
    conf.versionNo = 25;
    conf.ttl = 60;
    if (!conf.startSymbol)
        conf.startSymbol = "/";
    if (!conf.exes)
        if (!conf.group) {
            conf.exes = exes;
        }
    conf.group = "@Logicb_support";
    if (!conf.channel)
        conf.channel = "@LogicBots";
    config_1.default.configure(conf);
    // config.config = conf;
    // createEnvironment()
    // All scenes 
    let pyScene = new telegraf_1.Scenes.BaseScene("py");
    pyScene.enter(async (ctx) => {
        cmdd(ctx);
        if (await startcheck(ctx, 'py python'))
            return;
        await (0, starter_1.default)(bot, ctx, conf, { cmp: "py", exe: exes.python || exes.python3 });
    });
    pyScene.on("message", async (ctx) => {
        cmdd(ctx);
        if (await startcheck(ctx, 'py python'))
            return;
        await (0, starter_1.default)(bot, ctx, conf, { cmp: "py", exe: exes.python || exes.python3 });
    });
    let cppScene = new telegraf_1.Scenes.BaseScene("cpp");
    cppScene.enter(async (ctx) => {
        cmdd(ctx);
        if (await startcheck(ctx, 'cpp cplus'))
            return;
        await (0, starter_1.default)(bot, ctx, conf, { cmp: "cpp", exe: exes.cpp });
    });
    cppScene.on("message", async (ctx) => {
        cmdd(ctx);
        if (await startcheck(ctx, 'cpp cplus'))
            return;
        await (0, starter_1.default)(bot, ctx, conf, { cmp: "cpp", exe: exes.cpp });
    });
    let cScene = new telegraf_1.Scenes.BaseScene("code");
    cScene.enter(async (ctx) => {
        cmdd(ctx);
        if (await startcheck(ctx, 'cc code'))
            return;
        await (0, starter_1.default)(bot, ctx, conf, { cmp: "c", exe: exes.gcc });
    });
    cScene.on("message", async (ctx) => {
        cmdd(ctx);
        if (await startcheck(ctx, 'cc code'))
            return;
        await (0, starter_1.default)(bot, ctx, conf, { cmp: "c", exe: exes.gcc });
    });
    let jvScene = new telegraf_1.Scenes.BaseScene("jv");
    jvScene.enter(async (ctx) => {
        cmdd(ctx);
        if (await startcheck(ctx, 'jv java'))
            return;
        await (0, starter_1.default)(bot, ctx, conf, { cmp: "java", exe: exes.java });
    });
    jvScene.on("message", async (ctx) => {
        cmdd(ctx);
        if (await startcheck(ctx, 'jv java'))
            return;
        await (0, starter_1.default)(bot, ctx, conf, { cmp: "java", exe: exes.java });
    });
    let jsScene = new telegraf_1.Scenes.BaseScene("js");
    jsScene.enter(async (ctx) => {
        cmdd(ctx);
        if (await startcheck(ctx, 'js node sql'))
            return;
        await (0, starter_1.default)(bot, ctx, conf, { cmp: "js", exe: exes.node });
    });
    jsScene.on("message", async (ctx) => {
        cmdd(ctx);
        if (await startcheck(ctx, 'js node sql'))
            return;
        await (0, starter_1.default)(bot, ctx, conf, { cmp: "js", exe: exes.node });
    });
    let tsScene = new telegraf_1.Scenes.BaseScene("ts");
    tsScene.enter(async (ctx) => {
        cmdd(ctx);
        if (await startcheck(ctx, 'ts type'))
            return;
        await (0, starter_1.default)(bot, ctx, conf, { cmp: "ts", exe: exes.node });
    });
    tsScene.on("message", async (ctx) => {
        cmdd(ctx);
        if (await startcheck(ctx, 'ts type'))
            return;
        await (0, starter_1.default)(bot, ctx, conf, { cmp: "ts", exe: exes.node });
    });
    let goScene = new telegraf_1.Scenes.BaseScene("go");
    goScene.enter(async (ctx) => {
        cmdd(ctx);
        if (await startcheck(ctx, 'go'))
            return;
        await (0, starter_1.default)(bot, ctx, conf, { cmp: "go", exe: exes.go });
    });
    goScene.on("message", async (ctx) => {
        cmdd(ctx);
        await startcheck(ctx, 'go');
        await (0, starter_1.default)(bot, ctx, conf, { cmp: "go", exe: exes.go });
    });
    // making instance of Telegraf class
    let bot = new telegraf_1.Telegraf(token, (conf.telegram && typeof conf.telegram == "object") ? conf.telegram : {});
    // regestering all scenes
    let stage = new telegraf_1.Scenes.Stage([cScene, pyScene, jsScene, cppScene, jvScene, goScene, tsScene], { ttl: config_1.default.ttl });
    // passing bot instance in bot.ts file by call those function
    (0, bot_1.default)(bot);
    (0, real_1.default)(bot);
    // Some global telegraf uses for help
    bot.use((0, telegraf_1.session)());
    bot.use(stage.middleware());
    // Main Program starts from here it listens /js /py all commands and codes 
    bot.hears(new RegExp("^\\" + config_1.default.startSymbol + "(code|start|py|python|ts|type|js|node|cc|cpp|cplus|sql|go|jv|java|c\\+\\+)|\\/start", "i"), async (ctx, next) => {
        try {
            if (conf.allowed) {
                let allowedStr = conf.allowed.join(" ");
                if (!allowedStr.match(ctx.from.id))
                    return ctx.reply("You are not allowed ask @LogicB_support");
            }
            let compiler = ctx.message.text + "";
            let memb = await ctx.getChatMember(ctx.botInfo.id);
            if (!memb.can_delete_messages) {
                if ((ctx.chat.id + "").startsWith("-100"))
                    return ctx.reply('I must be admin with delete message permission');
            }
            function cmp(a) {
                return (new RegExp("^\\" + config_1.default.startSymbol + a, "i")).test(compiler);
            }
            if (compiler.startsWith("/start") && objj.hasOwnProperty("" + ctx.message.from.id)) {
                let kkk = objj["" + ctx.message.from.id];
                ctx.message.text = kkk.text;
                return ctx.scene.enter(kkk.cmp);
            }
            if (cmp("py|python")) {
                if (exes.python3 || exes.python)
                    ctx.scene.enter("py");
                else
                    ctx.reply("No python compiler exists in system").catch((err) => console.error(err));
            }
            else if (cmp("cc|code")) {
                if (exes.gcc)
                    ctx.scene.enter("code");
                else
                    ctx.reply("No gcc compiler exists in system").catch((err) => console.error(err));
            }
            else if (cmp("js|node|sql")) {
                if (exes.node)
                    ctx.scene.enter("js");
                else
                    ctx.reply("No nodejs compiler exists in system").catch((err) => console.error(err));
            }
            else if (cmp("ts|type")) {
                if (exes.node)
                    ctx.scene.enter("ts");
                else
                    ctx.reply("No node exists in system").catch((err) => console.error(err));
            }
            else if (cmp("cpp|cplus")) {
                if (exes.cpp)
                    ctx.scene.enter("cpp");
                else
                    ctx.reply("No g++ compiler exists in system").catch((err) => console.error(err));
            }
            else if (cmp("jv|java")) {
                if (exes.java || exes.javac)
                    ctx.scene.enter("jv");
                else
                    ctx.reply("No java compiler exists in system").catch((err) => console.error(err));
            }
            else if (cmp("go")) {
                if (exes.go)
                    ctx.scene.enter("go");
                else
                    ctx.reply("No go compiler exists in system").catch((err) => console.error(err));
            }
            // next();
        }
        catch (error) {
            console.error("Error in index.ts file starting problem");
        }
    });
    // This function checks that if any compiler command change then it changes session; Example : js to py
    async function startcheck(ctx, y, json = {}) {
        try {
            if (!ctx.message.text.startsWith(config_1.default.startSymbol))
                return false;
            function cmp(a) {
                return (new RegExp("^\\" + config_1.default.startSymbol + a, "i")).test(ctx.message.text);
            }
            let cmd = ctx.message.text.match(new RegExp("^\\" + config_1.default.startSymbol + "[a-zA-Z0-9]{2,9}", 'i'));
            if (!cmd)
                return false;
            let cst = cmd[0].replace(config_1.default.startSymbol, "");
            cst = cst.toLowerCase();
            if (y.includes(cst)) {
                return false;
            }
            if (("py python").includes(cst)) {
                ctx.scene.enter("py");
                return true;
            }
            else if (("cc code").includes(cst)) {
                ctx.scene.enter("code");
                return true;
            }
            else if (("js node sql").includes(cst)) {
                ctx.scene.enter("js");
                return true;
            }
            else if (("ts type").includes(cst)) {
                ctx.reply("Excecuting typescript code..")
                    .then(async (m) => { await h.sleep(3000); return m.message_id; })
                    .then((m) => { ctx.deleteMessage(m); })
                    .catch((err) => { });
                await h.sleep(300);
                ctx.scene.enter("ts");
                return true;
            }
            else if (("cpp cplus").includes(cst)) {
                ctx.scene.enter("cpp");
                return true;
            }
            else if (("jv java").includes(cst)) {
                ctx.scene.enter("jv");
                return true;
            }
            else if (("go").includes(cst)) {
                ctx.scene.enter("go");
                return true;
            }
            return false;
        }
        catch (error) {
            return false;
        }
    }
    return { bot, config: config_1.default };
}
exports.compiler = compiler;
