const mongodb = require('mongodb');
const getDB = require('../util/database').getDB;

class Product {
	constructor(title, price, imageUrl, description, id, userId) {
		this.title = title;
		this.price = price;
		this.imageUrl = imageUrl;
		this.description = description;
		this._id = id ? new mongodb.ObjectID(id) : null
		this.userId = userId
	}

	save() {
		const db = getDB();
		let dbOperation;
		if (this._id) {
			//Update the Product
			dbOperation = db.collection('products').updateOne({
				_id: this._id
			}, {
				$set: this
			});
			console.log("Product Updated");
		} else {
			//Add New Product
			dbOperation = db.collection('products').insertOne(this);
			console.log("Product Added");
		}
		return dbOperation
			.then(result => {
				console.log(result);
			})
			.catch(err => console.log(err))
	}

	static findAll() {
		const db = getDB();
		return db.collection('products')
			.find()
			.toArray()
			.then((products) => {
				console.log(products);
				return products;
			})
			.catch(err => console.log(err));
	}
	static findById(productid) {
		const db = getDB();
		return db.collection('products')
			.find({
				_id: new mongodb.ObjectID(productid)
			})
			.next()
			.then((product) => {
				console.log(product);
				return product;
			})
			.catch(err => console.log(err));
	}
	static deleteById(productid) {
		const db = getDB();
		return db.collection('products')
			.deleteOne({
				_id: new mongodb.ObjectID(productid)
			})
			.then((result) => console.log("Product Deleted"))
			.catch(err => console.log(err));
	}
}

module.exports = Product;