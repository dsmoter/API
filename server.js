var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Sequelize = require('sequelize');
var cookieParser = require('cookie-parser');

var session = require('express-session');



var sequelize = new Sequelize('thenets', 'root', 'dbpass', {
  dialect: "mysql",
  host: "localhost",
  port: 3306
})

// app.use(session({
//   secret: '2C44-4D44-WppQ38S',
//   resave: true,
//   saveUnitialized: true
// }));

//app.use(cookieParser());
app.use(session({
  secret: '1234567890QWERTY',
  resave: true,
  saveUnitialized: true
}));

var User = sequelize.define("users", {
    "id": {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    "name": {
      type: Sequelize.STRING
    },
    "password": {
      type: Sequelize.TEXT
    },
    "role": {
      type: Sequelize.STRING(6)
    }
  },
  {
    createdAt: false,
    updatedAt: false
  }
);

var auth = function(req, res, next) {
  if (req.session && req.session.user === "amy" && req.session.admin) {
    return next();
  } else {
    return res.sendStatus(401);
  }
}

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

var port = 3000;

var server = app.listen(port, function() {
	console.log('Server now running on port: ' + port);
});

sequelize
  .authenticate()
  .then(function(resolve) {
    console.log('Database connection established.');
  }, function(reject) {
    console.log('Error during database connection establishing.');
  });



// register

app.post('/v1/users/register', function(req, res) {
  if(!req.body.name || !req.body.password || !req.body.role) {
    res.status(400).json({ "error": 'No all mandatory info provided.'});
  } else {

    User.findOrCreate({
      where: {
        name: req.body.name
      },
      defaults: {
        password: req.body.password,
        role: req.body.role
      }
    }).spread(function(user, created) {

      if(created) {
        res.send('You have successfully registered.');
      } else {
        res.status(400).json({ "error": 'That name is reserved'});
      }

    }).catch(function(error) {
      console.log(error);
    });
  }
});



// login

app.post('/v1/users/login', function(req, res) {
  if(!req.body.name || !req.body.password) {
    res.status(400).json({ "error": 'No all mandatory info provided.'});
  } else {
    User.findOne({
      where: {
        name: req.body.name,
        password: req.body.password
      }
    }).then(function(user) {

      if(user) {
        req.session.role = user.role;
        req.session.authenticated = true;
        req.session.UID = user.id;
        res.send('You logged in.')
      } else {
        res.status(401).json({ "error": "Wrong username or password."});
      }

    });
  }
});


// logout

app.post('/v1/users/logout', function(req, res) {
  if(req.session.authenticated) {
    req.session.destroy();
    res.send('Sesja zniszczona');
  } else {
    res.send('Nie ma żadnej sesji');
  }
});


// get users

app.get('/v1/users/:id', function(req, res) {

  if(!req.session || !req.session.authenticated) {

    res.status(401).json( { "error": "You are not logged in." } );

  } else if(req.session.role === "admin" || req.session.role === "editor"){

    User.findById(req.params.id).then(function(user) {
      if(user) {
        res.json( { user: user } );
      } else {
        res.status(400).json( { "error": "User does not exist." } );
      }

    });

  } else {

    res.status(400).json( { "error": "You don't have permission to access this resource." } );
  }
  
});


// post users

app.post('/v1/users/:id', function(req, res) {
  if(!req.session || !req.session.authenticated) {
    res.status(401).json( { "error": "You are not logged in." } );
  } else if(req.session.role === "admin" || req.session.role === "editor" || req.session.UID === req.params.id) {
    if(!req.body.name || !req.body.password || !req.body.role) {
        res.status(400).json({ "error": 'No all mandatory info provided.'});
    } else {



      User.findById(req.params.id).then(function(user) {

        if(user) {

          if(req.session.role === "admin") { // cały update

            user.update({
              name: req.body.name,
              password: req.body.password,
              role: req.body.role
            }).then(function(result) {
              res.json( { "info": "User successfully updated." } );
            }, function(reject) {
              res.status(400).json( { "error": "An error occured when an attempt to update an user info" } );
            });

            // TODO: if user.id === req.params.id to logout

          } else if(req.session.role === "editor") { // nie moze zmieniac uprawnien adminowi oraz nie może nadawać uprawnienia admin
            
            var changes = {
              name: req.body.name,
              password: req.body.password
            }

            if(user.role !== "admin" && req.body.role !== "admin") {
              changes.role = req.body.role;
            }

            user.update(changes).then(function(result) {
              res.json( { "info": "User successfully updated." } );
            }, function(reject) {
              res.status(400).json( { "error": "An error occured when an attempt to update an user info" } );
            });

          } else { // user: nie moze zmieniac uprawnień w ogóle
            user.update({
              name: req.body.name,
              password: req.body.password
            }).then(function(result) {
              res.json( { "info": "User successfully updated." } );
            }, function(reject) {
              res.status(400).json( { "error": "An error occured when an attempt to update an user info" } );
            });
          }
        } else {
          res.status(400).json( { "error": "User does not exist." } );
        }

      });




    }
  } else {
    res.status(400).json( { "error": "You don't have permission to access this resource." } );
  }
});



// delete users

app.delete('/v1/users/:id', function(req, res) {

  if(!req.session || !req.session.authenticated) {
    res.status(401).json( { "error": "You are not logged in." } );
  } else if(req.session.role === "admin" || req.session.role === "editor") {
    User.findById(req.params.id).then(function(user){
        if(user) {
          if(user.role === "admin" && req.session.role === "editor") {
            res.status(400).json( { "error": "Editor can't delete admin account." } );
          } else {
            user.destroy().then(function(u) {
              if(u) {
                res.json( { "info": "User successfully deleted." } );
              } else {
                res.status(400).json( { "error": "An error occured when an attempt to delete an user." } );
              }
            });
          }
        } else {
          res.status(400).json( { "error": "User does not exist." } );
        }
      
    });
  } else {
    res.status(400).json( { "error": "You don't have permission to access this resource." } );
  }
});