# Realtime Input/Output compilers  
by @PanditSiddharth  

You can use this bot in telegram  
Link: https://telegram.me/codecompiler_bot  

For any other help:  
Support Group: https://telegram.me/LogicB_support  
Updates : https://telegram.me/Logicbots  
Bot owner: https://telegram.me/PanditSiddharth  

Testing group: https://telegram.me/IO_Coding  
Logs : https://telegram.me/Compilerlogs  

You can contribute in it or make your own bot its opensource

## Installation Instructions
npm install iocompiler

### Please run only on secure environment 
Because using your bot users can harm your system 
So use docker else any secure environment or give telegram id in allowed user option     👈👈

## Usage 

```js
let { compiler } = require('iocompiler');

// allowed users id if you not give this then all users can use your bot
let { bot } = compiler(TelegramBotToken, { allowed: [1791106582]});

// launching telegraf bot in polling mode
bot.launch({ dropPendingUpdates: true });
```

See all command of bot by `/help` command  
See bot is running or not by `/ping` command  
See current version and featurs of bot by `/version` command  

# Any query ? see this readme to join support group

https://telegram.me/logicb_support
https://telegram.me/logicbots
