var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var users = require("./routes/users");

app.use(cookieParser());
app.use(session({
  secret: '1234567890QWERTY',
  resave: true,
  saveUninitialized: false
}));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  var requestType = req.get('content-type');

  if(requestType !== "application/json") {
    res.sendStatus(406);
    return;
  }
  next();
});

app.use('/v1/users', users);



module.exports = app;