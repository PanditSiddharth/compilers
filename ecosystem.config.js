module.exports = {
  apps: [
    {
      name: "compilers",          // app ka naam
      script: "index.ts",      // run karne wali file
      restart: true,
      cwd: "/home/sid/Desktop/compilers", // aapke project ka full path
      interpreter: "tsx",     // node ka use hoga
      watch: false,            // agar file changes par restart chahiye to true kar dena
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
