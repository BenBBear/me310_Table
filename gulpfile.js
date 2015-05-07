var gulp = require('gulp'),
    watch = require('gulp-watch'),
    concat = require("gulp-concat"),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    path = require('path');


var paths = {
        js: [
            './src/js/config.init.js',
            './src/js/utilities/require.js',
            './src/js/utilities/*.js',
            './src/js/config.node.js',
            './src/js/classes/*.js',
            './src/js/main.js',
            './src/js/app.js'
        ],
        sass: ['./src/css/*.scss', './src/css/*/*.scss', './src/css/*/*.css']
    },
    output = {
        js: './src/dist/js/',
        css: './src/dist/css'
    };

gulp.task('sass', function(done) {
    gulp.src('./src/css/app.scss')
      .pipe(sass({
            onError: function(e) {
                console.log(e);
            }
      }))
    // .pipe(less())
        .pipe(concat('app.css'))
    // .pipe(rename("app.css"))
        .pipe(gulp.dest(output.css))
        .on('end', done);
});

gulp.task('js', function(done) {
    gulp.src(paths.js)
        .pipe(concat('app.js'))
        .pipe(gulp.dest(output.js))
        .on('end', done);
});


gulp.task('default', ['sass', 'js']);
gulp.task('watch', function() {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.js, ['js']);
});
