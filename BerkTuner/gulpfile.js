/// <binding ProjectOpened='watch' />
/*
This file in the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/

"use strict";

var browserSyncInitted = false;

var browserSync = require('browser-sync'),
    es = require('event-stream'),
    gulp = require("gulp"),
    babel = require("gulp-babel"),
    clean = require("gulp-clean"),
    concat = require("gulp-concat"),
    cssmin = require("gulp-cssmin"),
    debug = require("gulp-debug"),
    notify = require("gulp-notify"),
    plumber = require("gulp-plumber"),
    rename = require("gulp-rename"),
    sourcemaps = require("gulp-sourcemaps"),
    uglify = require("gulp-uglify"),
    watch = require("gulp-watch"),
    minimatch = require("minimatch"),
    notifier = require('node-notifier'),
    path = require("path"),
    runSequence = require("run-sequence");

var jsq = [], jsxq = [], cssq = [];

var paths = {
    webroot: "./Assets/",
    bundleRoot: "./Assets/bundles/",
    jsx: "./Assets/resources/js/react/**/*.jsx",
    jsxTranspiled: "./Assets/resources/js/react/transpiled/",
    js: "./Assets/**/*.js",
    minJs: "./Assets/**/*.min.js",
    jsMapDir: "./Assets/bundles/maps/js",
    css: "./Assets/**/*.css",
    minCss: "./Assets/**/*.min.css",
    cssMapDir: "./Assets/bundles/maps/css",
    fonts: "./Assets/**/*.*(eot|svg|ttf|woff|woff2)",
    images: "./Assets/**/*.*(png|swf)"
};

var jsSourcePaths = [
        paths.webroot + "**/jquery.js",
        paths.webroot + "**/*(modernizr|bootstrap|respond.src|jquery.signalR|bootbox|tuner).js",
        [
            paths.webroot + "**/Detector.js",
            paths.webroot + "**/Three.js",
            paths.webroot + "**/Stats.js",
            paths.webroot + "**/dancer.js",
            paths.webroot + "**/support.js",
            paths.webroot + "**/kick.js",
            paths.webroot + "**/adapterWebAudio.js",
            paths.webroot + "**/adapterMoz.js",
            paths.webroot + "**/adapterFlash.js",
            paths.webroot + "**/fft.js",
            paths.webroot + "**/flash_detect.js",
            paths.webroot + "**/dancer.fft.js",
            paths.webroot + "**/scene.js",
            paths.webroot + "**/player.js"
        ],
        paths.jsxTranspiled + "**/*.js"
    ],
    jsDestinationPaths = [
        paths.bundleRoot + "js/jquery.min.js",
        paths.bundleRoot + "js/main.min.js",
        paths.bundleRoot + "js/streamer.min.js",
        paths.bundleRoot + "js/react.jsx.min.js"
    ],
    cssSourcePaths = [
        paths.webroot + "**/*(bootstrap|site).css",
        paths.webroot + "**/dancer.css"
    ],
    cssDestinationPaths = [
        paths.bundleRoot + "css/main.min.css",
        paths.bundleRoot + "css/streamer.min.css"
    ];

function initBrowserSync() {
    if (!browserSyncInitted) {
        browserSyncInitted = true;
        browserSync({
            open: false,
            port: 3030
        });
    }
}

function copyExistingFonts() {
    return gulp.src([paths.fonts, "!" + paths.bundleRoot + "**/*.*(eot|svg|ttf|woff|woff2)"])
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
        .pipe(rename({
            dirname: ""
        }))
        .pipe(gulp.dest(paths.bundleRoot + "fonts/"));
}

function copyExistingImages() {
    return gulp.src([paths.images, "!" + paths.bundleRoot + "**/*.*(png|swf)"])
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
        .pipe(rename({
            dirname: ""
        }))
        .pipe(gulp.dest(paths.bundleRoot + "images/"));
}

function moveSM2() {
    return gulp.src([paths.webroot + "**/soundmanager2.js", "!" + paths.bundleRoot + "**/*.js"])
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
        .pipe(rename({
            dirname: ""
        }))
        .pipe(gulp.dest(paths.bundleRoot + "js/"));
}

function moveExistingMinJs() {
    return gulp.src([paths.minJs, "!" + paths.bundleRoot + "**/*.js"])
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
        .pipe(clean())
        .pipe(rename({
            dirname: ""
        }))
        .pipe(gulp.dest(paths.bundleRoot + "js/"));
}

function moveExistingMinCss() {
    return gulp.src([paths.minCss, "!" + paths.bundleRoot + "**/*.css"])
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
        .pipe(clean())
        .pipe(rename({
            dirname: ""
        }))
        .pipe(gulp.dest(paths.bundleRoot + "css/"));
}

function transpileJSX() {
    return gulp.src(paths.jsx, { base: "." })
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
        .pipe(babel({
            presets: ["es2015"],
            plugins: ["transform-react-jsx"]
        }))
        .pipe(gulp.dest(paths.jsxTranspiled));
}

//Transpile only the changed jsx (This automatically triggers smartmin:js task after putting the .js files under transpiled folder)
function smartTranspileJSX() {
    var file = jsxq.pop()[0];
    console.log("Processing: " + file);

    return gulp.src(file, { base: "." })
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
        .pipe(babel({
            presets: ["es2015"],
            plugins: ["transform-react-jsx"]
        }))
        .pipe(gulp.dest(paths.jsxTranspiled));
}

