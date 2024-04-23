var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const ejsLayout = require('express-ejs-layouts')
const session = require('express-session')
const passport = require('passport')
const mongoose = require('mongoose')
const { debug } = require('console')
const flash = require("connect-flash")
const Post = require('./models/Post')
const indexRouter = require('./routes/index');

require('./auth/index')(passport)
require('dotenv').config()

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const mongoDB = process.env.MongoURI

async function main() {
  try {
    await mongoose.connect(mongoDB)
    debug("Connected to the database")
  }
  catch (err) {
    debug(err)
  }
}
main().catch(err => debug(err))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ejs layout
app.use(ejsLayout)

// express session
app.use(session({
  secret: "cats",
  resave: false,
  saveUninitialized: true
}))

app.use(passport.session())
// connect to flash
app.use(flash())

const defaultAvatar = process.env.AVATAR

// global variables
app.use(async (req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  res.locals.user = req.user || null
  res.locals.userAvatar = defaultAvatar

  if (req.user) {
    res.locals.membership = req.user.membership
    res.locals.admin = req.user.admin
    // get the posts from the user
    const populatedQuery = await req.user.populate('posts')
    res.locals.userPosts = populatedQuery.posts.reverse()
  }

  const allPosts = await Post.find().populate('user').sort({ timestamp: -1 })
  res.locals.allPosts = allPosts
  next()
})

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
