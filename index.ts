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
require("dotenv").config()
// let c = require('./compilers/c');

keep_alive()
import Hlp from './helpers';
// let py = require('./compilers/py');
let h = new Hlp()
import { Scenes, session, Telegraf } from "telegraf";
require('dotenv').config()
// Handler factories
const { enter, leave } = Scenes.Stage;
let func: any = {};

let pyScene = new Scenes.BaseScene<Scenes.SceneContext>("py");
pyScene.enter(async (ctx: any) => { await pyStarter(bot, ctx) });
pyScene.on("message", async (ctx: any) => { await pyStarter(bot, ctx) });

let cppScene = new Scenes.BaseScene<Scenes.SceneContext>("cpp");
cppScene.enter(async (ctx: any) => { await cppStarter(bot, ctx) });
cppScene.on("message", async (ctx: any) => { await cppStarter(bot, ctx) });

let cScene = new Scenes.BaseScene<Scenes.SceneContext>("code");
cScene.enter(async (ctx: any) => { await cStarter(bot, ctx); });
cScene.on("message", async (ctx: any) => { await cStarter(bot, ctx) });

let jvScene = new Scenes.BaseScene<Scenes.SceneContext>("jv");
jvScene.enter(async (ctx: any) => { await jvStarter(bot, ctx) });
jvScene.on("message", async (ctx: any) => { await jvStarter(bot, ctx) });

let jsScene = new Scenes.BaseScene<Scenes.SceneContext>("js");
jsScene.enter(async (ctx: any) => { await jsStarter(bot, ctx) });
jsScene.on("message", async (ctx: any) => { await jsStarter(bot, ctx) });

let tsScene = new Scenes.BaseScene<Scenes.SceneContext>("ts");
tsScene.enter(async (ctx: any) => { await tsStarter(bot, ctx) });
tsScene.on("message", async (ctx: any) => { await tsStarter(bot, ctx) });

let goScene = new Scenes.BaseScene<Scenes.SceneContext>("go");
goScene.enter(async (ctx: any) => { await goStarter(bot, ctx) });
goScene.on("message", async (ctx: any) => { await goStarter(bot, ctx) });

let bot = new Telegraf<Scenes.SceneContext>(process.env.TOKEN as any);
let stage = new Scenes.Stage<Scenes.SceneContext>([cScene, pyScene, jsScene, cppScene, jvScene, goScene, tsScene], { ttl: 40 });
bt(bot)
bot.use(session());
bot.use(stage.middleware());

bot.hears(/^\/(code|py|python|ts|type|js|node|cc|cpp|cplus|go|jv|java|c\+\+)/i, async (ctx: any) => {
  let compiler: any = ctx.message.text + "";
  let memb = await ctx.getChatMember(ctx.botInfo.id)

  if (!memb.can_delete_messages) {
    if ((ctx.chat.id + "").startsWith("-100"))
      return ctx.reply('I must be admin with delete message permission')
  }

  if ((/^\/(py|python)/i).test(compiler))
    ctx.scene.enter("py")
  else if ((/^\/(cc|code)/i).test(compiler))
    ctx.scene.enter("code")
  else if ((/^\/(js|node)/i).test(compiler))
    ctx.scene.enter("js")
  else if ((/^\/(ts|type)/i).test(compiler))
    ctx.scene.enter("ts")
  else if ((/^\/(cpp|cplus)/i).test(compiler))
    ctx.scene.enter("cpp")
  else if ((/^\/(jv|java)/i).test(compiler))
    ctx.scene.enter("jv")
  else if ((/^\/go/i).test(compiler))
    ctx.scene.enter("go")

  // let wait = await ctx.reply("Please wait...").catch((err: Error)=> {})
  // await h.sleep(200);
  // ctx.deleteMessage(wait.message_id).catch((err: Error)=> {})
})

bot.launch({ dropPendingUpdates: true });