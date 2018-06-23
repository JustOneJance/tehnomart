"use strict";


var gulp = require("gulp");
var server = require("browser-sync").create();
var sass = require("gulp-sass");
var cssmin = require('gulp-minify-css');
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var prefixer = require("autoprefixer");
var imagemin = require('gulp-imagemin');
var browserSync = require("browser-sync");
var reload = browserSync.reload;
var pngquant = require('imagemin-pngquant');
var watch = require('gulp-watch');
var rimraf = require('rimraf');
var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');
var stuff = require('path');
var inject = require('gulp-inject');


var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: {
        html: 'src/*.html',
        js: 'src/js/main.js',
        style: 'src/sass/style.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        svg: 'src/svg/*.svg'
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        svg: 'src/svg/*.svg'
    },
    clean: './build'
};


gulp.task('svgstore', function () {
    return gulp
        .src('src/svg/*.svg')
        .pipe(svgmin(function (file) {
            var prefix = stuff.basename(file.relative, stuff.extname(file.relative));
            return {
                plugins: [{
                    cleanupIDs: {
                        prefix: prefix + '-',
                        minify: true
                    }
                }]
            }
        }))
        .pipe(svgstore())
        .pipe(gulp.dest('build'));
});



gulp.task('svgstore', function () {
    var svgs = gulp
        .src('src/svg/*.svg')
        .pipe(svgstore({ inlineSvg: true }));

    function fileContents (filePath, file) {
        return file.contents.toString();
    }

    return gulp
        .src('src/index.html', 'src/tehnomart')
        .pipe(inject(svgs, { transform: fileContents }))
        .pipe(gulp.dest('build'));
});

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend_allay"
};

gulp.task('html:build', function () {
    gulp.src(path.src.html)
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task("style:build", function () {
    gulp.src("src/sass/style.scss")
        .pipe(plumber())
        .pipe(sass())
        .pipe(postcss([

            prefixer({browsers: [
                    "last 2 versions"
                ]})

        ]))
        .pipe(gulp.dest("build/css"))
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) //
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
]);

gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('default', ['build', 'webserver', 'watch']);

