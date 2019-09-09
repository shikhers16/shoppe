const fs = require('fs');
const path = require('path');


const Cart = require('./cart');

const p = path.join(
	path.dirname(process.mainModule.filename),
	'data',
	'products.json'
);

const getProductsFromFile = cb => {
	fs.readFile(p, (err, fileContent) => {
		if (err) {
			cb([]);
		} else {
			cb(JSON.parse(fileContent));
		}
	});
};

module.exports = class Product {
	constructor(id, title, imageUrl, price, description) {
		this.id = id;
		this.title = title;
		this.imageUrl = imageUrl;
		this.description = description;
		this.price = price;
	}

	save() {
		getProductsFromFile(products => {
			const updatedProducts = [...products];
			if (this.id) {
				const existingProductIndex = products.findIndex(prod => prod.id === this.id);
				updatedProducts[existingProductIndex] = this;
			} else {
				this.id = (Math.random() * 10000).toString();
				updatedProducts.push(this);
			}
			fs.writeFile(p, JSON.stringify(updatedProducts), err => {
				console.log(err);
			});
		});
	}

	static fetchAll(cb) {
		getProductsFromFile(cb);
	}
	static fetchbyID(id, cb) {
		getProductsFromFile(products => {
			const product = products.find(p => p.id === id);
			cb(product);
		});
	}

	static deleteProductbyID(id) {
		getProductsFromFile((products) => {
			const updatedProducts = products.filter(prod => prod.id !== id);
			console.log('Deleting', id);
			fs.writeFile(p, JSON.stringify(updatedProducts), err => {
				if (!err) {
					Cart.deleteProduct(id)
				}
			});
		});
	}
}