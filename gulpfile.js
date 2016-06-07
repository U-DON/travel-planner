var autoprefixer = require('gulp-autoprefixer'),
     browserSync = require('browser-sync'),
        cleanCss = require('gulp-clean-css'),
          concat = require('gulp-concat'),
             del = require('del'),
            gulp = require('gulp'),
         nodemon = require('gulp-nodemon'),
         plumber = require('gulp-plumber'),
            sass = require('gulp-sass'),
          rename = require('gulp-rename'),
              ts = require('gulp-typescript'),
          uglify = require('gulp-uglify');

gulp.task('clean', function () {
    del(['public/css/*', 'public/js/*']);
});

gulp.task('lib', function (done) {
    var webpack = require('webpack');
    var webpackConfig = require('./client/webpack.lib.js');

    webpack(webpackConfig, function (err, stats) {
        done();
    });
});

gulp.task('ts', ['lib'], function () {
    var webpack = require('webpack-stream');
    var webpackConfig;

    webpackConfig = (process.env.NODE_ENV === 'production')
                  ? require('./client/webpack.prod.js')
                  : require('./client/webpack.dev.js');

    gulp.src(['client/**/*.ts', '!client/lib/*.ts'])
        .pipe(plumber())
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest('public/js'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('fonts', function () {
    gulp.src(['assets/fonts/*', 'node_modules/font-awesome/fonts/*'])
        .pipe(gulp.dest('public/fonts'));

});

gulp.task('css', function () {
    gulp.src(['node_modules/font-awesome/scss/*.scss', 'assets/css/**/*.scss'])
        .pipe(plumber())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(concat('style.css'))
        .pipe(cleanCss())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('public/css'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('html', function () {
    gulp.src(['public/*.html'])
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('sync', function () {
    browserSync({
        server: {
            baseDir: './public'
        }
    });
});

gulp.task('watch', function () {
    gulp.watch('assets/css/**/*.scss', ['css']);
    gulp.watch('assets/js/**/*.js', ['js']);
    gulp.watch('client/**/*.ts', ['ts']);
    gulp.watch('public/*.html', ['html']);
});

gulp.task('server', function () {
    nodemon({
        script: 'server/app.js',
        env: {
            'NODE_ENV': process.env.NODE_ENV || 'production'
        }
    });
});

gulp.task('env:dev', function () {
    return process.env.NODE_ENV = 'development';
});

gulp.task('env:prod', function () {
    return process.env.NODE_ENV = 'production';
});

gulp.task('build:dev', ['env:dev', 'clean', 'ts', 'css', 'fonts']);
gulp.task('build:prod', ['env:prod', 'clean', 'ts', 'css', 'fonts']);

gulp.task('default', ['clean', 'ts', 'css', 'fonts', 'sync', 'watch']);
