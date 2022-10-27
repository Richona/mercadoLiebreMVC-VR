// ************ Require's ************
const express = require('express');
const router = express.Router();

// ************ Controller Require ************
const {index, store, detail, update, destroy} = require('../controllers/productsController');

/* products */

router
    .get('/', index)
    .post('/', store)
    .get('/:id', detail)
    .put('/:id', update)
    .delete('/:id', destroy)


module.exports = router;
