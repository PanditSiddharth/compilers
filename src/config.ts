import * as tp from "./interfaces";
import pjson from "../package.json";
import which from "which"
function safeRequire(configFile: string) {
  try {
    return require(`${process.cwd()}/${configFile}`);
  } catch (error) {
      return undefined; // Return undefined if the module/file is not found
  }
}

const userConfig = safeRequire("ioconfig.json")
console.log(userConfig)
let config: tp.Config = { ttl: 60, commands:[ "py", "js", "cc", "cpp", "jv", "ts", "go", "rs", "sh", "root"]};

let exe = (s:string) => {
try {
  return which.sync(s, { nothrow: true })
} catch (error) {
  return null;
}
}

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
  root: exe(userConfig?.root?.shell || "bash") || exe('sh'),
  ps: exe('pwsh') || exe('powershell')
}

if(userConfig){
  config = {...config,...userConfig, exes}
}
  // Some default configurations
  config.version = pjson.version;
  if (!config.ttl)
    config.ttl = 60;

  if (!config.startSymbol)
    config.startSymbol = "/"
  
  config.group = "@Logicb_support";

  if (!config.channel)
    config.channel = "@LogicBots";

  if (!config.mode)
    config.mode = "private";

  if (!config.allowed)
    config.allowed = [] as string[];
  config.commands = [ "py", "js", "cc", "cpp", "jv", "ts", "go", "rs", "sh", userConfig?.root?.command || "root"]
export default config;





