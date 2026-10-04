module.exports = {
  apps: [
    {
      name: 'halo-hola-api',
      cwd: './backend',
      script: 'src/server.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '600M',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
