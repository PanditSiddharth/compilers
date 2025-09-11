"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modeCheck = void 0;
let which = require("which");
const modeCheck = (mode, array = []) => {
    if (mode === "private" && array.length == 0) {
        console.error("\x1b[31mIn private mode you must provide allowed user's telegram id\nExample: compiler('bot token', {mode: 'private', allowed: ['your tg id']})\x1b[0m");
        process.exit(1);
    }
    if (mode === "public" && array.length != 0) {
        if (which.sync('docker', { nothrow: true })) {
            console.warn("\x1b[33mWarning: Your are in public mode\x1b[0m");
        }
        else {
            console.error("\x1b[31mWarning: Docker is not installed on this system. Please install Docker first or use private mode\x1b[0m");
            process.exit(1);
        }
    }
    if (mode == "api-mode" && array.length != 0) {
        console.error("\x1b[31mApi mode is not supported now please use private or public or docker-private modes\x1b[0m");
        process.exit(1);
    }
    if (mode == "docker-private" || mode == "public") {
        if (!which.sync('docker', { nothrow: true }))
            throw new Error("Docker is not installed on this system. Please install Docker first or use private mode");
    }
};
exports.modeCheck = modeCheck;
