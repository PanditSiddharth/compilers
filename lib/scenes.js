"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.scenes = void 0;
// 2 global dependencies
const telegraf_1 = require("telegraf");
const starter_1 = __importDefault(require("./starter"));
const config_1 = __importDefault(require("./config"));
const helpers_1 = __importDefault(require("./helpers"));
const h = new helpers_1.default();
/**
 * Cleans up bot commands by removing the bot's username from the command text.
 * @param ctx - The Telegraf context.
 */
function cleanCommand(ctx) {
    var _a;
    (_a = ctx.message).text && (_a.text = ctx.message.text.replace(new RegExp(`^\\${config_1.default.startSymbol}[a-zA-Z0-9]{2,9}@${ctx.botInfo.username}`, "i"), (match) => match.replace(`@${ctx.botInfo.username}`, "")));
}
// This function checks that if any compiler command change then it changes session; Example : js to py
function startcheck(ctx, y, json = {}) {
    var _a;
    try {
        if (!ctx.message.text.startsWith(config_1.default.startSymbol))
            return false;
        let cmd = ctx.message.text.match(new RegExp("^\\" + config_1.default.startSymbol + "[a-zA-Z0-9]{2,9}", 'i'));
        if (!cmd)
            return false;
        let cst = cmd[0].replace(config_1.default.startSymbol, "").toLowerCase();
        if (y.includes(cst)) {
            return false;
        }
        if ((_a = config_1.default.commands) === null || _a === void 0 ? void 0 : _a.includes(cst)) {
            ctx.scene.enter(cst);
            return true;
        }
        return false;
    }
    catch (error) {
        return false;
    }
}
const createScene = (sceneName) => {
    const scene = new telegraf_1.Scenes.BaseScene(sceneName);
    scene.enter(async (ctx) => {
        var _a;
        if (startcheck(ctx, sceneName))
            return;
        await (0, starter_1.default)(ctx, { cmp: sceneName, exe: (_a = config_1.default.exes) === null || _a === void 0 ? void 0 : _a[sceneName] });
    });
    scene.on("message", async (ctx) => {
        var _a;
        if (startcheck(ctx, sceneName))
            return;
        await (0, starter_1.default)(ctx, { cmp: sceneName, exe: (_a = config_1.default.exes) === null || _a === void 0 ? void 0 : _a[sceneName] });
    });
    return scene;
};
/**
 * Generates an array of scenes based on configured commands.
 */
exports.scenes = ((_a = config_1.default.commands) === null || _a === void 0 ? void 0 : _a.map(createScene)) || [];
