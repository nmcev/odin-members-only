const mongoose = require("mongoose")
const Schema = mongoose.Schema
const luxon = require('luxon')

const postSchema = new Schema({
    title: { type: String, require: true },
    timestamp: { type: Date, default: Date.now },
    content: { type: String, require: true },
    user: { type: Schema.ObjectId, ref: 'User' }
})

postSchema.virtual('postedTime').get(function (req, res, next)  {
    return luxon.DateTime.fromJSDate(this.timestamp).toLocaleString(luxon.DateTime.DATETIME_MED)
})
module.exports = mongoose.model('Post', postSchema)