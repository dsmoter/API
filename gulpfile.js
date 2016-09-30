var gulp = require('gulp'),
    spawn = require('child_process').spawn,
    config = require('./config/config.json'),
    exec = require('child_process').exec,
    node;

gulp.task('server', function() {
  if(node)
    node.kill();

  node = spawn('node', ['./bin/server.js'], {stdio: 'inherit'});

  node.on('close', function(code) {
    if(code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
});

gulp.task('default', ['server', 'watch']);

gulp.task('watch', function() {
  gulp.watch(['./**/*.js'], ['server']);
})

gulp.task('mysqldump', function(cb) {
  exec('mysqldump -d --host="'+config.host+'" --user="'+config.user+'" -p '+config.database+' > mysqldump.sql', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

process.on('exit', function() {
  if(node)
    node.kill();
});