"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const package_json_1 = __importDefault(require("../package.json"));
// Configure Your own bot free bot source code for helping students 
let ownerId = 1791106582;
let config = { ttl: 60 };
function configure(cnf) {
    config = cnf;
}
config.version = package_json_1.default.version;
config.versionNo = package_json_1.default.updateCount;
config.ttl = 60;
if (!config.startSymbol)
    config.startSymbol = "/";
if (!config.group)
    config.group = "@Logicb_support";
if (!config.channel)
    config.channel = "@LogicBots";
config.configure = configure;
exports.default = config;
