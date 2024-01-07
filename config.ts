require("dotenv").config()

let env = require("./conf")

// Configure Your own bot free bot source code for helping students 

let ownerId = 1791106582
let config: Config = {
  codeLogs: -1001782169405, // chat id 
  chatLogs: -1001988408261, // chat id
  errorLogs: ownerId, // chat or persion id
  ownerId,
  admins: [ownerId, 1942730863, 1580821417, 1643271211],
  version: "3.0.0",
  versionNo: 23,
  ttl: 60,
  startSymbol: "/",
  owner: "", // You can give here your @username
  group: "@Logicb_support",
  channel: "@LogicBots",

  // set your bot token string in env
  token: process.env.TOKEN as string || env.token,

  // Write full path of these write here or in env vars
  python: process.env.PYTHON as string || env.python || "python3",
  java: process.env.JAVA as string || env.java || "java",
  javac: process.env.JAVAC as string || env.javac || "javac",
  go: process.env.GO as string || env.go || "go",
  node: process.env.NODE as string || env.node || "node"
}

export default config;





// Don't change these types
type Chatid = string | number
type UserId = string | number
type Username = string;
interface Config {
  codeLogs: Chatid;
  chatLogs: Chatid;
  errorLogs: UserId;
  ttl: number;
  ownerId: UserId;
  admins: UserId[];
  version: string;
  versionNo: number | string;
  startSymbol: string;
  owner: string;
  group: Username;
  channel: Username;
  token: string;
  python: string;
  java: string;
  javac: string;
  go: string;
  node: string;
}