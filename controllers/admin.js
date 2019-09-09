const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
	res.render('admin/edit-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
		editing: false
	});
};

exports.postAddProduct = (req, res, next) => {
	const title = req.body.title;
	const imageUrl = req.body.imageUrl;
	const price = req.body.price;
	const description = req.body.description;
	const product = new Product(null, title, imageUrl, price, description);
	product.save();
	res.redirect('/admin/products');
};

exports.getEditProduct = (req, res, next) => {
	const editMode = req.query.edit;
	if (!editMode) {
		return res.redirect('/admin/products');
	}
	const productId = req.params.productId;
	Product.fetchbyID(productId, product => {
		if (!product) {
			return res.redirect('/admin/products');
		}
		res.render('admin/edit-product', {
			pageTitle: 'Edit Product',
			path: '/admin/edit-product',
			editing: editMode,
			product: product
		});
	})
};

exports.postEditProduct = (req, res, next) => {
	const productId = req.body.productId;
	const title = req.body.title;
	const imageUrl = req.body.imageUrl;
	const price = req.body.price;
	const description = req.body.description;
	const updatedProduct = new Product(productId, title, imageUrl, price, description);
	updatedProduct.save();
	res.redirect('/admin/products');
}

exports.postdeleteProduct = (req, res, next) => {
	const productId = req.body.productId;
	Product.deleteProductbyID(productId);
	res.redirect('/admin/products');
}

exports.getProducts = (req, res, next) => {
	Product.fetchAll(products => {
		res.render('admin/products', {
			prods: products,
			pageTitle: 'Admin Products',
			path: '/admin/products'
		});
	});
};