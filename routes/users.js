var express = require("express"),
    router = express.Router(),
    models = require("../models");

router.post('/register', function(req, res) {
  if(!req.body.name || !req.body.password || !req.body.role) {
    res.status(400).json({ "error": 'No all mandatory info provided.'});
  } else {

    models.User.findOrCreate({
      where: {
        name: req.body.name
      },
      defaults: {
        password: req.body.password,
        role: req.body.role
      }
    }).spread(function(user, created) {

      if(created) {
        //res.json( { "info" : "You have successfully registered." } );
        res.sendStatus(200);
      } else {
        res.status(400).json({ "error": 'That name is reserved'});
      }

    }).catch(function(error) {
      console.log(error);
    });
  }
});



// login

router.post('/login', function(req, res) {
  if(!req.body.name || !req.body.password) {
    res.status(400).json({ "error": 'No all mandatory info provided.'});
  } else {
    models.User.findOne({
      where: {
        name: req.body.name,
        password: req.body.password
      }
    }).then(function(user) {

      if(user) {
        req.session.role = user.role;
        req.session.authenticated = true;
        req.session.UID = user.id;
        //res.json( { "info": "You logged in." } );
        res.sendStatus(200);
      } else {
        res.status(401).json({ "error": "Wrong username or password."});
      }

    });
  }
});


// logout

router.post('/logout', function(req, res) {
  req.session.destroy();
  //res.json( { "info": "Session destroyed" } );
  res.sendStatus(200);
});


// get users

router.get('/:id', function(req, res) {

  if(!req.session || !req.session.authenticated) {
    res.status(401).json( { "error": "You are not logged in." } );
  } else if(req.session.role === "admin" || req.session.role === "editor"){
    models.User.findById(req.params.id).then(function(user) {
      if(user) {
        res.json( user );
      } else {
        res.status(400).json( { "error": "User does not exist." } );
      }
    });
  } else {
    res.status(401).json( { "error": "You don't have permission to access this resource." } );
  }
  
});


// post users

router.post('/:id', function(req, res) {
  if(!req.session || !req.session.authenticated) {
    res.status(401).json( { "error": "You are not logged in." } );
  } else if(req.session.role === "admin" || req.session.role === "editor" || req.session.UID === req.params.id) {
    if(!req.body.name || !req.body.password || !req.body.role) {
        res.status(400).json({ "error": 'No all mandatory info provided.'});
    } else {

      models.User.findById(req.params.id).then(function(user) {

        if(user) {

          if(req.session.role === "admin") { // cały update

            user.update({
              name: req.body.name,
              password: req.body.password,
              role: req.body.role
            }).then(function(result) {
              //res.json( { "info": "User successfully updated." } );
              res.sendStatus(200);
            }, function(reject) {
              res.status(400).json( { "error": "An error occured when an attempt to update an user info" } );
            });

          } else if(req.session.role === "editor") { // nie moze zmieniac uprawnien adminowi oraz nie może nadawać uprawnienia admin
            
            var changes = {
              name: req.body.name,
              password: req.body.password
            }

            if(user.role !== "admin" && req.body.role !== "admin") {
              changes.role = req.body.role;
            }

            user.update(changes).then(function(result) {
              //res.json( { "info": "User successfully updated." } );
              res.sendStatus(200);
            }, function(reject) {
              res.status(400).json( { "error": "An error occured when an attempt to update an user info" } );
            });

          } else { // user: nie moze zmieniac uprawnień w ogóle
            user.update({
              name: req.body.name,
              password: req.body.password
            }).then(function(result) {
              //res.json( { "info": "User successfully updated." } );
              res.sendStatus(200);
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
    res.status(401).json( { "error": "You don't have permission to access this resource." } );
  }
});



// delete users

router.delete('/:id', function(req, res) {

  if(!req.session || !req.session.authenticated) {
    res.status(401).json( { "error": "You are not logged in." } );
  } else if(req.session.role === "admin" || req.session.role === "editor") {
    models.User.findById(req.params.id).then(function(user){
        if(user) {
          if(user.role === "admin" && req.session.role === "editor") {
            res.status(400).json( { "error": "Editor can't delete admin account." } );
          } else {
            user.destroy().then(function(u) {
              if(u) {
                //res.json( { "info": "User successfully deleted." } );
                res.sendStatus(200);
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
    res.status(401).json( { "error": "You don't have permission to access this resource." } );
  }
});

module.exports = router;