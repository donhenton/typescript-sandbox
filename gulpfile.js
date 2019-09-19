var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');

var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
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
      extensions: ['.js'],
      cache: {},
      packageCache: {}
    })
    .plugin(tsify)
    .transform("babelify", {presets: ["@babel/preset-env" ]}) 

  if (watch) {
    bObj = watchify(bObj);
  }

  return bObj;

}

var watchedBrowserify = createBrowserify(true);


gulp.task('build', gulp.series(gulp.parallel('copy-html'), function () {
  return createBrowserify()
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'));


}));


function watchBundle() {

  return watchedBrowserify
    .bundle()
    .on('error', fancy_log)
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'));

}

gulp.task('watch', gulp.series(gulp.parallel('copy-html'), watchBundle));
watchedBrowserify.on('update', watchBundle);
watchedBrowserify.on('log', fancy_log);