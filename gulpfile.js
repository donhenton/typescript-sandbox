var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var tsify = require('tsify');
var fancy_log = require('fancy-log');
var del = require('del');
var paths = {
  pages: ['public_html/*.html']
};


/**
 * Simple transpile for demonstration purposes
 */
gulp.task('simple-transpile', function () {
  return tsProject.src()
    .pipe(tsProject())
    .js.pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
  return del(['dist/**']);
});


gulp.task('copy-html', function () {
  return gulp.src(paths.pages)
    .pipe(gulp.dest('dist'));
});


function createBrowserify(watch) {

  var bObj = browserify({
      basedir: '.',
      debug: true,
      entries: ['src/main.ts'],
      cache: {},
      packageCache: {}
    })
    .plugin(tsify)

  if (watch) {
    bObj = watchify(bObj);
  }

  return bObj;

}


gulp.task('build', gulp.series(gulp.parallel('copy-html'), function () {
  return createBrowserify()
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('dist'));
}));

 