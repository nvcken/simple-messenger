const mongoose = require('mongoose')

let Message = mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: true
    },
    send_to: {
        type: String,
        required: true,
        index: true
    },
    message: {
        type: String,
        required: true
    },
    create_at: { type: Date, default: Date.now },
    create_by: { type: String},
    update_at: { type: Date},
    update_by: { type: String}
})

function preUpdateUser(next) {
    let setObj = this._update.$set;
    if (!setObj.update_at) {
        setObj.update_at = new Date()
    }
    return next();
}

Message.pre('findOneAndUpdate', preUpdateUser);
Message.pre('update', preUpdateUser);

module.exports = global.dbConnection.model('Message', Message)
