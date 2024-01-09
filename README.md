# Realtime Input/Output compiler bot  
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

## If you want to create your own bot follow these steps 
(Do this all with approprite sudo permission)  
(use `sudo su` to perform these all operations but do it carefully)  

### Step 1: Install node.js  
For this first install nvm(node version manager)   
```sh
        # Install NVM
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

        # Load NVM
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads NVM
```
Now nvm installed now need to install nodejs  
```sh
# This will install nodejs (if you instll any other version then configure also correctly)
nvm install v20.10.0

# Configure node.js path in ~/.bashrc
# use gedit or nano to add these lines at last of bashrc file 
# gedit ~/.bashrc
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"`  
export PATH="$PATH:$HOME/.nvm/versions/node/v20.10.0/bin" 
```

### Step 2: Create directory structure for creating new subsystem
```sh
mkdir -p /home/troot/{bin,sbin,usr/bin,lib,lib64,home/me,home/usercmp,etc,dev,root}
mknod -m 666 /home/troot/dev/null c 1 3
cp ~/.bashrc /home/troot/home/usercmp 
cp -r ~/.nvm /home/troot/home/usercmp 
```

### Step 3: create new user
create user and set those password for example "usercmp"
```sh
# Create new user
useradd usercmp  

# Assign shell to this created user
chsh -s /bin/bash

# assign it home directory usercmp 
usermod -d /home/usercmp usercmp

# Set password for this user
passwd usercmp
```

### Step 4: create new group and assign newly created user to it

```sh
groupadd compiler   # creates new group [for example here using compiler group]

# Assign newly created user to this group
sudo usermod -aG compiler usercmp
```

### Step 5: Configure sshd_config file  
```sh
# Open sshd_config file  
gedit /etc/ssh/sshd_config    # for terminal: use nano or vi editor
```
find `Subsystem sftp` keyword written line in that file
Add # hash before that line (To disable this line)

For example: (added # before this line)
```sh
# Subsystem	   sftp	    /usr/lib/openssh/sftp-server
```
And paste this bellow written code after that (compiler: newly created group)
```sh
Subsystem     sftp    internal-sftp

Match group compiler
  ChrootDirectory /home/troot
```

### Step 6: Install anyother languages also to run codes of that languages
```sh
# For example: python3 go java C/C++ etc

# python installation command
apt install python3 

# like this install other languages
```

### Step 7: Add libraries and binaries to troot's subsystem
See [setup.sh](https://github.com/PanditSiddharth/compilers/blob/cmp/setup.sh)
 file's code, copy them and create file setup.sh in your system
paste this code there  

Run setup.sh to add each command on troot directory
```sh
./setup.sh   # you can run it many times if you want add more and more commands
```
It will ask you to give commands name which you want to add in new subsystem
Give commands name separated with spaces

This commands must be given to work
```sh
# Enter commands:
sh bash which env cat ls grep awk node python3 # many more commands
```

### Step 8: Clone git repository  
```sh
# Go in your subsystem by
cd /home/troot/home/me

# Clone git repository there
git clone "https://github.com/PanditSiddharth/compilers"
```
if you see index.ts file in me folder then no change directory else   
```sh
cd compilers
```

### Step 8: Configure config.ts file else create new conf.js file  
create and open conf.js file: configure this variables  
```js
env = {
  token:"Add here your bot token",
  python: "Add here your python path",
  node:"Add here your node path",
  java: "Add here your java path",
  javac:"Add here your javac path",
  go:"Add here your go path"
}

module.exports = env;
```
Run command `npm i` to install required npm libs
```sh
npm i
```
### Step 9: Change permission of subsystem by these commands
```sh
troot="/home/troot"
chmod 755 "$troot"
chmod -R 755 "$troot"
chmod 111 "$troot/home/me/conf.js"
chmod 111 "$troot/home/me/config.ts"
chmod -R 777 "$troot/home/me/compilers/*"
chmod -R 555 "$troot/home/me/compilers/cmps"
chmod -R 777 "$troot/home/me/files/*"
chmod 777 "$troot/home/me/test"
```
### Step 10: Enter in subsystem and verify each commands and do permissions according to you
```sh
# Enter in subsystem 
ssh usercmp@localhost

# now verify each command for example
ls  # show current directory content
cd /home/me  # path to your index.ts file
# .......... many more comands
```

### Step 11: Finally run your bot
```sh
# before running this command ensure that your are in that directory where index.ts file exists
./node_modules/.bin/pm2 start index.ts --interpreter ./node_modules/.bin/tsx

# list running process      ./node_modules/.bin/pm2 list 
# for stopping process     ./node_modules/.bin/pm2 stop [id] 
# for deleting process     ./node_modules/.bin/pm2 delete [id] 
```

See all command of bot by `/help` command  
See bot is running or not by `/ping` command  
See current version and featurs of bot by `/version` command  

# Any query ? see this readme to join support group

https://telegram.me/logicb_support
https://telegram.me/logicbots
