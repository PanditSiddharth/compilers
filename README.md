# Realtime Input/Output compiler bot  
by @PanditSiddharth  

You can use this bot in telegram  
Link: https://telegram.me/codecompiler_bot  

See all command of bot by `/help` command  
See bot is running or not by `/ping` command  
See current version and featurs of bot by `/version` command  

For any other help:  
Support Group: https://telegram.me/LogicB_support  
Updates : https://telegram.me/Logicbots  
Bot owner: https://telegram.me/PanditSiddharth  

Testing group: https://telegram.me/IO_Coding  
Logs : https://telegram.me/Compilerlogs  

You can contribute in it or make your own its opensource

## Wants make your own bot ?  
Just follow steps bellow -->  

==> Use any your hosting plateform or in replit or local steps given bellow  
     
     Replit gives free some storage and Ram you can use it
     
==> clone this repo in your own server  

```sh
# You must required to install nodejs
# installation command
git clone "https://github.com/PanditSiddharth/compilers"

# entering in iocompiler directiory
cd iocompiler

# Open config.ts file 
# Add all configuration according to you

# install all node dependencies
npm install

# Run your bot
node index

# Any query ? see this readme to join support group
```

==> ## Now set environment variables  

### Required enviroment var:  
`TOKEN` = "Paste your telegram bot token in this" 

if you have in local system make 
.env file and add vars

if you have installed gcc, g++ c/c++ compiler on your local system you can run c programs in telegram without adding these both c/c++ in env variables

### Optional environment var:

`PYTHON` - Paste python full path in value     (find it by running command  `which python` or `which python3`)  
`NODE` - Paste node js full path in value      (find it by running command  `which node`)  
`JAVA` - Paste java full path in value         (find it by running command  `which java`)  
`JAVAC` - Paste javac full path in value       (find it by running command  `which javac`)  
`GO` - Paste go full path in value             (find it by running command  `which go`)  
     
             Remember you need first install these all languages in your server or locally  

==> and use `npm install`  
==> and use `pip install -r requirements.txt --user`  

==> Finally you can run it by your root directory whwre package.json file exists  
    by command `./node_modules/.bin/ts-node index.ts`  
