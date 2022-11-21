const express = require('express')
const { login, refresh, logout } = require('../controllers/AuthControllers')
const loginLimiter = require('../middleware/LoginLimiter')

const router = express.Router()

router.route('/')
    .post(loginLimiter, login)

router.route('/refresh')
    .get(refresh)

router.route('/logout')
    .post(logout)

module.exports = router