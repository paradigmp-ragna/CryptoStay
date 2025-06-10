exports.requireLogin = (req, res, next) => {
    // Exclude /login from redirection
    if (req.session && req.session.user || req.url === '/login' || req.url === '/register') {
        return next();
    } else {
        return res.redirect('/login');
    }
};