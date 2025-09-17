"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jcmp = exports.jAdmin = exports.jReal = exports.jUtil = exports.hUtil = exports.hAdmin = exports.hcmp = exports.version = void 0;
const config_1 = __importDefault(require("./config"));
exports.version = `𝐕𝐞𝐫𝐬𝐢𝐨𝐧: ${config_1.default.version}\n`;
exports.hcmp = `=========================
Compilation commands
=========================

${config_1.default.startSymbol}cc for c
${config_1.default.startSymbol}py for python code
${config_1.default.startSymbol}js for node js code
${config_1.default.startSymbol}cpp fro c++ code
${config_1.default.startSymbol}jv for java code 
${config_1.default.startSymbol}rs for rust code
${config_1.default.startSymbol}go for golang
${config_1.default.startSymbol}ts for typescript code
${config_1.default.startSymbol}sql for sql code
${config_1.default.startSymbol}sh for shell script (bash)
${config_1.default.startSymbol}ps for powershell

`;
exports.hAdmin = `=========================
Bot admin commands
=========================

${config_1.default.startSymbol}chats in which bot joined
${config_1.default.startSymbol}count chats count
${config_1.default.startSymbol}inf info of chat id with link
${config_1.default.startSymbol}sendTask broadcast message
${config_1.default.startSymbol}sendto send to any chat by bot
`;
exports.hUtil = `=========================
Control and info commands
=========================

${config_1.default.startSymbol}leave to stop excecution
${config_1.default.startSymbol}ping to see bot's running status
${config_1.default.startSymbol}version to see version and features
${config_1.default.startSymbol}start for basic info
@help for this help list

${config_1.default.channel + " " + config_1.default.group}
${config_1.default.owner ? "Owner: " + config_1.default.owner : "𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫: @PanditSiddharth"}
`;
function ob(text, action) {
    return { text, callback_data: JSON.stringify({ ok: "help", action }) };
}
exports.jUtil = {
    reply_markup: {
        inline_keyboard: [[ob("Admin", "admin"), ob("Compiler", "cmp")], [
                ob("Close", "close")
            ]]
    }
};
exports.jReal = {
    reply_markup: {
        inline_keyboard: [[ob("Admin", "admin"), ob("Compiler", "cmp"), ob("Utility", "util")], [
                ob("Close", "close")
            ]]
    }
};
exports.jAdmin = {
    reply_markup: {
        inline_keyboard: [[ob("Utility", "util"), ob("Compiler", "cmp")], [
                ob("Close", "close")
            ]]
    }
};
exports.jcmp = {
    reply_markup: {
        inline_keyboard: [[ob("Utility", "util"), ob("Admin", "admin")], [
                ob("Close", "close")
            ]]
    }
};
