const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator/check');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
	auth: {
		api_key: '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'
	}
}));

exports.getLogin = (req, res, next) => {
	res.render('auth/login', {
		path: '/login',
		pageTitle: 'Login',
		isAuthenticated: false,
		email: "",
		validationErrors: []
	});
};

exports.getSignup = (req, res, next) => {
	res.render('auth/signup', {
		path: '/signup',
		pageTitle: 'Signup',
		isAuthenticated: false,
		email: "",
		validationErrors: []
	});
};

exports.postLogin = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		req.flash('error', 'All fields are required.');
		return res.status(422).render('auth/login', {
			path: '/login',
			pageTitle: 'Login',
			isAuthenticated: false,
			errorMessage: errors.array()[0].msg,
			email: email,
			validationErrors: errors.array()
		});
	}
	User.findOne({
		email: email
	})
		.then(user => {
			if (!user) {
				return res.status(422).render('auth/login', {
					path: '/login',
					pageTitle: 'Login',
					errorMessage: 'Incorrect e-mail or password',
					email: email,
					validationErrors: []
				});
			}
			bcrypt.compare(password, user.password).then(match => {
				if (match) {
					req.session.isLoggedIn = true;
					req.session.user = user;
					return req.session.save(err => {
						console.log(err);
						res.redirect('/');
					});
				}
				return res.status(422).render('auth/login', {
					path: '/login',
					pageTitle: 'Login',
					errorMessage: 'Incorrect e-mail or password',
					email: email,
					validationErrors: []
				});
			})
				.catch(err => {
					const error = new Error(err);
					error.httpStatusCode = 500;
					return next(error);
					console.log(err);
					req.flash('error', 'Login Error, Please Try Again');
					return res.redirect('/login');
				});
		})
		.catch(err => {
			console.log(err);
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.postSignup = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors.array());
		return res.status(422).render('auth/signup', {
			path: '/signup',
			pageTitle: 'Signup',
			errorMessage: errors.array()[0].msg,
			email: email,
			validationErrors: errors.array()
		});
	}
	return bcrypt.hash(password, 12).then(hashedPassword => {
		const user = new User({
			email: email,
			password: hashedPassword,
			cart: {
				items: []
			}
		});
		return user.save();
	})
		.then((result) => {
			console.log(result);
			req.flash('error', 'Signup Successful, check your email to verify account.');
			res.redirect('/login');
			return transporter.sendMail({
				to: email,
				from: 'shop@node-complete.com',
				subject: 'Shop Signup Successful',
				html: '<h1>You successfully Signed up for Shop</h1>'
			})
		}).catch(err => {
			console.log(err);
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.postLogout = (req, res, next) => {
	req.session.destroy(err => {
		console.log(err);
	});
};

exports.getReset = (req, res, next) => {
	res.render('auth/reset', {
		path: '/reset',
		pageTitle: 'Reset',
		isAuthenticated: false,
		email: ""
	});
}

exports.postReset = (req, res, next) => {
	crypto.randomBytes(32, (err, buffer) => {
		if (err) {
			console.log(err);
			req.flash('error', 'Password Reset Error, Please Try Again!');
			return res.redirect('/reset');
		}
		const token = buffer.toString('hex');
		User.findOne({ email: req.body.email })
			.then((user) => {
				if (!user) {
					req.flash('error', 'No account with that email found');
					res.status(422).render('auth/reset', {
						path: '/reset',
						pageTitle: 'Reset',
						isAuthenticated: false,
						email: req.body.email
					});
				}
				user.reset = {
					token: token,
					expiration: Date.now() + 3600000
				}
				return user.save();
			})
			.then((name) => {
				res.redirect('/');
				transporter.sendMail({
					to: req.body.email,
					from: 'shop@node-complete.com',
					subject: 'Shop Password Reset',
					html: `
					<h1>You requested a password reset </h1>
					<p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
					`
				})
			})
			.catch(err => {
				console.log(err);
				const error = new Error(err);
				error.httpStatusCode = 500;
				return next(error);
			});
	})
}

exports.getNewPassword = (req, res, next) => {
	const token = req.params.token;
	User.findOne({
		'reset.token': token,
		'reset.expiration': { $gt: Date.now() }
	})
		.then((user) => {
			if (!user) {
				req.flash('error', '');
				res.redirect('/');
			}
			res.render('auth/new-password', {
				path: '/new-password',
				pageTitle: 'new-password',
				userId: user._id,
				token: token
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
			console.log(err)
		});
}

exports.postNewPassword = (req, res, next) => {
	const newPassword = req.body.password;
	const userId = req.body.userId;
	console.log(userId);
	const token = req.body.token;
	let resetUser;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors.array());
		return res.status(422).render('auth/new-password', {
			path: '/new-password',
			pageTitle: 'new-password',
			errorMessage: errors.array()[0].msg,
			email: email,
		});
	}
	User.findOne({
		'reset.token': token,
		'reset.expiration': { $gt: Date.now() },
		_id: userId
	})
		.then((user) => {
			if (!user) {
				console.log(user);
				return res.redirect('/');
			}
			resetUser = user;
			return bcrypt.hash(newPassword, 12)
				.then((hashedPassword) => {
					resetUser.password = hashedPassword;
					resetUser.reset.token = undefined;
					resetUser.reset.expiration = undefined;
					return resetUser.save();
				})
				.then(result => {
					res.redirect('/login');
				})
		})
		.catch(err => {
			console.log(err);
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
}