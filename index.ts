import keep_alive from './keep_alive'
import fs from 'fs';
import bt from './bot';
import pyStarter from './starters/pystarter'
import cStarter from './starters/cstarter'
import jsStarter from './starters/jsstarter'
import tsStarter from './starters/tsstarter'
import cppStarter from './starters/cppstarter'
import jvStarter from './starters/jvstarter'
import goStarter from './starters/gostarter'
import config from './config'
require("dotenv").config()
// let c = require('./compilers/c');

keep_alive()
import Hlp from './helpers';
// let py = require('./compilers/py');
let h = new Hlp()
import { Scenes, session, Telegraf } from "telegraf";
require('dotenv').config()
// Handler factories ha
const { enter, leave } = Scenes.Stage;
let func: any = {};

function cmdd(ctx:any){
    ctx.message.text = ctx.message.text.replace(new RegExp("^\\"+ config.startSymbol + "[a-zA-Z0-9]{2,9}@" + ctx.botInfo.username, 'i'), 
  (match: any) => match.replace("@" + ctx.botInfo.username, ""))
}


let pyScene = new Scenes.BaseScene<Scenes.SceneContext>("py");
pyScene.enter(async (ctx: any) => { 
  cmdd(ctx);
  if(await startcheck(ctx, 'py python')) 
    return;
  await pyStarter(bot, ctx) });

pyScene.on("message", async (ctx: any) => { 
  cmdd(ctx);
  if(await startcheck(ctx, 'py python')) return;
  await pyStarter(bot, ctx) });

let cppScene = new Scenes.BaseScene<Scenes.SceneContext>("cpp");

cppScene.enter(async (ctx: any) => { 
  cmdd(ctx)
  if(await startcheck(ctx, 'cpp cplus')) return;
    
  await cppStarter(bot, ctx) });

cppScene.on("message", async (ctx: any) => { 
   cmdd(ctx)
    if(await startcheck(ctx, 'cpp cplus')) return;
  await cppStarter(bot, ctx) });

let cScene = new Scenes.BaseScene<Scenes.SceneContext>("code");
cScene.enter(async (ctx: any) => { 
   cmdd(ctx)
    if(await startcheck(ctx, 'cc code')) return;
  await cStarter(bot, ctx); });

cScene.on("message", async (ctx: any) => { 
   cmdd(ctx)
     if(await startcheck(ctx, 'cc code')) return;
  await cStarter(bot, ctx) });

let jvScene = new Scenes.BaseScene<Scenes.SceneContext>("jv");
jvScene.enter(async (ctx: any) => { 
   cmdd(ctx)
     if(await startcheck(ctx, 'jv java')) return;
  await jvStarter(bot, ctx) });

jvScene.on("message", async (ctx: any) => { 
   cmdd(ctx)
    if(await startcheck(ctx, 'jv java')) return;
  await jvStarter(bot, ctx) });

let jsScene = new Scenes.BaseScene<Scenes.SceneContext>("js");
jsScene.enter(async (ctx: any) => { 
   cmdd(ctx)
    if(await startcheck(ctx, 'js node')) return;
  await jsStarter(bot, ctx) });

jsScene.on("message", async (ctx: any) => { 
   cmdd(ctx)
    if(await startcheck(ctx, 'js node')) return;
  await jsStarter(bot, ctx) });

let tsScene = new Scenes.BaseScene<Scenes.SceneContext>("ts");
tsScene.enter(async (ctx: any) => { 
   cmdd(ctx)
    if(await startcheck(ctx, 'ts type')) return;
  await tsStarter(bot, ctx) });

tsScene.on("message", async (ctx: any) => { 
   cmdd(ctx)
    if(await startcheck(ctx, 'ts type')) return;
  await tsStarter(bot, ctx) });

let goScene = new Scenes.BaseScene<Scenes.SceneContext>("go");
goScene.enter(async (ctx: any) => { 
   cmdd(ctx)
    if(await startcheck(ctx, 'go')) return;
  await goStarter(bot, ctx) });

