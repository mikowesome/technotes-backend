const express = require('express')
const { getAllUsers, createNewUser, updateUser, deleteUser } = require('../controllers/UserControllers')
const verifyJWT = require('../middleware/verifyJWT')
const router = express.Router()

router.use(verifyJWT)

router.route('/')
    .get(getAllUsers)
    .post(createNewUser)
    .put(updateUser)
    .delete(deleteUser)

module.exports = router