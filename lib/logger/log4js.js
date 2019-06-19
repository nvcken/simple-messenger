const log4js = require('log4js')
const config = require('./../config')
const path = require('path')
const env = process.env.NODE_ENV

// Default file log path
config.LOGGER_FILE_LOG_PATH = config.LOGGER_FILE_LOG_PATH || (global.__basedir + "/log/" + config.LOGGER_FILE_LOG_NAME)

const layout = {
    type: 'pattern',
    pattern: config.LOGGER_LAYOUT_PATTERN,
}

let appenders = []

if (config.LOGGER_ENABLE_FILE_LOG) {
    appenders.push('file')
}

if (config.LOGGER_ENABLE_CONSOLE_LOG) {
    appenders.push('console')
}

if (config.LOGGER_ENABLE_HTTP_LOG) {
    appenders.push('http')
}

log4js.configure({
    pm2: true,
    pm2InstanceVar: 'INSTANCE_ID',
    disableClustering: true, 
    appenders: {
        console: {
            type: 'console',
            layouts: layout,
        },
        file: {
            type: 'file',
            filename: config.LOGGER_FILE_LOG_PATH,
            maxLogSize: config.LOGGER_FILE_LOG_MAX_SIZE,
            backups: config.LOGGER_FILE_LOG_BACKUP_NUMBERS,
            layouts: layout,
        },
        http: {
            type: path.resolve(__dirname, './http-log'),
            url: config.LOGGER_HTTP_LOG_URL,
            layouts: layout,
        },
    },
    categories: {
        default: { appenders: ['console'], level: 'info' },
        [env]: { appenders: appenders, level: config.LOGGER_LEVEL }
    },
})

module.exports = log4js.getLogger(env)
