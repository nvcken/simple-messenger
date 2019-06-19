const mongoose = require('mongoose' );
const logger = require('./../logger')
mongoose.Promise = require('bluebird')

let connection = function() {}

connection.prototype.connect = function(uri, options) {
    if (typeof(options)==='undefined') options = {};

    options.useMongoClient = true

    var connection = mongoose.createConnection(uri, options);

    connection.on('connected', function () {
        logger.info('mongoose-connection::connected:' + uri)
    });

    connection.on('disconnected', function () {
        logger.error('mongoose-connection::disconnected:' + uri)
    });

    connection.on('reconnected', function () {
        logger.warn('mongoose-connection::reconnected:' + uri)
    });

    connection.on('error',function (error) {
        logger.error('mongoose-connection::' + uri + '::error: ' + error)
    });

    // If the Node process ends, close the Mongoose connection
    process.on('SIGINT', function() {
        mongoose.connection.close(function () {
            logger.warn('mongoose-connection::disconnected:' + uri + '::reason:' + uri)
            process.exit(0);
        });
    });

    return connection;
}

module.exports = new connection();
