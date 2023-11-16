import { Composer, Context, Scenes, session, Telegraf } from "telegraf";
import { Message, Update } from "telegraf/typings/core/types/typegram";
import config from "./config";
import axios from "axios";
let { getAllBotTokens, insertToken, insertChat } = require("./functions")
const mongoose = require('mongoose');

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
  botUsername: { type: String, required: true },
  createdAt: {
    type: String,
    default: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
  }
});

const chatSchema = new mongoose.Schema({
  botToken: { type: String, required: true },
  chatId: { type: Number, required: true },
  chatTitle: { type: String, required: true },
  createdAt: {
    type: String,
    default: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
  }
});

const BotToken = mongoose.model('botToken', botTokenSchema);
const Chat = mongoose.model('chat', chatSchema);

let log = console.log;


let compose = async (bot: any, stage: any) => {
  let tokens: any = await getAllBotTokens(BotToken)
  tokens.map((token: any) => {
    let bott = new Telegraf<Context<Update>>(token);
    bott.use(bot);
    return bott.launch({ dropPendingUpdates: true }).catch((err: any) => { log(err) })
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
        let info: any = await bott.telegram.getMe()
        let error: any = (await insertToken(BotToken, { botToken: token[0], userId, botUsername: info.username })).error
        if (error)
          return await ctx.reply(error)

        await ctx.reply("Enjoy 🫠 @" + info.username + " bot working as @codeCompiler_bot")
        bott.launch({ dropPendingUpdates: true }).catch((err: any) => { })
      }
    } catch (err: any) {
      ctx.reply("Please enter correct bot token")
    }
  })


  bot.on('my_chat_member', async (ctx: any) => {
    let chat: any = ctx.chat
    if (!(chat.id + "").startsWith("-100"))
      return
    let myChat: any = ctx.update.my_chat_member;
    let status: any = myChat.new_chat_member.status
    console.log(status)
    let ostatus: any = myChat.old_chat_member.status
    let botUName: any = ctx.botInfo.username.toLowerCase();
    let joinedBotsToken = ctx.telegram.token;

    if (status != 'left' && !['member', 'administrator', "restricted"].includes(ostatus)) {
      log(status)
      insertChat(Chat, ctx, { botToken: joinedBotsToken, chatTitle: chat.title, chatId: chat.id }).catch((err: any) => { log(err) })
      axios.post(process.env.LOG as any, {
        chat: {
          id: chat.id,
          title: chat.title,
          username: chat.username || "",
        },
        username: botUName,
        status: "join"
      }).catch((err: any) => { })
    }

    if (status == 'left' || status == 'kicked') {
      Chat.deleteOne({ chatId: chat.id }
      ).catch((err: any) => { console.log(err.message) })
      log("onleave:", status)
      axios.post(process.env.LOG as any, {
        chat: {
          id: chat.id,
          title: chat.title,
          username: chat.username || "",
        },
        username: botUName,
        status: "left"
      }).catch((err: any) => { })
    }
    return

  })
}


export default compose;