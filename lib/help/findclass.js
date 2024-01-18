"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const find = (javaCode) => {
    var _a, _b, _c;
    let lines = javaCode.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').split(/\r?\n/);
    const findMainFunction = (lines) => lines.find(line => line.includes('public static void main(String[]'));
    const mainIndex = lines.indexOf((_a = findMainFunction(lines)) !== null && _a !== void 0 ? _a : '');
    let mainClass = '';
    for (let i = mainIndex; i >= 0; i--) {
        if ((_b = lines[i]) === null || _b === void 0 ? void 0 : _b.includes('class')) {
            const match = (_c = lines[i]) === null || _c === void 0 ? void 0 : _c.match(/(class\s+)([A-Za-z0-9_]+)/);
            mainClass = match ? match[2] : '';
            break;
        }
    }
    return mainClass;
};
exports.default = find;
