var express = require('express');
var router = express.Router();
const indexController = require('../controllers/indexController')
const { ensureAuthenticated } = require('../auth/auth')

/* GET home page. */
router.get('/', indexController.homePage_get)

router.get('/dashboard', ensureAuthenticated, indexController.dashboard_get)

//Handle login
router.get('/login', indexController.login_get)

router.post('/login', indexController.login_post)

// Handle register
router.get('/register', indexController.register_get)

router.post('/register', indexController.register_post)

//  Handle logout

router.get('/logout', indexController.logout_get)

// Handle membership
router.get('/dashboard/membership', ensureAuthenticated, indexController.membership_get)

router.post('/dashboard/membership', indexController.membership_post)

// Handle create Post
router.get('/dashboard/createPost', ensureAuthenticated, indexController.createPost_get)
router.post('/dashboard/createPost', indexController.createPost_post)

// Handle Admin 
router.get('/dashboard/admin', ensureAuthenticated, indexController.admin_get)
router.post('/dashboard/admin', indexController.admin_post)

// Handle delete post
router.post('/deletePost', indexController.deletePost_post)

module.exports = router;
