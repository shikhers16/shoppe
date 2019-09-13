const { validationResult } = require('express-validator/check');

const Product = require('../models/product');
const fileHelper = require('../util/file');

const ITEMS_PER_PAGE = require('../util/item');

exports.getAddProduct = (req, res, next) => {
	res.render('admin/edit-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
		editing: false,
		isAuthenticated: req.session.isLoggedIn,
		hasError: false,
		errorMessage: null,
		validationErrors: []
	});
};

exports.postAddProduct = (req, res, next) => {
	const title = req.body.title;
	const image = req.file;
	const price = req.body.price;
	const description = req.body.description;
	if (!image) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Edit Product',
			path: '/admin/edit-product',
			editing: true,
			isAuthenticated: req.session.isLoggedIn,
			hasError: true,
			errorMessage: 'Attached File is not an image',
			product: {
				title: title,
				price: price,
				description: description,
			},
			validationErrors: []
		});
	}
	const errors = validationResult(req);
	console.log(image);
	if (!errors.isEmpty()) {
		console.log(errors.array());
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Add Product',
			path: '/admin/add-product',
			editing: false,
			isAuthenticated: req.session.isLoggedIn,
			hasError: true,
			errorMessage: errors.array()[0].msg,
			product: {
				title: title,
				price: price,
				description: description
			},
			validationErrors: errors.array()
		});
	}
	const product = new Product({
		title: title,
		price: price,
		description: description,
		imageUrl: '/' + image.path,
		userId: req.user
	});
	product
		.save()
		.then(result => {
			// console.log(result);
			console.log('Created Product');
			res.redirect('/admin/products');
		})
		.catch(err => {
			console.log(err);
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getEditProduct = (req, res, next) => {
	const editMode = req.query.edit;
	if (!editMode) {
		return res.redirect('/');
	}
	const prodId = req.params.productId;
	Product.findById(prodId)
		.then(product => {
			if (!product || product.userId.toString() !== req.user._id.toString()) {
				return res.redirect('/');
			}
			res.render('admin/edit-product', {
				pageTitle: 'Edit Product',
				path: '/admin/edit-product',
				editing: editMode,
				product: product,
				isAuthenticated: req.session.isLoggedIn,
				hasError: false,
				errorMessage: null,
				validationErrors: []
			});
		})
		.catch(err => {
			console.log(err);
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.postEditProduct = (req, res, next) => {
	const prodId = req.body.productId;
	const updatedTitle = req.body.title;
	const updatedPrice = req.body.price;
	const updatedimage = req.file;
	const updatedDesc = req.body.description;

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors.array());
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Edit Product',
			path: '/admin/edit-product',
			editing: true,
			isAuthenticated: req.session.isLoggedIn,
			hasError: true,
			errorMessage: errors.array()[0].msg,
			product: {
				title: updatedTitle,
				price: updatedPrice,
				description: updatedDesc,
				_id: prodId
			},
			validationErrors: errors.array()
		});
	}
	Product.findById(prodId)
		.then(product => {
			if (product.userId.toString() !== req.user._id.toString()) {
				return res.redirect('/');
			}
			product.title = updatedTitle;
			product.price = updatedPrice;
			product.description = updatedDesc;
			if (updatedimage) {
				fileHelper.deleteFile(product.imageUrl);
				product.imageUrl = '/' + updatedimage.path;
			}
			return product.save().then(result => {
				console.log('UPDATED PRODUCT!');
				res.redirect('/admin/products');
			})
		})
		.catch(err => {
			console.log(err);
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getProducts = (req, res, next) => {
	let page = +req.query.page || 1;
	let totalItems;
	Product.find({ userId: req.user._id })
		.countDocuments()
		.then(numProducts => {
			totalItems = numProducts;
			return Product.find({ userId: req.user._id })
				// .select('title price -_id')
				// .populate('userId', 'name')
				.skip((page - 1) * ITEMS_PER_PAGE)
				.limit(ITEMS_PER_PAGE)
		})
		.then(products => {
			res.render('admin/products', {
				prods: products,
				pageTitle: 'Admin Products',
				path: '/admin/products',
				currentPage: page,
				hasNextPage: ITEMS_PER_PAGE * page < totalItems,
				hasPreviousPage: page > 1,
				nextPage: (page + 1),
				previousPage: (page - 1),
				lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
			});
		})
		// Product.find({ userId: req.user._id })
		// 	// .select('title price -_id')
		// 	// .populate('userId', 'name')
		// 	.then(products => {
		// 		console.log(products);
		// 		res.render('admin/products', {
		// 			prods: products,
		// 			pageTitle: 'Admin Products',
		// 			path: '/admin/products',
		// 			isAuthenticated: req.session.isLoggedIn,
		// 			hasError: false,
		// 			errorMessage: null
		// 		});
		// 	})
		.catch(err => {
			console.log(err);
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.deleteProduct = (req, res, next) => {
	const prodId = req.params.productId;
	Product.findById(prodId).then((product) => {
		if (!product) {
			return next(new Error("Product Not Found"));
		}
		fileHelper.deleteFile(product.imageUrl);
		return Product.deleteOne({ _id: prodId, userId: req.user._id });
	})
		.then(() => {
			console.log('DESTROYED PRODUCT');
			res.status(200).json({ message: "Success", status: true });
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({ message: "Failure", status: false });
		});
};