goScene.on("message", async (ctx: any) => { 
   cmdd(ctx)
    await startcheck(ctx, 'go')
  await goStarter(bot, ctx) });

let bot = new Telegraf<Scenes.SceneContext>(config.token);
let stage = new Scenes.Stage<Scenes.SceneContext>([cScene, pyScene, jsScene, cppScene, jvScene, goScene, tsScene], { ttl: config.ttl });
bt(bot)
bot.use(session());
bot.use(stage.middleware());



bot.hears(new RegExp("^\\" + config.startSymbol + "(code|py|python|ts|type|js|node|cc|cpp|cplus|go|jv|java|c\\+\\+)", "i"), async (ctx: any) => {
  try {
    
  let compiler: any = ctx.message.text + "";
  let memb = await ctx.getChatMember(ctx.botInfo.id)
  if (!memb.can_delete_messages) {
    if ((ctx.chat.id + "").startsWith("-100"))
      return ctx.reply('I must be admin with delete message permission')
  }
  function cmp(a:string){
return (new RegExp("^\\" + config.startSymbol + a, "i")).test(compiler)}
  
  if (cmp("py|python"))
    ctx.scene.enter("py")
  else if (cmp("cc|code"))
    ctx.scene.enter("code")
  else if (cmp("js|node"))
    ctx.scene.enter("js")
  else if (cmp("ts|type")) {
    ctx.reply("Excecuting typescript code..")
      .then(async (m: any) => { await h.sleep(3000); return m.message_id })
      .then((m: any) => { ctx.deleteMessage(m) })
      .catch((err: any) => { })

    await h.sleep(300)
    ctx.scene.enter("ts")
  }
    
  else if (cmp("cpp|cplus"))
    ctx.scene.enter("cpp")
  else if (cmp("jv|java"))
    ctx.scene.enter("jv")
  else if (cmp("go"))
    ctx.scene.enter("go")

  // let wait = await ctx.reply("Please wait...").catch((err: Error)=> {})
  // await h.sleep(200);
  // ctx.deleteMessage(wait.message_id).catch((err: Error)=> {})
      } catch (error) {
  }
})

bot.launch({ dropPendingUpdates: true });

// it checks that if any compiler command change then it changes session; Example : js to py
async function startcheck(ctx:any, y:any, json:any ={}) {
  try {
    
if(!ctx.message.text.startsWith(config.startSymbol))
  return false
  
  function cmp(a:string){
return (new RegExp("^\\" + config.startSymbol + a, "i")).test(ctx.message.text)}
  
   let cmd = ctx.message.text.match(new RegExp("^\\"+ config.startSymbol + "[a-zA-Z0-9]{2,9}", 'i'))
if(!cmd) return false;
  
  let cst = cmd[0].replace(config.startSymbol, "")
   cst = cst.toLowerCase()
  if(y.includes(cst)){
    console.log('yes')
    return false
  }
  
  if (("py python").includes(cst)){
    ctx.scene.enter("py")
    return true
  }
  else if (("cc code").includes(cst)){
    ctx.scene.enter("code")
    return true
  }
  else if (("js node").includes(cst)){
    ctx.scene.enter("js")
    return true
  }
  else if (("ts type").includes(cst)) {
    ctx.reply("Excecuting typescript code..")
      .then(async (m: any) => { await h.sleep(3000); return m.message_id })
      .then((m: any) => { ctx.deleteMessage(m) })
      .catch((err: any) => { })

    await h.sleep(300)
    ctx.scene.enter("ts")
    return true
  }
  else if (("cpp cplus").includes(cst)){
    ctx.scene.enter("cpp")
    return true
  }
  else if (("jv java").includes(cst)){
    ctx.scene.enter("jv")
     return true
  }
  else if (("go").includes(cst)){
    ctx.scene.enter("go")
     return true
  }

  return false
      } catch (error) {
    return false
  }
}