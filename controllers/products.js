//Self Modules
// Models
const Product = require('../models/product');

exports.getAddProducts = (req, res, next) => {
    //console.log(__dirname, __filename);
    //res.sendFile(path.join(__dirname, '..', 'views', 'add-product.html'));
    res.render('admin/add-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product'
    });
}

exports.postAddProducts = (req, res, next) => {
    const product = new Product(req.body.title);
    product.save();
    res.redirect('/admin/add-product');
}

exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('shop/product-list', {
            pageTitle: 'Shop',
            products: products,
            path: '/',
            hasProducts: products.length > 0
        });
        //res.sendFile(path.join(rootDir, 'views', 'shop.html'));
    });

}