const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
	MongoClient.connect('mongodb+srv://shikher:Ekr9B36BtzzDuQDl@cluster0-vodl3.mongodb.net/shop?retryWrites=true', {
			useNewUrlParser: true
		})
		.then(client => {
			console.log('DB Connected');
			_db = client.db();
			callback();
		})
		.catch(err => {
			console.log(err);
			throw err;
		});
}

const getDB = () => {
	if (_db) {
		return _db;
	} else {
		throw 'No DB FOund';
	}
}

exports.mongoConnect = mongoConnect;
exports.getDB = getDB;