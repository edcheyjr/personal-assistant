module.exports = {
    apps: [
        {
            name: 'personal-assistant',
            script: 'pnpm',
            args: 'start',
            cwd: './',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
            env_development: {
                NODE_ENV: 'development',
                PORT: 3001,
            },
            env_staging: {
                NODE_ENV: 'staging',
                PORT: 3002,
            },
        },
    ],
}
