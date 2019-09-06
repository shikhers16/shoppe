//Core Modules

//3rd Party Modules
const express = require('express');

// Self Modules
//Controllers
const productsController = require('../controllers/products');

// Create Express Router
const router = express.Router();

// Routes
router.get('/', productsController.home);

router.get('/products', productsController.getProducts);

router.get('/cart', productsController.getCart);

router.post('/cart', productsController.postCart);

//Exports
module.exports = router;