const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    username: { type: String, require: true },
    email: { type: String, require: true },
    password: { type: String, require: true },
    membership: { type: Boolean, default: false },
    posts: [{ type: Schema.ObjectId, ref: 'Post' }],
    admin: { type: Boolean, default: false }
})


module.exports = mongoose.model('User', userSchema)