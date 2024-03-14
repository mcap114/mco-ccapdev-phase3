const session = require('express-session');
const express = require('express');

const server = express();

server.use(session({
    secret: 'private_key', 
    // prevents session data from being saved on every request
    resave: false,
    saveUninitialized: true
}));

// middleware to set isLoggedIn based on session
server.use(function(req, res, next) {
  if (req.session.username) {
      // user is logged in
      res.locals.isLoggedIn = true;
      res.locals.isLoggedOut = false;
  } else {
      // user is NOT logged in
      res.locals.isLoggedIn = false;
      res.locals.isLoggedOut = true;
  }
  next();
});

module.exports = server;