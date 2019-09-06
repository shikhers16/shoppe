//Core Modules
const path = require('path');

//3rd Party Modules
const express = require('express');

// Self Modules
//Controllers
const productsController = require('../controllers/products');

// Create Express Router
const router = express.Router();

// Routes
router.get('/add-product', productsController.getAddProducts);

router.post('/add-product', productsController.postAddProducts);

//exports
module.exports = router;