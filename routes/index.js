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
module.exports = router;
