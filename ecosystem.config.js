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
      NEXT_PUBLIC_SERVER_URL: 'https://api.laklu.com',
      NEXT_TELEMETRY_DISABLED: 1,
      NEXT_DISABLE_SOURCEMAPS: 1
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3015,
      NEXT_PUBLIC_SERVER_URL: 'https://api.laklu.com'
    },
    node_args: '--max-old-space-size=1024 --optimize-for-size',
    exec_mode: 'cluster',
    exp_backoff_restart_delay: 100,
    max_restarts: 5,
    restart_delay: 4000,
    max_memory_restart: '1G',
    kill_timeout: 3000,
    listen_timeout: 10000,
    source_map_support: false,
    out_file: '/dev/null',
    error_file: '/dev/null'
  }]
} 