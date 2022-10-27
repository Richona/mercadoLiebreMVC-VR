// ************ Require's ************
const express = require('express');
const router = express.Router();

// ************ Controller Require ************
const {index} = require('../controllers/mainController');

router.get('/', index); 

module.exports = router;
