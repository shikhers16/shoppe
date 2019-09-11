const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	cart: {
		items: [{
			product: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Product',
				required: true
			},
			quantity: {
				type: Number,
				required: true
			}
		}]
	}
});

userSchema.methods.addToCart = function (product) {
	const cartProductIndex = this.cart.items.findIndex(cp => {
		return cp.product.toString() === product._id.toString();
	})
	let newQuantity = 1;
	const updatedCartItems = [...this.cart.items];

	if (cartProductIndex >= 0) {
		newQuantity = this.cart.items[cartProductIndex].quantity + 1;
		updatedCartItems[cartProductIndex].quantity = newQuantity;
	} else {
		updatedCartItems.push({
			product: product._id,
			quantity: newQuantity
		});

	}
	const updatedCart = {
		items: updatedCartItems
	};
	this.cart = updatedCart;
	return this.save();
}

userSchema.methods.removeFromCart = function (productId) {
	const cartItems = this.cart.items.filter(item => {
		return item.product.toString() !== productId.toString();
	});
	this.cart.items = cartItems;
	return this.save();
}

userSchema.methods.clearCart = function () {
	this.cart = {
		items: []
	};
	return this.save();
}

module.exports = mongoose.model('User', userSchema);

// const mongodb = require('mongodb');
// const ObjectID = mongodb.ObjectID;

// class User {
// 	constructor(username, email, cart, id) {
// 		this.username = username;
// 		this.email = email;
// 		this.cart = cart;
// 		this._id = id ? new ObjectID(id) : null
// 	}
// 	save() {
// 		const db = getDB();
// 		db.collection('users').insertOne(this)
// 	}

// 	addToCart(product) {
// 		const cartProductIndex = this.cart.items.findIndex(cp => {
// 			return cp.productId.toString() === product._id.toString();
// 		})
// 		let newQuantity = 1;
// 		const updatedCartItems = [...this.cart.items];

// 		if (cartProductIndex >= 0) {
// 			newQuantity = this.cart.items[cartProductIndex].quantity + 1;
// 			updatedCartItems[cartProductIndex].quantity = newQuantity;
// 		} else {
// 			updatedCartItems.push({
// 				productId: new ObjectID(product._id),
// 				quantity: newQuantity
// 			});

// 		}
// 		const updatedCart = {
// 			items: updatedCartItems
// 		};
// 		const db = getDB();
// 		return db
// 			.collection('users')
// 			.updateOne({
// 				_id: this._id
// 			}, {
// 				$set: {
// 					cart: updatedCart
// 				}
// 			});
// 	}

// 	getCart() {
// 		const db = getDB();
// 		const productsIds = this.cart.items.map(i => {
// 			return i.productId;
// 		})
// 		return db
// 			.collection('products')
// 			.find({
// 				_id: {
// 					$in: productsIds
// 				}
// 			})
// 			.toArray()
// 			.then(products => {
// 				return products.map(p => {
// 					return {
// 						...p,
// 						quantity: this.cart.items.find(i => {
// 							return i.productId.toString() === p._id.toString();
// 						}).quantity
// 					}
// 				})
// 			})
// 			.catch(err => console.log(err))
// 	}

// 	deleteItemFromCart(productId) {
// 		const updatedCartItems = this.cart.items.filter(item => {
// 			return item.productId.toString() !== productId.toString();
// 		});
// 		const db = getDB();
// 		return db
// 			.collection('users')
// 			.updateOne({
// 				_id: new ObjectID(this._id)
// 			}, {
// 				$set: {
// 					cart: {
// 						items: updatedCartItems
// 					}
// 				}
// 			})
// 	}

// 	addOrder() {
// 		const db = getDB();
// 		return this.getCart()
// 			.then((products) => {
// 				const order = {
// 					items: products,
// 					user: {
// 						_id: new ObjectID(this._id),
// 						username: this.username,
// 						email: this.email
// 					}
// 				};
// 				return db.collection('orders').insertOne(order);
// 			})
// 			.then((result) => {
// 				this.cart = {
// 					items: []
// 				};
// 				return db.collection('users')
// 					.updateOne({
// 						_id: this._id
// 					}, {
// 						$set: {
// 							cart: {
// 								items: []
// 							}
// 						}
// 					})
// 			})
// 			.catch(err => console.log(err));
// 	}
// 	getOrders() {
// 		const db = getDB();
// 		return db.collection('orders').find({
// 			'user._id': this._id
// 		}).toArray();
// 	}

// 	static findById(userId) {
// 		const db = getDB();
// 		return db.collection('users')
// 			.findOne({
// 				_id: new ObjectID(userId)
// 			})
// 			.then((user) => {
// 				console.log(user)
// 				return user
// 			})
// 			.catch(err => console.log(err));
// 	}
// }

// module.exports = User;