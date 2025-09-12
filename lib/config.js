"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const package_json_1 = __importDefault(require("../package.json"));
const which_1 = __importDefault(require("which"));
function safeRequire(configFile) {
    try {
        return require(`${process.cwd()}/${configFile}`);
    }
    catch (error) {
        return undefined; // Return undefined if the module/file is not found
    }
}
const userConfig = safeRequire("ioconfig.json");
console.log(userConfig);
let config = { ttl: 60, commands: ["py", "js", "cc", "cpp", "jv", "ts", "go", "rs", "sh", "root"] };
let exe = (s) => {
    try {
        return which_1.default.sync(s, { nothrow: true });
    }
    catch (error) {
        return null;
    }
};
const exes = {
    js: exe('node'),
    ts: exe('tsc'),
    py: exe('python3') || exe('python'),
    cc: exe('gcc'),
    cpp: exe('g++'),
    jv: exe('java'),
    go: exe('go'),
    rs: exe('rustc'),
    sh: exe('bash') || exe('sh'),
    root: exe(((_a = userConfig.root) === null || _a === void 0 ? void 0 : _a.shell) || "bash") || exe('sh'),
    ps: exe('pwsh') || exe('powershell')
};
if (userConfig) {
    config = { ...config, ...userConfig, exes };
}
// Some default configurations
config.version = package_json_1.default.version;
if (!config.ttl)
    config.ttl = 60;
if (!config.startSymbol)
    config.startSymbol = "/";
config.group = "@Logicb_support";
if (!config.channel)
    config.channel = "@LogicBots";
if (!config.mode)
    config.mode = "private";
if (!config.allowed)
    config.allowed = [];
config.commands = ["py", "js", "cc", "cpp", "jv", "ts", "go", "rs", "sh", ((_b = userConfig === null || userConfig === void 0 ? void 0 : userConfig.root) === null || _b === void 0 ? void 0 : _b.command) || "root"];
exports.default = config;
