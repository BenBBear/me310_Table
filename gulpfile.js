var gulp = require('gulp'),
    watch = require('gulp-watch'),
    concat = require("gulp-concat"),
    rename = require('gulp-rename'),
    less = require('gulp-less');


var paths = {
        js: [
            './src/js/config.init.js',
            './src/js/config.node.js',
            './src/js/utilities/*.js',
            './src/js/classes/*.js',
            './src/js/globals/*.js',
            './src/js/main.js',
            './src/js/app.js'
        ],
        less: ['./src/css/*.less', './src/css/*/*.less']
    },
    output = {
        js: './src/dist/js/',
        css: './src/dist/css'
    };

gulp.task('less', function(done) {
    gulp.src(paths.less)
        .pipe(less())
        .pipe(rename("app.css"))
        .pipe(gulp.dest(output.css))
        .on('end', done);
});

gulp.task('js', function(done) {
    gulp.src(paths.js)
        .pipe(concat('app.js'))
        .pipe(gulp.dest(output.js))
        .on('end', done);
});


gulp.task('default', ['less', 'js']);
gulp.task('watch',  function() {
    gulp.watch(paths.css, ['less']);
    gulp.watch(paths.js, ['js']);
});
