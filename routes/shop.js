//Core Modules
const path = require('path');

//3rd Party Modules
const express = require('express');

// Self Modules
const rootDir = require('../util/path');
const adminData = require('./admin');

const router = express.Router();

router.get('/', (req, res, next) => {
    console.log('shop,js', adminData.products);
    res.sendFile(path.join(rootDir, 'views', 'shop.html'));
});

module.exports = router;