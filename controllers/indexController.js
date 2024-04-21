const passport = require("passport");
const User = require("../models/User");
const Post = require("../models/Post");
const bcryptjs = require("bcryptjs")
const { body, validationResult } = require("express-validator");

require('dotenv').config()

module.exports = {
    homePage_get: function (req, res, next) {
        res.render('index', { title: 'Home' })
    },
    dashboard_get: function (req, res, next) {
        res.render('dashboard', { username: req.user.username, title: 'Dashboard' })
    },
    login_get: function (req, res, next) {
        res.render('login', { title: 'Login' })
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

        req.flash('error_msg', 'Invalid username or password')
    },
    register_get: function (req, res, next) {
        res.render('register', { title: 'Register' })
    },
    register_post: [
        body('username')
            .trim()
            .isLength({ min: 3 })
            .escape()
            .withMessage('Username must be at least 3 characters'),
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email'),

        body('password')
            .isLength({ min: 6 })
            .trim()
            .withMessage('Password must be at least 6 characters'),
        body('confirmedPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match')
            }
            return true
        }),
        async function (req, res, next) {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                res.render('register', { errors: errors.array(), title: 'Register' })
            } else {
                const user = await User.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] })
                if (user) {
                    req.flash('error_msg', 'Username or email already exists')
                    return res.redirect('/register')
                }

                const newUser = new User({
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password
                })

                bcryptjs.genSalt(10, (err, salt) => {
                    bcryptjs.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err
                        newUser.password = hash
                        newUser.save()
                            .then(user => {
                                req.flash('success_msg', 'You are now registered and can log in!')
                                res.redirect('/login')
                            })
                            .catch(err => console.log(err))
                    })
                })

            }
        }
    ],
    logout_get: function (req, res, next) {
        req.logout(() => {
            req.flash('success_msg', "You logged out successfully!")
            res.redirect('/login')
        })
    },
    membership_get: function (req, res, next) {
        res.render('membership', { title: "membership" })
    },
    membership_post: async function (req, res, next) {
        const { membershipCode } = req.body

        if (membershipCode === process.env.MEMBERSHIP_CODE) {
            const user = await User.findOneAndUpdate({ _id: req.user._id }, { membership: true })
            console.log(user)
            req.flash('success_msg', 'You are now a member!')
            return res.redirect('/dashboard')
        }

        req.flash('error_msg', 'Invalid code')
        res.redirect('/dashboard/membership')

    },
    createPost_get: function (req, res, next) {
        res.render('create_post', { title: 'Create Post' })
    },

    createPost_post: [
        body('postTitle')
            .trim()
            .isLength({ min: 2 })
            .escape()
            .withMessage('Title must be at least 2 characters'),
        body('postContent')
            .isLength({ min: 2 })
            .trim()
            .withMessage('Content must be at least 2 characters'),
        async function (req, res, next) {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                res.render('create_post', { errors: errors.array(), title: 'Create Post' })
            } else {
                const newPost = new Post({
                    title: req.body.postTitle,
                    content: req.body.postContent,
                    timestamp: new Date(),
                    user: req.user._id
                })

                await newPost.save();
                await User.findOneAndUpdate({ _id: req.user._id }, { $push: { posts: newPost._id } })
                req.flash('success_msg', 'Post created successfully!')
                res.redirect('/dashboard')
            }
        }

    ]
}