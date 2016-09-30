var app = require('../app');
var models = require("../models");

models.sequelize.sync().then(function () {
  var server = app.listen(3000, function() {
    console.log('Server listening on port ' + server.address().port);
  });
});