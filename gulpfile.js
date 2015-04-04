var gulp = require('gulp'),
    watch = require('gulp-watch'),
    sass = require('gulp-sass'),
    concat = require("gulp-concat"),
    minify = require('gulp-minify-css');


var scssFiles = ['src/css/scss/*.scss', 'src/css/scss/*/*.scss'];
gulp.task('sass', function() {
    gulp.src(scssFiles)
        .pipe(sass({
            onError: function(e) {
                console.log(e);
            }
        }))
        .pipe(concat('app.css'))
        .pipe(minify())
        .pipe(gulp.dest('src/css'));
});


gulp.task('watch', function() {
    watch(scssFiles, function() {
        gulp.start('sass');
    });
});