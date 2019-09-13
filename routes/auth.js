const express = require('express');
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const isnotauth = require('../middleware/auth').isnotauth;
const router = express.Router();

const User = require('../models/user');

router.get('/login', isnotauth, authController.getLogin);

router.get('/signup', isnotauth, authController.getSignup);

router.get('/reset', isnotauth, authController.getReset);

router.get('/reset/:token', isnotauth, authController.getNewPassword);

router.post('/login', isnotauth, [
    body('email')
        .isEmail()
        .withMessage('Please enter a valud email')
        .normalizeEmail(),
    body('password', 'Password should be atleast 6 characters long')
        .trim()
        .isLength({ min: 6 })
], authController.postLogin);

router.post('/signup', isnotauth, [
    check('email')
        .isEmail()
        .withMessage('Please enter a Valid email')
        .custom((value, { req }) => {
            return User.findOne({
                email: value
            })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('Email already exists, please login or use a different email')
                    }
                })
        }).normalizeEmail(),
    body('password', 'Password should be atleast 6 characters long')
        .trim()
        .isLength({ min: 6 }),
    body('confirmPassword')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords should match');
            }
            return true;
        })
], authController.postSignup);

router.post('/reset', isnotauth, authController.postReset);

router.post('/new-password', isnotauth, [
    body('password', 'Password should be atleast 6 characters long')
        .trim()
        .isLength({ min: 6 }),
    body('confirmPassword')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords should match');
            }
            return true;
        })], authController.postNewPassword);

router.post('/logout', isnotauth, authController.postLogout);

module.exports = router;