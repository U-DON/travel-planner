var autoprefixer = require('gulp-autoprefixer'),
    gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    sass = require('gulp-sass'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify');

gulp.task('css', function () {
    gulp.src(['assets/css/**/*.scss'])
        .pipe(plumber())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(gulp.dest('public/css'));
});

gulp.task('js', function () {
    gulp.src(['assets/js/**/*.js', '!assets/js/**/*.min.js'])
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('public/js'));
});

gulp.task('watch', function () {
    gulp.watch('assets/css/**/*.scss', ['css']);
    gulp.watch('assets/js/**/*.js', ['js']);

});

gulp.task('default', ['css', 'js', 'watch']);
