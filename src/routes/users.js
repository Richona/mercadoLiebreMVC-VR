// ************ Require's ************
const express = require('express');
const router = express.Router();

// ************ Controller Require ************
const {profile, update, remove} = require('../controllers/usersController');

/* /users */
router
    .get('/profile', profile)
    .put('/update/:id', update)
    .delete('/remove/:id', remove)

module.exports = router;
