var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');
var streamify = require('gulp-streamify');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var tsify = require('tsify');
var fancy_log = require('fancy-log');
var terser = require('gulp-terser');
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
  return del(['dist/**','release/**']);
});


gulp.task('copy-html', function () {
  return gulp.src(paths.pages)
    .pipe(gulp.dest('dist'))
    .pipe(gulp.dest('release'));
});
 

function mainAppBundle(useDebug) {

  var debug;
  if (!useDebug) {
    debug = false;
  } else {
    debug = true;
  }

  var mainAppBundler = browserify({
      basedir: '.',
      debug: debug,
      entries: ['src/main.ts'],
      extensions: ['.js'],
      cache: {},
      packageCache: {}
    }).plugin(tsify)
    .transform("babelify", {
      presets: ["@babel/preset-env"]
    });


  return mainAppBundler
    .bundle()
    .on('error', fancy_log);

}

gulp.task('dev-build', gulp.series(gulp.parallel('copy-html'), function () {
  return mainAppBundle(true)

    .pipe(source('bundle.js'))
    .pipe(gulp.dest('dist'));


}));

gulp.task('prod-build', gulp.series(
  'dev-build', 'copy-html',
  function (done) {


    var t = gulp.src('./dist/bundle.js')
      .pipe(terser())
       
      .pipe(gulp.dest('./release'))

    done();
    return t;

  }

));