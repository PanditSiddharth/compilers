let { Telegraf } = require("telegraf");

async function insertToken(BotToken, data) {
  try {
    if (!data.userId || !data.botToken || !data.botUsername) {
      return { error: "some error occured" }
    }
    const existingBot = await BotToken.findOne({ botToken: data.botToken });

    if (existingBot)
      return { error: 'Bot token already exists' }

    const botToken = await BotToken.create({
      userId: data.userId,
      botToken: data.botToken,
      botUsername: data.botUsername.toLowerCase(),
    });

    console.log('bot added successfully:', botToken);
    return botToken;
  } catch (error) {
    console.error('Error creating code:', error);
    return { error: error.message };
  }
}

async function getAllBotTokens(BotToken) {
  try {
    const allBotTokens = await BotToken.find({}, 'botToken'); // Only fetch the 'botToken' field
    return allBotTokens.map((tokenObj) => tokenObj.botToken); // Extract 'botToken' from each object
  } catch (err) {
    return [];

  }
}

async function insertChat(Chat, ctx, chatData) {
  try {
    const existingBot = await Chat.findOne({ chatId: chatData.chatId });
    if (existingBot) {
      let bt = new Telegraf(existingBot.botToken);
      bt.telegram.leaveChat(chatData.chatId)
        .then((res) => { bt = null })
        .catch(err => { console.log(err.message); bt = null })
    }
    await Chat.create(chatData);

  } catch (error) {
    console.error('Error inserting chat:', error);
  }
}

async function deleteChat(Chat, chatId) {
  try {
    const deletionResult = await Chat.deleteOne({ chatId: chatId });

    if (deletionResult.deletedCount > 0) {
      console.log('Chat deleted successfully.');
      return { success: true };
    } else {
      console.log('Chat not found or already deleted.');
      return { success: false };
    }
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw error;
  }
}


async function insertMultipleChats(Chat, chatDataArray) {
  try {
    const insertedChats = await Chat.insertMany(chatDataArray);
    console.log('Chats inserted successfully:', insertedChats);
    return insertedChats;
  } catch (error) {
    console.error('Error inserting chats:', error);
    throw error;
  }
}

module.exports = { insertToken, getAllBotTokens, insertChat, deleteChat, insertMultipleChats }