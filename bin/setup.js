#!/usr/bin/env node
const { execSync } = require("child_process");
const pjson = require("../package.json");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const which = require("which");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("🔧 Configuring iocompiler environment...");
// Ask for Bot token
function askToken() {
  return new Promise((resolve) => {
    rl.question("Enter Bot Token: ", (ans) =>
      resolve(ans.trim())
    );
  });
}

// Ask for TypeScript
function askTS() {
  return new Promise((resolve) => {
    rl.question("Do you want to setup project in TypeScript? (y/n): ", (ans) =>
      resolve(ans.trim().toLowerCase() === "y")
    );
  });
}

// Ask for mode
function askMode() {
  return new Promise((resolve) => {
    rl.question(
      "Choose mode (private / public / docker-private): ",
      (ans) => resolve(ans.trim())
    );
  });
}

// Ask for Telegram IDs (comma separated)
function askIDs() {
  return new Promise((resolve) => {
    rl.question(
      "Enter Telegram IDs allowed (comma separated): ",
      (ans) => resolve(ans.split(",").map((id) => +id.trim()).filter(Boolean))
    );
  });
}

(async () => {
  try {
    // 1. ask TS
    const useTS = await askTS();
    const token = await askToken();

    // 2. ask mode
    const mode = await askMode();
    let allowed = [];

    if (mode === "private") {
      allowed = await askIDs();
      if (!allowed.length) {
        console.error(
          "\x1b[31mIn private mode you must provide at least one Telegram ID\x1b[0m"
        );
        process.exit(1);
      }
    }

    if (mode === "public" || mode === "docker-private") {
      if (!which.sync("docker", { nothrow: true })) {
        console.error(
          "\x1b[31mDocker is not installed. Without Docker you cannot run public/docker-private mode. Please install Docker or use private mode.\x1b[0m"
        );
        process.exit(1);
      }
    }

    if (mode === "api-mode") {
      console.error(
        "\x1b[31mApi mode is not supported now. Please use private/public/docker-private.\x1b[0m"
      );
      process.exit(1);
    }

    // 3. create config first
    const envc = path.join(process.cwd(), ".env");
    if (!fs.existsSync(envc)) {
      fs.writeFileSync(envc, `BOT_TOKEN="${token}"`);
      console.log("✅ Added Bot token in .env File");
    } else {
      console.log("ℹ️ .env File Already exists. Skipping.");
    }


    // 3. create config first
    const ioconfigPath = path.join(process.cwd(), "ioconfig.json");
    if (!fs.existsSync(ioconfigPath)) {
      const defaultConfig = {
        $schema: "./node_modules/iocompiler/schema.json",
        ttl: 60,
        startSymbol: "/",
        group: "@Logicb_support",
        channel: "@LogicBots",
        mode: mode,
        root: {
          allowed: [],
          command: "root",
          shell: "bash",
        },
        version: pjson.version,
      };
      if (mode == "private")
        defaultConfig.allowed = allowed?.map(e => +e)

      fs.writeFileSync(ioconfigPath, JSON.stringify(defaultConfig, null, 2));
      console.log("✅ ioconfig.json created with mode:", mode);
    } else {
      console.log("ℹ️ ioconfig.json already exists. Skipping.");
    }

    // Create index.ts/js
    const indexFile = useTS ? "index.ts" : "index.js";
    const indexPath = path.join(process.cwd(), indexFile);

    if (!fs.existsSync(indexPath)) {
      const content = useTS
        ? `
import { config } from 'dotenv';
config();
import { compiler } from 'iocompiler';
import { Telegraf } from "telegraf";
import https from "https";

const agent = new https.Agent({ family: 4 });

const bot = new Telegraf(process.env.BOT_TOKEN as any, {
  telegram: { agent }
});
bot.launch({ dropPendingUpdates: true });

compiler(bot as any);
    `.trim()
        : `
import { config } from 'dotenv';
config();
import { compiler } from 'iocompiler';
import { Telegraf } from "telegraf";
import https from "https";

const agent = new https.Agent({ family: 4 });

const bot = new Telegraf(process.env.BOT_TOKEN, {
  telegram: { agent }
});
bot.launch({ dropPendingUpdates: true });

compiler(bot);
    `.trim();

      fs.writeFileSync(indexPath, content + "\n");
      console.log(`✅ ${indexFile} created.`);
    }


    // 4. installation at the end
    console.log("\n📦 Installing dependencies...");
    execSync("npm init -y", { stdio: "inherit" });
    execSync("npm pkg set type=module", { stdio: "inherit" });
    execSync(
      `npm i iocompiler${pjson.version.includes("alpha")
        ? "@alpha"
        : pjson.version.includes("beta")
          ? "@beta"
          : ""
      }`,
      { stdio: "inherit" }
    );
    execSync("npm i telegraf dotenv", { stdio: "inherit" });

    if (useTS) {
      execSync("npm i typescript ts-node @types/node -D", { stdio: "inherit" });
      const tsconfigPath = path.join(process.cwd(), "tsconfig.json");
      if (!fs.existsSync(tsconfigPath)) {
        fs.writeFileSync(
          tsconfigPath,
          JSON.stringify(
            {
              compilerOptions: {
                target: "ES2020",
                module: "CommonJS",
                strict: true,
                esModuleInterop: true,
                skipLibCheck: true,
                forceConsistentCasingInFileNames: true,
              },
            },
            null,
            2
          )
        );
        console.log("✅ tsconfig.json created.");
      }
    }

    console.log("\n🎉 iocompiler setup complete!");

    console.log("\nℹ️ Make sure you have filled BOT_TOKEN inside .env file.");
    if(useTS)
    console.log("\nℹ️ run ts-node index.ts");
    else
    console.log("\nℹ️ run command node index.js");

  } catch (e) {
    console.error("❌ Setup failed:", e.message);
    process.exit(1);
  } finally {
    rl.close();
  }
})();
