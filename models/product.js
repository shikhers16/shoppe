// Core Modules
const fs = require('fs');
const path = require('path');

//const products = [];
const p = path.join(path.dirname(process.mainModule.filename), 'data', 'products.json')

const getProductsFromFile = cb => {
    let products = [];
    fs.readFile(p, (err, data) => {
        if (err) {
            return cb([]);
        }

        cb(JSON.parse(data));
    });
}

module.exports = class Product {
    constructor(title) {
        this.title = title;
    }

    save() {
        getProductsFromFile(products => {
            products.push(this);
            fs.writeFile(p, JSON.stringify(products), (err) => console.log(err));
        });

        //products.push(this);
    }
    static fetchAll(cb) {
        getProductsFromFile(cb);
    }
}