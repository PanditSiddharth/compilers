#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🔧 Setting up iocompiler environment...");

// Install TypeScript & ts-node locally
try {
  execSync("npm init -y", { stdio: "inherit" });
  execSync("npm i iocompiler@alpha", { stdio: "inherit" });
  console.log("✅Io compiler installed.");
} catch (e) {
  console.error("❌ Failed to install TypeScript.");
  process.exit(1);
}

// Create a basic tsconfig.json if not present
// const tsconfigPath = path.join(process.cwd(), "tsconfig.json");
// if (!fs.existsSync(tsconfigPath)) {
//   fs.writeFileSync(tsconfigPath, JSON.stringify({
//     "compilerOptions": {
//       "target": "ES2020",
//       "module": "CommonJS",
//       "strict": true,
//       "esModuleInterop": true,
//       "skipLibCheck": true,
//       "forceConsistentCasingInFileNames": true
//     }
//   }, null, 2));
//   console.log("✅ tsconfig.json created.");
// } else {
//   console.log("ℹ️ tsconfig.json already exists. Skipping.");
// }

// Optional: Install iocompiler globally if needed
// execSync("npm install iocompiler --save", { stdio: "inherit" });

console.log("🎉 iocompiler setup complete! Run `ts-node yourFile.ts` to start.");
