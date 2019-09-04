//Core Modules
const path = require('path');

//3rd Party Modules
const express = require('express');

const products = [];

// Self Modules
const rootDir = require('../util/path');

const router = express.Router();

router.get('/add-product', (req, res, next) => {
    //console.log(__dirname, __filename);
    res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
});
router.post('/add-product', (req, res, next) => {
    products.push(req.body);
    res.redirect('/admin/add-product');
});
exports.router = router;
exports.products = products;