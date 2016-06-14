var autoprefixer = require('gulp-autoprefixer'),
     browserSync = require('browser-sync'),
        cleanCss = require('gulp-clean-css'),
          concat = require('gulp-concat'),
             del = require('del'),
              fs = require('fs'),
            gulp = require('gulp'),
         nodemon = require('gulp-nodemon'),
            path = require('path'),
         plumber = require('gulp-plumber'),
            sass = require('gulp-sass'),
          rename = require('gulp-rename'),
              ts = require('gulp-typescript'),
          uglify = require('gulp-uglify');

gulp.task('clean', function () {
    del(['public/css/*', 'public/js/*']);
});

gulp.task('lib', function (done) {
    var libDir = path.join(__dirname, 'assets/lib');
    var libFiles = [
        'polyfills.js',
        'polyfills-manifest.json',
        'vendor.js',
        'vendor-manifest.json'
    ];

    var libsExist =
        libFiles.every(function (file) {
            var exists = true;
            try {
                fs.accessSync(path.join(libDir, file), fs.F_OK);
            } catch (e) {
                exists = false;
            }
            return exists;
        });

    if (libsExist) {
        console.log("Angular DLLs exist. Skipping compilation.");
        done();
        return;
    }

    var webpack = require('webpack');
    var webpackConfig = require('./client/config/webpack.lib.js');

    webpack(webpackConfig, function (err, stats) {
        if (err) {
            console.log(err);
        }

        done();
    });
});

gulp.task('ts', ['lib'], function () {
    var webpack = require('webpack-stream');
    var webpackConfig;

    webpackConfig = (process.env.NODE_ENV === 'production')
                  ? require('./client/config/webpack.prod.js')
                  : require('./client/config/webpack.dev.js');

    gulp.src(['client/**/*.ts'])
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
    var historyApiFallback = require('connect-history-api-fallback');

    browserSync({
        server: {
            baseDir: './public',
            middleware: [historyApiFallback()]
        }
    });
});

gulp.task('watch', function () {
    gulp.watch('assets/css/**/*.scss', ['css']);
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
