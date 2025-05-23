module.exports = {
  apps: [
    {
      name: 'datacenter-api',
      script: 'server/index.js',
      exec_mode: 'cluster',
      instances: 'max', // O un número como 4
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        IP_ADDRESS: process.env.IP_ADDRESS || '0.0.0.0' // Usar variable de entorno o valor por defecto
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000, 
        IP_ADDRESS: process.env.IP_ADDRESS || '0.0.0.0' // Usar variable de entorno o valor por defecto
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      error_file: './logs/pm2/error.log',
      out_file: './logs/pm2/output.log'
    }
  ]
};