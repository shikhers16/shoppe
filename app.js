const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const mongoose = require('mongoose');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
	User.findById("5d78e1fe41ed7b54509bf090")
		.then(user => {
			req.user = user
			next();
		})
		.catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
	.connect('mongodb+srv://shikher:Ekr9B36BtzzDuQDl@cluster0-vodl3.mongodb.net/shop?retryWrites=true')
	.then(result => {
		User.findOne().then(user => {
			if (!user) {
				const user = new User({
					username: 'Shikher',
					email: 'shikher@test.com',
					cart: {
						items: []
					}
				})
				user.save();
			}
		})
		app.listen(3000);
	}).catch(err => console.log(err))