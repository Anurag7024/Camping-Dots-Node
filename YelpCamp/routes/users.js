const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const middleware = require('../middleware');
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderlogin)
    .post(passport.authenticate('local', {failureFlash:true, failureRedirect:'/login'}),users.login)


router.get('/logout', users.logout)

module.exports = router;