function jsMinInternal(value, index){
    return gulp.src(value, { base: "." })
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
        .pipe(sourcemaps.init())
        .pipe(concat(jsDestinationPaths[index]))
        .pipe(uglify({
            mangle: {
                except: ["Dancer"]
            }
        }))
        .pipe(sourcemaps.write(paths.jsMapDir, {
            sourceMappingURL: function (file) {
                return "../maps/js/" + path.basename(file.path) + ".map";
            }
        }))
        .pipe(rename(function (path) {
            if (path.extname == ".map") {
                path.dirname = paths.jsMapDir;
            }
        }))
        .pipe(gulp.dest("."));
}

function cssMinInternal(value, index) {
    return gulp.src(value, { base: "." })
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
        .pipe(sourcemaps.init())
        .pipe(concat(cssDestinationPaths[index]))
        .pipe(cssmin())
        .pipe(sourcemaps.write(paths.cssMapDir, {
            sourceMappingURL: function (file) {
                return "../maps/css/" + path.basename(file.path) + ".map";
            }
        }))
        .pipe(rename(function (path) {
            if (path.extname == ".map") {
                path.dirname = paths.cssMapDir;
            }
        }))
        .pipe(gulp.dest("."));
}

function minJs() {
    return es.merge(jsSourcePaths.map(function (value, index) {
        if (Array.isArray(value))
            value.push("!" + paths.minJs);
        else
            value = [value, "!" + paths.minJs]

        return jsMinInternal(value, index);
    }));
}

function minCss() {
    return es.merge(cssSourcePaths.map(function (value, index) {
        if (Array.isArray(value))
            value.push("!" + paths.minCss);
        else
            value = [value, "!" + paths.minCss]

        return cssMinInternal(value, index);
    }));
}

//Min only the changed js
function smartMinJs() {
    var file = jsq.pop()[0];
    console.log("Processing: " + file);

    for (var index = 0; index < jsSourcePaths.length; index++) {
        var value = jsSourcePaths[index];

        if (Array.isArray(value))
            value.push("!" + paths.minJs);
        else
            value = [value, "!" + paths.minJs]

        for (var valueIndex = 0; valueIndex < value.length; valueIndex++) {
            var matchValue = "**/" + value[valueIndex].substring(1);
            if (minimatch(file, matchValue)) {
                console.log("Match!");
                return jsMinInternal(value, index);
            }
        }
    }
}

//Min only the changed css
function smartMinCss() {
    var file = cssq.pop()[0];
    console.log("Processing: " + file);
    
    for (var index = 0; index < cssSourcePaths.length; index++) {
        var value = cssSourcePaths[index];

        if (Array.isArray(value))
            value.push("!" + paths.minCss);
        else
            value = [value, "!" + paths.minCss]
        
        for (var valueIndex = 0; valueIndex < value.length; valueIndex++) {
            var matchValue = "**/" + value[valueIndex].substring(1);
            if (minimatch(file, matchValue)) {
                console.log("Match!");
                return cssMinInternal(value, index);
            }
        }
    }
}

function watchJs() {
    initBrowserSync();
    return watch([paths.js, "!" + paths.bundleRoot], function (file) {
        jsq.unshift(file.history);
        runSequence('smartmin:js',
            function () {
                try {
                    browserSync.reload();
                }
                catch (err) {
                    console.log(err);
                    notifier.notify({ title: 'BrowserSync Error', message: "Error: " + err });
                }
            });
    });
}

function watchJsx() {
    initBrowserSync();
    return watch([paths.jsx], function (file) {
        jsxq.unshift(file.history);
        runSequence('smarttranspile:jsx');
    });
}

function watchCss() {
    initBrowserSync();
    return watch([paths.css, "!" + paths.bundleRoot], function (file) {
        cssq.unshift(file.history);
        runSequence('smartmin:css',
            function () {
                try {
                    browserSync.reload();
                }
                catch (err) {
                    console.log(err);
                    notifier.notify({ title: 'BrowserSync Error', message: "Error: " + err });
                }
            });
    });
}

function watchJsJsxAndCss() {
    runSequence(["watch:js", "watch:jsx", "watch:css"], function (err) {
        console.log(err);
        if (err) {
            console.log(err);
            if (err.message)
                notifier.notify({ title: 'BrowserSync Error', message: "Error: " + err.message })
        };
    });
}

gulp.task("move:sm2", moveSM2);

gulp.task("move:existingMinJs", ["move:sm2"], moveExistingMinJs);

gulp.task("move:existingMinCss", moveExistingMinCss);

gulp.task("copy:existingFonts", copyExistingFonts);

gulp.task("copy:existingImages", copyExistingImages);

gulp.task("transpile:jsx", transpileJSX);

gulp.task("smarttranspile:jsx", smartTranspileJSX);

gulp.task("min:js", ["transpile:jsx", "move:existingMinJs"], minJs);

gulp.task("min:css", ["move:existingMinCss"], minCss);

gulp.task("smartmin:js", smartMinJs);

gulp.task("smartmin:css", smartMinCss);

gulp.task("bundle", ["move:existingMinJs", "move:existingMinCss", "copy:existingFonts", "copy:existingImages", "transpile:jsx"], function () {
    runSequence(['min:js', 'min:css']);
});

gulp.task("watch:js", watchJs);

gulp.task("watch:jsx", watchJsx);

gulp.task("watch:css", watchCss);

gulp.task("watch", watchJsJsxAndCss);