module.exports = {
  apps: [
    {
      name: "Album APIs",
      script: "app.js",
      instances: 7,
      autorestart: true,
      watch: true,
      max_memory_restart: "1G",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
    {
      name: "SingleUpload-Worker1",
      script: "workers/handleSingleUpload.js",
      instances: 1,
      autorestart: true,
      watch: true,
    },
  ],
};
