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
var browserSync = require('browser-sync').create();
var terser = require('gulp-terser');
var del = require('del');
var paths = {
  js: ['dist/**/*.js'],
  ts: ['src/**/*.ts'],
  css: [],
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
  return del(['dist/**', 'release/**']);
});


gulp.task('copy-html-dev', function () {
  return gulp.src(paths.pages)
        .pipe(gulp.dest('dist'));
});


gulp.task('copy-html-release', function () {
  return gulp.src(paths.pages)

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

gulp.task('dev-build', gulp.series(gulp.parallel('copy-html-dev'), function () {
  return mainAppBundle(true)

        .pipe(source('bundle.js'))
        .pipe(gulp.dest('dist'));


}));

gulp.task('release-setup', gulp.series(gulp.parallel('copy-html-release'), function () {
  return mainAppBundle(false)

        .pipe(source('bundle.js'))
        .pipe(gulp.dest('release'));


}));

gulp.task('serve', function () {

  browserSync.init({
    server: "./dist",
    port: 6060,
    ui: {port: 6061}
  });

  gulp.watch(paths.ts).on('change', function(done) {
     return mainAppBundle(true)
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('dist'));
     done();
     
  });
  gulp.watch(paths.js).on('change', browserSync.reload);
  gulp.watch(paths.css).on('change', browserSync.reload);
  gulp.watch(paths.pages).on('change', browserSync.reload);
});

gulp.task('release-build', gulp.series(
      'release-setup', 'copy-html-release',
      function (done) {


        var t = gulp.src('./release/bundle.js')
              .pipe(terser())

              .pipe(gulp.dest('./release'))

        done();
        return t;

      }

));