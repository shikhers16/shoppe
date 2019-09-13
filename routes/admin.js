const path = require('path');

const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');
const isauth = require('../middleware/auth').isauth;

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isauth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isauth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', isauth, [
    body('title', 'Please enter a valid Title')
        .trim()
        .isString()
        .isLength({ min: 3 }),
    // body('imageUrl', 'Please enter a valid URL')
    //     .isMimeType('image/png'),
    body('price', 'Please enter a Price upto 2 decimal places')
        .isFloat(),
    body('description', 'Please enter a valid Description (between 5 and 400 chars)')
        .trim()
        .isLength({ min: 5, max: 400 })
], adminController.postAddProduct);

router.get('/edit-product/:productId', isauth, adminController.getEditProduct);

router.post('/edit-product', isauth, [
    body('title', 'Please enter a valid Title')
        .trim()
        .isString()
        .isLength({ min: 3 }),
    // body('imageUrl', 'Please enter a valid URL')
    //     .isMimeType('image'),
    body('price', 'Please enter a Price upto 2 decimal places')
        .isFloat(),
    body('description', 'Please enter a valid Description (between 5 and 400 chars)')
        .trim()
        .isLength({ min: 5, max: 400 })
], adminController.postEditProduct);

router.delete('/products/:productId', isauth, adminController.deleteProduct);

module.exports = router;