const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const User = require("../models/User")

module.exports = function (passport) {
    passport.use(new LocalStrategy((async (input, password, done) => {
        try {
            const user = await User.findOne({
                $or: [
                    { username: input },
                    { email: input }
                ]

            })
            if (!user) {
                return done(null, false, { message: "Invalid username of email " })
            }
            const hashedPasswd = user.password
            bcrypt.compare(password, hashedPasswd, (err, isMatch) => {
                if (err) throw err
                if (isMatch) {
                    return done(null, user)
                } else {
                    return done(null, false, { message: "Password incorrect!" })
                }
            })
        } catch (err) {
            console.log(err)
        }

    })
    )
    )

    passport.serializeUser((user, done) => {
        done(null, user.id)

    })

    passport.deserializeUser(async (userId, done) => {
        try {
            const user = await User.findById(userId)
            done(null, user)
        } catch (err) {
            console.log(err)
        }
    })

}