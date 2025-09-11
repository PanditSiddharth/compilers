# Realtime Input/Output Compilers

**by **[**@PanditSiddharth**](https://telegram.me/PanditSiddharth)

For Docker first:

```sh
sudo usermod -aG docker $USER
newgrp docker
```

---

## How to Setup

1. Go to [@BotFather](https://t.me/BotFather).
2. Send `/newbot` to create a new bot.
3. Follow instructions for name + username (must end with `bot`).

You will get **bot token** and **bot link** after setup.

1. Go to [@MissRose\_bot](https://telegram.me/missrose_bot).
2. Send `/info`.
3. You’ll see your **Telegram user ID**.

---

## Main Setup

1. Install [Termux](https://f-droid.org/packages/com.termux/) from F-Droid.
2. Run these commands:
   ```bash
   pkg update && pkg upgrade -y
   pkg install nodejs git -y
   git clone https://github.com/PanditSiddharth/compilers.git compiler
   cd compiler
   npm install
   node index.js
   ```

Ignore red warnings; bot is running.

**Requirements:** Node.js installed, optional compilers (C/C++, Python, Java, etc.)

1. Create project:

   ```sh
   mkdir compiler && cd compiler
   npm init -y
   npm install iocompiler
   ```

2. Create `index.ts` (or `index.js`):

   ```ts
   import { config } from "dotenv";
   config();
   import { compiler } from "iocompiler";
   import { Telegraf } from "telegraf";
   import https from "https";

   const agent = new https.Agent({ family: 4 });
   const bot = new Telegraf(process.env.BOT_TOKEN as string, {
     telegram: { agent }
   });

   bot.launch({ dropPendingUpdates: true });
   compiler(bot as any);
   ```

3. Create an `ioconfig.json` in your project root:

   ```jsonc
   {
     "$schema": "./node_modules/iocompiler/schema.json",
     "ttl": 60,
     "commands": ["py", "js", "cc", "cpp"],
     "mode": "private",
     "allowed": [123456789],
     "root": {
       "allowed": [123456789],
       "command": "root",
       "shell": "bash"
     }
   }
   ```

4. Run the project:

   ```sh
   node index.js
   ```

1) Make sure Docker is installed and running.
2) Clone and run inside a container:
   ```sh
   git clone https://github.com/PanditSiddharth/compilers.git compiler
   cd compiler
   docker build -t iocompiler .
   docker run -it --rm \
     -e BOT_TOKEN=your_bot_token \
     -e TELEGRAM_ID=your_telegram_id \
     iocompiler
   ```
3) Recommended for safe and isolated execution.

---

## Configuration

All settings are managed in **ioconfig.json**.\
You get auto-completion in editors (VS Code, WebStorm, etc.) because schema is bundled:

```json
"$schema": "./node_modules/iocompiler/schema.json"
```

### Example fields

- **ttl**: Execution timeout in seconds (default 60)
- **commands**: Languages allowed (default all)
- **mode**: `"private" | "public" | "docker-private"`
- **allowed**: Array of allowed user IDs
- **root**: Root-level config (with command + shell)
- **group / channel**: Telegram groups/channels

---

### Useful Commands

- `/help` → see all commands
- `/ping` → check if bot running
- `/version` → current version/features

Support:

- [LogicB Support](https://telegram.me/logicb_support)
- [Logicbots](https://telegram.me/logicbots)

⚠️ Run only in a secure environment (Docker recommended).

---

