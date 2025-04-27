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
    }
  }]
} 