const passport = require("passport");
const User = require("../models/User");
const bcryptjs = require("bcryptjs")

module.exports = {
    homePage_get: function (req, res, next) {
        res.render('index')
    },
    dashboard_get: function (req, res, next) {
        res.render('dashboard', { username: req.user.username })
    },
    login_get: function (req, res, next) {
        res.render('login')
    },
    login_post: function (req, res, next) {

        if (!req.body.username || !req.body.password) {
            req.flash('error_msg', 'Please fill in all fields');
            return res.redirect('/login');
        }

        if (req.body.password.length < 6) {
            req.flash('error_msg', 'Password is too short');
            return res.redirect('/login');
        }


        passport.authenticate('local', {
            successRedirect: '/dashboard',
            failureRedirect: '/login',
            failureFlash: true
        })(req, res, next)

    },
    register_get: function (req, res, next) {
        res.render('register')
    },
    register_post: function (req, res, next) {
        // Handle registration

        const { username, email, password, confirmedPassword } = req.body;
        const errors = [];

        if (!username || !email || !password || !confirmedPassword) {
            errors.push({ msg: "Please fill in all fields!" })
        }

        if (password !== confirmedPassword) {
            errors.push({ msg: "Passwords don't match!" })
        }

        if (password.length < 6) {
            errors.push({ msg: "Password is too short, at least should be 6 characters" })
        }

        if (errors.length > 0) {

            res.render("register", {
                errors,
                username,
                email,
                password,
                confirmedPassword
            })
        } else {

            User.findOne({ email: email })
                .then(user => {
                    if (user) {
                        errors.push({ msg: "Email is already registered" })
                        res.render("register", {
                            errors,
                            username,
                            email,
                            password,
                            confirmedPassword
                        })
                    }
                    else {
                        const newUser = new User({
                            username: req.body.username,
                            email: req.body.email,
                            password: req.body.password
                        })


                        bcryptjs.genSalt(10, (err, salt) => {
                            bcryptjs.hash(password, salt, async (err, hash) => {
                                try {
                                    newUser.password = hash;
                                    await newUser.save()

                                    req.flash('success_msg', "You are now registered and can log in")
                                    res.redirect('/login')
                                } catch (err) {
                                    console.log(err)
                                }
                            })
                        })

                    }
                })
        }

    },
    logout_get: function (req, res, next) {
        req.logout(() => {
            req.flash('success_msg', "You logged out")
            res.redirect('/login')
        })
    }
}