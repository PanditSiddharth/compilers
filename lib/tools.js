"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findClass = void 0;
const findClass = (javaCode) => {
    var _a, _b, _c;
    // remove all comments
    javaCode = javaCode.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "");
    let mainclass = "";
    let javaCodeArray = javaCode.split("class");
    for (const code of javaCodeArray) {
        const cd = code.trim();
        if (cd.includes("public") && cd.includes("static")) {
            // class name nikalna
            mainclass = ((_c = (_b = (_a = cd.split("{")) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.split(" ")[0]) === null || _c === void 0 ? void 0 : _c.trim()) || "Main";
            break;
        }
    }
    console.log(mainclass);
    return mainclass || "Main";
};
exports.findClass = findClass;
