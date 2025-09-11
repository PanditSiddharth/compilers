"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compiler = compiler;
const bot_1 = __importDefault(require("./bot"));
const helpers_1 = __importDefault(require("./helpers"));
const config_1 = __importDefault(require("./config"));
const real_1 = __importDefault(require("./help/real"));
const scenes_1 = require("./scenes");
// 2 global dependencies
const telegraf_1 = require("telegraf");
const mode_check_1 = require("./mode-check");
// Helper class object where sleep function etc listed
let h = new helpers_1.default();
function compiler(telegrafBotByUser) {
    var _a;
    (0, mode_check_1.modeCheck)(config_1.default.mode, config_1.default.allowed);
    let bot = typeof telegrafBotByUser == "string" ?
        new telegraf_1.Telegraf(telegrafBotByUser)
        : telegrafBotByUser;
    // regestering all scenes
    let stage = new telegraf_1.Scenes.Stage(scenes_1.scenes, { ttl: config_1.default.ttl });
    (0, bot_1.default)(bot);
    (0, real_1.default)(bot);
    // Some global telegraf uses for help
    bot.use((0, telegraf_1.session)());
    bot.use(stage.middleware());
    // Main Program starts from here it listens /js /py all commands and codes 
    bot.hears(new RegExp(`^${(config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.startSymbol) + ((_a = config_1.default.commands) === null || _a === void 0 ? void 0 : _a.join("|"))}`, "i"), async (ctx, next) => {
        var _a, _b, _c, _d;
        try {
            if (["private", "docker-private"].includes(config_1.default.mode)
                && (!((_a = config_1.default.allowed) === null || _a === void 0 ? void 0 : _a.includes(+ctx.from.id)) || !((_c = (_b = config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.root) === null || _b === void 0 ? void 0 : _b.allowed) === null || _c === void 0 ? void 0 : _c.includes(+ctx.from.id))))
                return ctx.reply("You are not allowed ask " + config_1.default.group);
            let groupUser = await ctx.getChatMember(ctx.botInfo.id);
            if (!groupUser.can_delete_messages) {
                if ((ctx.chat.id + "").startsWith("-100"))
                    return ctx.reply('I must be admin with delete message permission');
            }
            const getCommand = () => { var _a, _b; return (_b = (_a = ctx === null || ctx === void 0 ? void 0 : ctx.message) === null || _a === void 0 ? void 0 : _a.text) === null || _b === void 0 ? void 0 : _b.match(new RegExp(`^${config_1.default.startSymbol}([a-zA-Z]{2,4})`, "i")); };
            if (getCommand && ((_d = getCommand()) === null || _d === void 0 ? void 0 : _d[1]))
                ctx.scene.enter(getCommand()[1]);
        }
        catch (error) {
            ctx.reply(error.message);
            console.error("Error in index.ts file starting problem", error.message);
        }
    });
    return { bot, conf: config_1.default };
}
