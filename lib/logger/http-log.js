'use strict'

const request = require('request')

const httpAppender = (config, layout) => {
    return (loggingEvent) => {
        let message
        if (config.object && config.object === true) { // log message is an object
            if (config.addLevel && config.addLevel === true) { // auto add level to object
                if (!loggingEvent.data[0].level) {
                    loggingEvent.data[0].level = loggingEvent.level.levelStr
                }
            }
            message = JSON.stringify(loggingEvent.data[0])
        } else {
            // log4js format
            message = layout(loggingEvent)
        }

        let body = {
            name: 'myapp',
            version: '1.0',
            env: process.env.NODE_ENV,
            level: loggingEvent.level.levelStr,
            message: message,
            publicip: global.publicip,
            privateip: global.privateip,
            hostname: global.hostname,
            timestamp: new Date().toISOString()
        }

        let options = {
            method: 'POST',
            url: config.url || 'http://localhost',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(body)
        }

        request(options, function(error, response, body){
            if (error || response.statusCode != 202) {
                console.error('Log Server Error: ' + error);
            }
        })
    }
}

const configure = (config, layouts) => {
    let layout = layouts.messagePassThroughLayout
    if (config.layout) {
        layout = layouts.layout(config.layout.type, config.layout)
    }
    return httpAppender(config, layout)
}

module.exports.configure = configure
module.exports.appender = httpAppender
