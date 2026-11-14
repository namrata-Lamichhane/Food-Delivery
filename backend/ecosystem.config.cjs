// ==============================================================================
// Food Delivery System — PM2 Process Manager Configuration
// File: backend/ecosystem.config.cjs
// Note: Uses .cjs extension because backend package.json defines "type": "module"
// ==============================================================================

module.exports = {
  apps: [
    {
      name: 'food-del-backend',
      script: 'server.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '400M',
      min_uptime: '5s',
      exp_backoff_restart_delay: 1000,
      restart_delay: 3000,
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
}
