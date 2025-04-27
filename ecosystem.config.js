module.exports = {
  apps: [{
    name: 'cmslaklu',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3015,
      NEXT_PUBLIC_SERVER_URL: 'https://api.laklu.com'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3015,
      NEXT_PUBLIC_SERVER_URL: 'https://api.laklu.com'
    },
    node_args: '--max-old-space-size=4096',
    exec_mode: 'cluster',
    exp_backoff_restart_delay: 100,
    max_restarts: 10,
    restart_delay: 4000,
    max_memory_restart: '4G'
  }]
} 