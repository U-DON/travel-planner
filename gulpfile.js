var autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync'),
    cleanCss = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    del = require('del'),
    gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    sass = require('gulp-sass'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify');

gulp.task('clean', function () {
    del(['public/css/*', 'public/js/*']);
});

gulp.task('css', function () {
    gulp.src(['assets/css/**/*.scss'])
        .pipe(plumber())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(cleanCss())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('public/css'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('js', function () {
    gulp.src(['assets/js/**/*.js', '!assets/js/**/*.min.js'])
        .pipe(plumber())
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('public/js'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('html', function () {
    gulp.src(['*.html'])
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('sync', function () {
    browserSync({
        server: {
            baseDir: './'
        }
    });
});

gulp.task('watch', function () {
    gulp.watch('assets/css/**/*.scss', ['css']);
    gulp.watch('assets/js/**/*.js', ['js']);
    gulp.watch('*.html', ['html']);

});

gulp.task('default', ['clean', 'css', 'js', 'sync', 'watch']);
