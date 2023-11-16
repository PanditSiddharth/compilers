import { Composer, Context, Scenes, session, Telegraf } from "telegraf";
import { Message, Update } from "telegraf/typings/core/types/typegram";
import config from "./config";
const mongoose = require('mongoose');
/*
const uri = process.env.URI + "compiler?retryWrites=true&w=majority"
mongoose.set('strictQuery', false);

// Connect to MongoDB using a connection pool
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // Specify the maximum number of connections in the pool
});

const botTokenSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  botToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  botToken: { type: String, required: true },
  chatId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const token = mongoose.model('botToken', botTokenSchema);
const chat = mongoose.model('chat', chatSchema);
*/

let tokens = [
  process.env["T1"] as string,
  process.env["T2"] as string
]
let log = console.log;
let compose = async (bot: any, stage: any) => {

  tokens.map(token => {
    let bott = new Telegraf<Context<Update>>(token, { handlerTimeout: 100000 });
    bott.use(bot);
    return bott.launch({ dropPendingUpdates: true });
  });

  bot.on("message", async (ctx: Context<any>, next: any) => {
    next();
    let message: any = ctx.message.text;
    let userId = ctx.from.id;

    try {
      if (ctx.chat.type == "private" && !message.startsWith(config.startSymbol)) {
        let token: any = message.match(/\b\d+:[A-Za-z0-9_-]{35,}/)
        if (!token)
          return;
        let bott = new Telegraf(token[0]);

        bott.use(bot);
        let info: any = await bott.telegram.getMe().catch((err: any) => { log(err) })

        ctx.reply("Now @" + info.username + " bot working as @codeCompiler_bot")
        return bott.launch({ dropPendingUpdates: true }).catch((err: any) => { log(err) })

      }
    } catch (err: any) {
      ctx.reply("Please enter correct bot token")
      log(err)
    }
  })

}

export default compose;