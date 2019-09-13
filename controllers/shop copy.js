const path = require('path');
const fs = require('fs');

const PDFDocument = require('pdfkit');
const stripe = require('stripe')('sk_test_GUAMe8D1sQ5GzjToGmlYg04300mdZdY1je');

const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = require('../util/item');

exports.getProducts = (req, res, next) => {
	Product.find()
		.then(products => {
			console.log(products);
			res.render('shop/product-list', {
				prods: products,
				pageTitle: 'All Products',
				path: '/products'
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
			console.log(err);
		});
};

exports.getProduct = (req, res, next) => {
	const prodId = req.params.productId;
	Product.findById(prodId)
		.then(product => {
			res.render('shop/product-detail', {
				product: product,
				pageTitle: product.title,
				path: '/products'
			});
		})
		.catch(err => {
			console.log(err);
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getIndex = (req, res, next) => {
	let page = +req.query.page || 1;
	let totalItems;
	Product.find()
		.countDocuments()
		.then(numProducts => {
			totalItems = numProducts;
			return Product.find()
				.skip((page - 1) * ITEMS_PER_PAGE)
				.limit(ITEMS_PER_PAGE)
		})
		.then(products => {
			res.render('shop/index', {
				prods: products,
				pageTitle: 'Shop',
				path: '/',
				currentPage: page,
				hasNextPage: ITEMS_PER_PAGE * page < totalItems,
				hasPreviousPage: page > 1,
				nextPage: (page + 1),
				previousPage: (page - 1),
				lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
			console.log(err);
		});
};

exports.getCart = (req, res, next) => {
	req.user
		.populate('cart.items.productId')
		.execPopulate()
		.then(user => {
			const products = user.cart.items;
			res.render('shop/cart', {
				path: '/cart',
				pageTitle: 'Your Cart',
				products: products
			});
		})
		.catch(err => {
			console.log(err);
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.postCart = (req, res, next) => {
	const prodId = req.body.productId;
	Product.findById(prodId)
		.then(product => {
			return req.user.addToCart(product);
		})
		.then(result => {
			console.log(result);
			res.redirect('/cart');
		});
};

exports.postCartDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId;
	req.user
		.removeFromCart(prodId)
		.then(result => {
			res.redirect('/cart');
		})
		.catch(err => {
			console.log(err);
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getCheckout = (req, res, next) => {
	let products; // THIS WAS MOVED - had to put it here, to make it accessible by all then() blocks.
	let total = 0;// THIS WAS MOVED - had to put it here, to make it accessible by all then() blocks.
	req.user
		.populate('cart.items.productId')
		.execPopulate()
		.then(user => {
			products = user.cart.items;
			products.forEach(p => {
				const cost = parseFloat((p.quantity * p.productId.price).toFixed(2));
				total += cost;
			});
			return stripe.checkout.sessions.create({ // THIS WAS ADDED - configures a Stripe session
				payment_method_types: ['card'],
				line_items: products.map(p => {
					return {
						name: p.productId.title,
						description: p.productId.description,
						amount: parseFloat((p.productId.price * 100).toFixed(2)),
						currency: 'usd',
						quantity: p.quantity
					};
				}),
				success_url: 'http://localhost:3000/checkout/success', // THIS WAS ADDED
				cancel_url: 'http://localhost:3000/checkout/cancel' // THIS WAS ADDED
			});
		})
		.then(session => {
			console.log(session);
			res.render('shop/checkout', {
				path: '/checkout',
				pageTitle: 'Checkout',
				products: products,
				total: total,
				sessionId: session.id // THIS WAS ADDED - we need that in the checkout.ejs file (see above)
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getCheckoutSuccess = (req, res, next) => {
	let totalSum = 0;
	req.user
		.populate('cart.items.productId')
		.execPopulate()
		.then(user => {
			user.cart.items.forEach(p => {
				totalSum += p.quantity * p.productId.price;
			});
			const products = user.cart.items.map(i => {
				return { quantity: i.quantity, product: { ...i.productId._doc } };
			});
			const order = new Order({
				user: {
					email: req.user.email,
					userId: req.user
				},
				products: products,
				paid: true
			});
			return order.save();
		})
		.then(() => {
			return req.user.clearCart();
		})
		.then(() => {
			res.redirect('/orders');
		})
		.catch(err => {
			const error = new Error(err);
			console.log(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};
exports.postOrder = (req, res, next) => {
	// Token is created using Checkout or Elements!
	// Get the payment token ID submitted by the form:
	const token = req.body.stripeToken; // Using Express
	let totalPrice = 0;
	req.user
		.populate('cart.items.productId')
		.execPopulate()
		.then(user => {
			const products = user.cart.items.map(i => {
				return {
					quantity: i.quantity,
					product: {
						...i.productId._doc
					}
				};
			});
			products.forEach(prod => {
				const total = parseFloat((prod.product.price * prod.quantity).toFixed(2));
				totalPrice += total;
			});
			const order = new Order({
				user: {
					email: req.user.email,
					userId: req.user
				},
				products: products,
				paid: false
			});
			return order.save();
		})
		.then(result => {
			const charge = stripe.charges.create({
				amount: totalPrice * 100,
				currency: 'usd',
				description: 'Shop',
				source: token,
				metadata: { order_id: result._id.toString() }
			});
			result.paid = true;
			console.log(result);
			return result.save();
		})
		.then(result => {
			return req.user.clearCart()
		})
		.then(() => {
			res.redirect('/orders');
		})
		.catch(err => {
			console.log(err);
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getOrders = (req, res, next) => {
	Order.find({
		'user.userId': req.user._id
	})
		.then(orders => {
			res.render('shop/orders', {
				path: '/orders',
				pageTitle: 'Your Orders',
				orders: orders
			});
		})
		.catch(err => {
			console.log(err);
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getInvoice = (req, res, next) => {
	const orderid = req.params.orderid;
	Order.findById(orderid).then((order) => {
		if (!order) {
			return (next(new Error("No order found by that id.")));
		}
		if (order.user.userId.toString() !== req.user._id.toString()) {
			return next(new Error("UnAuthorized!"));
		}
		const invoiceName = `invoice-${orderid}.pdf`;
		const invoicePath = path.join('data', 'invoices', invoiceName);

		const doc = new PDFDocument();
		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Disposition', `inline; filename=${invoiceName}`);

		doc.pipe(fs.createWriteStream(invoicePath));
		doc.pipe(res);

		doc
			.font('Helvetica-Bold')
			.fontSize(26)
			.text('INVOICE', { align: 'center', underline: true })
			.text('________________________________');
		//doc.text('-----------------------------------------------------', {lineBreak: true});
		let totalPrice = 0
		let c = 1;
		order.products.forEach(prod => {
			const total = parseFloat((prod.product.price * prod.quantity).toFixed(2));
			totalPrice += total;
			doc
				//.font('Helvetica')
				//.fontSize(14).text('-                                                              -')
				.font('Helvetica')
				.fontSize(14).text('                                                              ')
				.font('Helvetica')
				.fontSize(14).text(`${c}. ${prod.product.title}`, { continued: true })
				.font('Helvetica-Bold')
				.text(`$${prod.product.price} X ${prod.quantity} = $${total}`, { align: 'right' })
				.font('Helvetica')
				.fontSize(14).text('                                                              ');
			c++;
		});
		doc
			.font('Helvetica-Bold')
			.fontSize(20).text(`---------------------------------------------------------------------`)
			.text(`Total : $${parseFloat((totalPrice).toFixed(2))}`, { align: 'right' });
		doc.end();
	})
		.catch(err => next(err));
}