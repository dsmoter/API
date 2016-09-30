var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    users = require("./routes/users");

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