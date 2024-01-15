"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Hlp {
    constructor() {
        this.readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    input(question) {
        return new Promise((resolve) => {
            this.readline.question(question, resolve);
        });
    }
}
exports.default = Hlp;
