const { Telegraf } = require('telegraf');
const bot = new Telegraf("6295407839:AAHRCtKigUBJEZy3fP2Mm0Z3NvvskYRQwVk");

// Handling inline queries
bot.on('inline_query', async (ctx) => {
    const query = ctx.inlineQuery.query;

    const results = [
        {
            type: 'article',
            id: '1',
            title: 'First Result',
            input_message_content: {
                message_text: `You searched for: ${query}`,
            },
        },
        {
            type: 'article',
            id: '2',
            title: 'Second Result',
            input_message_content: {
                message_text: 'This is another result!',
            },
        },
    ];

    ctx.answerInlineQuery(results);
});



// Handling chosen inline results
bot.on('chosen_inline_result', (ctx) => {
    const chosenResult = ctx.chosenInlineResult;

    // Log the chosen result
    console.log('User selected:', chosenResult);

    // You can also perform other actions here
    ctx.telegram.sendMessage(chosenResult.from.id, `You selected: ${chosenResult.query}`);
});

// Start the bot 
bot.launch();
