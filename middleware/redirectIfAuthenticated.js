module.exports = function redirectIfAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/dashboard');
    }
    next();
  };