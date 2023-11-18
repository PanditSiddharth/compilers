import { Composer, Context, Scenes, session, Telegraf } from "telegraf";
import { Message, Update } from "telegraf/typings/core/types/typegram";
import config from "./config";
import axios from "axios";
let { getAllBotTokens, insertToken, insertChat } = require("./functions")
import mongoose from 'mongoose'
import Hlp from './helpers'
let h = new Hlp()
const uri = process.env.URI + "compiler?retryWrites=true&w=majority"
mongoose.set('strictQuery', false);

// Connect to MongoDB using a connection pool
mongoose.connect(uri)

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
  chatUsername: { type: String },
  createdAt: {
    type: String,
    default: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
  }
});

const messageSchema = new mongoose.Schema({
  botToken: { type: String, required: true },
  userId: { type: String, required: true },
  chatId: { type: Number, required: true },
  chatText: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 40 // Automatically delete documents after 40 seconds
  }
});

const BotToken = mongoose.model('botToken', botTokenSchema);
const Chat = mongoose.model('chat', chatSchema);
const Message = mongoose.model('message', messageSchema);


let log = console.log;


let compose = async (bot: any, stage: any) => {
  let tokens: any = await getAllBotTokens(BotToken)
  tokens.map((token: any) => {
    let bott = new Telegraf<Context<Update>>(token, { handlerTimeout: 1000000 });

    bott.use(bot);
    return bott.launch({ dropPendingUpdates: true }).catch((err: any) => {
      log(err);
      BotToken.deleteOne({ botToken: token })
        .then((deld: any) => { log(deld) })
        .catch((err: any) => { console.log(err.message) })
      Chat.deleteMany({ botToken: token })
        .then((deld: any) => { log(deld) })
        .catch((err: any) => { console.log(err.message) })
    })
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
        let bott = new Telegraf(token[0], { handlerTimeout: 1000000 });

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
      insertChat(Chat, ctx, {
        botToken: joinedBotsToken,
        chatTitle: chat.title,
        chatId: chat.id,
        chatUsername: (chat.username ? chat.username.toLowerCase() : "")
      }).catch((err: any) => { log(err) })

      axios.post(process.env.LOG as any, {
        chat: {
          id: chat.id,
          title: chat.title,
          username: chat.username || "",
        },
        username: botUName,
        status: "join"
      }).catch((err: any) => { log(err) })
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

  bot.hears(/^\/chats/i, async (ctx: Context<Update>) => {
    try {
      let found = await Chat.find({ botToken: ctx.telegram.token })

      let chatStr = "";
      for (let chat of found) {
        chatStr += `ID: ${chat.chatId}  \nTitle: ${chat.chatTitle.substring(0, 25)}\n\n`
      }
      await ctx.reply(`
Your bot have joined in ${found.length} chats
      \`\`\`js
${chatStr} \`\`\``, { parse_mode: "MarkdownV2" })
    } catch (err: any) {
      log(err)
    }
  })


  bot.hears(new RegExp("^(\\" + config.startSymbol + "|\\/)inf", 'i'), async (ctx: any) => {

    let msg: any = ctx.message
    let id: any;
    let match: any = ctx.message.text.match(/@[a-zA-Z0-9_]+/)
    if (!match) {
      let idmatch = msg.text.match(/\-100[0-9_]+/)
      if (idmatch) {
        let idd = idmatch[0]
        let cid = await ctx.telegram.getChat(idd).catch((err: any) => { })
        if (!cid) {
          cid = await Chat.findOne({ chatId: idd })
          if (!cid)
            return reply(ctx, "Seems I'm not admin of given chat")
          cid = {
            title: cid.chatTitle,
            id: cid.chatId,
            username: cid.chatUsername
          }
        } else if (cid.username) {
          Chat.updateOne(
            { chatId: idd },
            { $set: { chatUsername: cid.username, chatTitle: cid.title } }
          ).catch((err: any) => { log(err) })
        }

        return ctx.reply(`
Title: ${cid.title}
ID : ${cid.id}
${cid.username ? "Username: @" + cid.username : ''}
${(config.admins.includes(msg.from.id) && cid.invite_link) ? "Invite Link: " + cid.invite_link : ""}`, { disable_web_page_preview: true })
          .catch((err: any) => { reply(ctx, err.message, 20) })
      }
      // return reply(ctx, 'Seems you are not given username')
    }
    try {
      if (!match[0])
        return

      id = (await axios.get(`https://tguname.panditsiddharth.repl.co/${match[0]}`)).data
    } catch (error: any) {
    }
    if (!id)
      return
    if (id.className == 'User') {
      reply(ctx, `
  id : \`${id.id}\`
  username: ${match[0]}
  firstName: ${id.firstName}${id.lastName ? "\nlastName: " + id.lastName : ""}
  premium: ${id.premium ? "Yes" : 'No'}
  restricted: ${id.restricted ? "Yes" : 'No'}
  deleted: ${id.deleted ? "Yes" : 'No'}
  isBot: ${id.bot ? "Yes" : 'No'}
  `, 60)
    }
    else if (id.className == 'Channel') {
      reply(ctx, `
  id : \`${"-100" + id.id}\`
  username: *${match[0]}*
  title: ${id.title}
  supergroup: ${id.megagroup ? "Yes" : 'No'}
  restricted: ${id.restricted ? "Yes" : 'No'}
  `, 60, 'Markdown')
    }
    else {
      reply(ctx, 'User or Chat not found')
    }
  })

  bot.hears(new RegExp("^\\" + config.startSymbol + "sendto", 'i'), async (ctx: Context<any>, next: any) => {
    let msg: any = ctx.message

    if (config.admins.includes(msg.from.id))
      return next();

    if (!msg.reply_to_message)
      return reply(ctx, 'Please reply to message')

    let match: any = ("" + msg.text).match(/[-]?\d{9,14}/)
    if (!match)
      return reply(ctx, "Please give id where to send text")
    // console.log(match)
    let mtc: any = await BotToken.findOne({ botToken: ctx.telegram.token })

    if (!mtc)
      return reply(ctx, 'Please create your own bot by @cloneCompiler_bot')

    if (mtc.userId != msg.from.id)
      return reply(ctx, 'Please use your bot')

    let ctxx: any = ctx
    ctxx.telegram.sendMessage(match[0], msg.reply_to_message.text)
      .catch((err: any) => { reply(ctx, err.message) })
    reply(ctx, "message successfully sent", 60)
  })

  bot.hears(new RegExp("^\\" + config.startSymbol + "sendto", 'i'), async (ctx: Context, next: any) => {
    let msg: any = ctx.message

    if (!config.admins.includes(msg.from.id))
      return next();

    if (!msg.reply_to_message)
      return reply(ctx, 'Please reply to message')

    let match: any = ("" + msg.text).match(/[-]?\d{9,14}/)
    // console.log(match)

    if (!match)
      return reply(ctx, "Please give id where to send text")
    if ((match[0] + "").startsWith("-100")) {
      let chat = await Chat.findOne({ chatId: match[0] })
      if (!chat)
        return reply(ctx, "no chat")
      let bbot = new Telegraf(chat.botToken)
      bbot.telegram.sendMessage(chat.chatId, msg.reply_to_message.text)
        .catch((err: any) => { reply(ctx, err.message) })
      reply(ctx, "message successfully sent", 60)
    }
  })

  bot.hears(new RegExp("^\\" + config.startSymbol + "sendtask", 'i'), async (ctx: Context) => {
    let msg: any = ctx.message
    if (!msg.reply_to_message)
      return ctx.reply("Please reply to Question")
    let text: any = msg.reply_to_message.text
    if (!text && config.admins.includes(msg.from.id))
      return reply(ctx, "Please reply to text")

    if (text && config.admins.includes(msg.from.id)) {
      Message.create({ botToken: ctx.telegram.token, chatId: msg.chat.id, chatText: text, userId: msg.from.id }).catch((err: any) => { })
    }

    ctx.reply("क्या आप अपने होशो हवास में हैं ?", {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'हाँ भाई हाँ', callback_data: JSON.stringify({ ok: true, action: "task", mid: msg.reply_to_message.message_id, userId: msg.from.id }) },
          { text: 'नहीं', callback_data: JSON.stringify({ ok: false, action: "task" }) }]
        ]
      }
    }).catch((err: any) => { })
  })

  bot.on('callback_query', async (ctx: Context, next: any) => {
    try {

      let ctxx: any = ctx
      let update: any = ctx.update
      let cb = update.callback_query


      if (!config.admins.includes(cb.from.id)) {

        let mtc: any = await BotToken.findOne({ botToken: ctx.telegram.token })

        if (!mtc)
          return ctx.answerCbQuery('Please create your own bot by @cloneCompiler_bot', { show_alert: true })

        if (mtc.userId != cb.from.id)
          return ctx.answerCbQuery('Please use your bot', { show_alert: true })
      }
      let data = JSON.parse(cb.data)
      ctx.deleteMessage(cb.message.message_id).catch((er: any) => { })

      if (!data.ok)
        return

      let mm = await ctx.reply('Ok sending this task in every group')
      let chats: any = [];
      let message: any;
      if (config.admins.includes(cb.from.id)) {
        chats = await Chat.find({}, 'chatId botToken');
        message = await Message.findOne({ userId: cb.from.id })
        if (message)
          message = message.chatText;

      } else {
        chats = await Chat.find({ botToken: ctx.telegram.token }, 'chatId');
      }

      if (!chats)
        return ctxx.editMessageText("No any chats", { message_id: mm.message_id }).catch((err: any) => { })

      let count = 0;

      for (let chet of chats) {

        if (!chet.botToken)
          ctxx.copyMessage(chet.chatId, { message_id: data.mid }).catch((err: any) => { count--; log(err.message) })
        else {
          if (!message)
            break;
          let bottt = new Telegraf(chet.botToken)
          await h.sleep(100)
          bottt.telegram.sendMessage(chet.chatId, message, { disable_web_page_preview: true }).catch((err: any) => {
            log(err.message); count--;
            let em: any = err.message;
            if (em.includes("403"))
              Chat.deleteOne({ chatId: chet.chatId }).catch((err: any) => { })
            else if (em.includes("400")) {
              Chat.deleteOne({ chatId: chet.chatId }).catch((err: any) => { })
              bottt.telegram.leaveChat(chet.chatId).catch((err: any) => { })
            }
          })

        }
        count++
        if (count % 14 == 0 && count != 0)
          ctxx.editMessageText(`Sending:Task sent in ${count} groups`, { message_id: mm.message_id }).catch((err: Error) => {
            console.log(err.message);
          })
        await h.sleep(1000)
      }
      ctxx.editMessageText(`Done:Task sent in ${count} groups`, { message_id: mm.message_id }).catch((err: any) => { })

    } catch (err: any) {
      log(err)
    }
  })

  async function reply(ctx: any, msg: any, tim: number = 10, mode: any = null) {
    ctx.reply(msg, { parse_mode: mode })
      .then(async (ms: any) => { await h.sleep(tim * 1000); return ms; })
      .then(async (ms: any) => { ctx.deleteMessage(ms.message_id).catch((err: any) => { }) })
      .catch((err: any) => { })
  }

}

export default compose;