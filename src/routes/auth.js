// ************ Require's ************
const express = require('express');
const router = express.Router();

// ************ Controller Require ************
const {processRegister, processLogin} = require('../controllers/authController');

/* /users */
router
    .post('/register', processRegister)
    .post('/login', processLogin)

module.exports = router;
