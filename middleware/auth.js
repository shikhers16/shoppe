exports.isauth = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        res.redirect('/login');
    }
    next();
}

exports.isnotauth = (req, res, next) => {
    if (req.session.isLoggedIn) {
        res.redirect('/');
    }
    next();
}