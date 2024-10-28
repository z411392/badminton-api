module.exports = {
    apps: [
        {
            namespace: "boyholic-badminton-api",
            name: "tsc",
            watch: false,
            script: "npx",
            args: "tsc -w",
            instances: 1,
            exec_mode: "fork",
            autorestart: false,
        },
        {
            namespace: "boyholic-badminton-api",
            name: "tsc-alias",
            watch: false,
            script: "npx",
            args: "tsc-alias -w",
            instances: 1,
            exec_mode: "fork",
            autorestart: false,
        },
        {
            namespace: "boyholic-badminton-api",
            name: "main",
            watch: [
                "src",
            ],
            watch_delay: 1200,
            script: "src/main.js",
            args: "serve",
            instances: 1,
            exec_mode: "fork",
            env: {
                "NODE_ENV": "development",
            },
        }
    ],
}