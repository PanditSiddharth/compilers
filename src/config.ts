import * as tp from "./interfaces";

// Configure Your own bot free bot source code for helping students 
let ownerId = 1791106582

let config: tp.Config = { ttl: 60};

function configure(cnf: tp.Config) {
  config = cnf;
}
config.version = "2.0.0"
config.versionNo = 23
config.ttl = 60;

if(!config.startSymbol)
config.startSymbol = "/"
if(!config.group)
config.group = "@Logicb_support";
if(!config.channel)
config.channel = "@LogicBots";
config.configure = configure;
export default config;





