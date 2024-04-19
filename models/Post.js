const mongoose = require("mongoose")
const Schema = mongoose.Schema

const postSchema = new Schema({
    title: { type: String, require: true },
    timestamp: { type: Date, default: Date.now },
    content: { type: String, require: true },
    user: { type: Schema.ObjectId, ref: 'User' }
})

module.exports = mongoose.model('Post', postSchema)