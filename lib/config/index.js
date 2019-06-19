const dotenv = require('dotenv');
let config = {
    HOST: "http://localhost:3000",
    PORT: 3000,
    LOGGER_LAYOUT_PATTERN: "%d{MM-dd-yyyy} -%t -%x: %m%n",
    LOGGER_ENABLE_CONSOLE_LOG: true,
    LOGGER_ENABLE_FILE_LOG: true,
    LOGGER_LEVEL: "all",
    LOGGER_ENABLE_HTTP_LOG: false,
    LOGGER_FILE_LOG_NAME: "app.log",
    LOGGER_FILE_LOG_MAX_SIZE: 10485760,
    LOGGER_FILE_LOG_BACKUP_NUMBERS: 10,
    LOGGER_HTTP_LOG_URL: "",
    MONGODB_URL: "mongodb://localhost:27017",
    MONGODB_REQUIRE_AUTH: true,
    MONGODB_USER: "admin",
    MONGODB_PASS: "admin",
    MONGODB_AUTH_DB: "admin",
    MONGODB_REPLICA_SET: "",
    MONGODB_DB_NAME: "messenger_db",
    MONGODB_RECONNECT_TRIES: 360,
    MONGODB_RECONNECT_INTERVAL: 10000
};

const result = dotenv.config()
let dotenvConfig = result.error ? {} : result.parsed
let dotenvParse = {};

const dotenvEnvConfig = Object.assign(dotenvConfig, dotenvParse)

Object.keys(dotenvEnvConfig).forEach((key) => {
    if (config[key] === undefined) console.warn(`Key ${key} does not belong to config`);

    switch (typeof config[key]) {
        case "boolean":
            config[key] = (dotenvEnvConfig[key] == 'false') ? false : true;
            break
        case "number":
            config[key] = Number(dotenvEnvConfig[key])
            break

        case "object":
            config[key] = JSON.parse(dotenvEnvConfig[key])
            break

        default:
            config[key] = dotenvEnvConfig[key]
            break
    }
});

config.mongoose = {
    dbUrl: `${config.MONGODB_URL}/${config.MONGODB_DB_NAME}`,
    options: {
        reconnectTries: config.MONGODB_RECONNECT_TRIES,
        reconnectInterval: config.MONGODB_RECONNECT_INTERVAL
    }
};

if (config.MONGODB_REQUIRE_AUTH) {
    config.mongoose.options.auth = { authdb: config.MONGODB_AUTH_DB }
    config.mongoose.options.user = config.MONGODB_USER
    config.mongoose.options.pass = config.MONGODB_PASS
}

if (config.MONGODB_REPLICA_SET) {
    config.mongoose.dbUrl = `${config.mongoose.dbUrl}?replicaSet=${config.MONGODB_REPLICA_SET}`
}

module.exports = config

