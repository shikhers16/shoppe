const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
	Product.fetchAll(products => {
		res.render('shop/product-list', {
			prods: products,
			pageTitle: 'All Products',
			path: '/products'
		});
	});
};
exports.getProduct = (req, res, next) => {
	const id = req.params.productid;
	Product.fetchbyID(id, product => res.render('shop/product-details', {
		pageTitle: product.title,
		product: product,
		path: "/products"
	}));
}
exports.getIndex = (req, res, next) => {
	Product.fetchAll(products => {
		res.render('shop/index', {
			prods: products,
			pageTitle: 'Shop',
			path: '/'
		});
	});
};

exports.getCart = (req, res, next) => {
	Cart.getCart(cart => {
		Product.fetchAll(products => {
			const cartProducts = [];
			for (product of products) {
				const cartProduct = cart.products.find(prod => prod.id === product.id);
				if (cartProduct) {
					cartProducts.push({
						...product,
						qty: cartProduct.qty
					});
				}
			}
			res.render('shop/cart', {
				path: '/cart',
				pageTitle: 'Your Cart',
				products: cartProducts,
				totalPrice: cart.totalPrice
			});
		});
	});

};

exports.postCart = (req, res, next) => {
	productId = req.body.productId;
	productQty = req.body.productQty;
	productPrice = req.body.productPrice;
	console.log(productId);
	Product.fetchbyID(productId, (product) => {
		Cart.addProduct(productId, productQty, product.price);

	})
	res.redirect('/cart');
};

exports.postCartDeleteProduct = (req, res, next) => {
	const productId = req.body.productId;
	Cart.deleteProduct(productId);
	res.redirect('/cart');
};

exports.getOrders = (req, res, next) => {
	res.render('shop/orders', {
		path: '/orders',
		pageTitle: 'Your Orders'
	});
};

exports.getCheckout = (req, res, next) => {
	res.render('shop/checkout', {
		path: '/checkout',
		pageTitle: 'Checkout'
	});
};