var gulp = require('gulp'),
    es6ModuleTranspiler = require('gulp-es6-module-transpiler'),
    mocha = require('gulp-mocha'),
    srcFolder = './static/app',
    testFolder = './static/app.test',
    debugFolder = './static/app.debug';
    prodFolder = './static/app.prod';

gulp.task('copy-libs-for-debug', function () {
    return gulp.src([
        './bower_components/requirejs/require.js',
        './bower_components/jquery/dist/jquery.js',
        './bower_components/medium/medium.js',
        './bower_components/medium/medium.css',
        //'./bower_components/undo/undo.js',
        //'./bower_components/rangy-official/rangy-core.js',
        //'./bower_components/rangy-official/rangy-classapplier.js'
    ]).pipe(gulp.dest(debugFolder));
});

gulp.task('copy-libs-for-prod', function () {
    return gulp.src([
        './bower_components/jquery/dist/jquery.min.js',
        './bower_components/medium/medium.js',
        './bower_components/medium/medium.css',
        //'./bower_components/undo/undo.js',
        //'./bower_components/rangy-official/rangy-core.min.js',
        //'./bower_components/rangy-official/rangy-classapplier.min.js'
    ]).pipe(gulp.dest(prodFolder));
});

gulp.task('copy-modules-for-debug', function () {
    return gulp.src(srcFolder + '/!(*-test).js')
        .pipe(es6ModuleTranspiler({
            type: 'amd'
        }))
        .pipe(gulp.dest(debugFolder));
});

gulp.task('copy-modules-for-prod', function () {
    return gulp.src(srcFolder + '/!(*-test).js')
        .pipe(es6ModuleTranspiler({
            type: 'amd'
        }))
        .pipe(gulp.dest(prodFolder));
});

gulp.task('copy-modules-for-tests', function () {
    return gulp.src(srcFolder + '/!(*-test).js')
        .pipe(es6ModuleTranspiler({
            type: 'cjs'
        }))
        .pipe(gulp.dest(testFolder));
});

gulp.task('copy-tests', function() {
    return gulp.src(srcFolder + '/*-test.js')
        .pipe(gulp.dest(testFolder));
});

gulp.task('run-tests', ['copy-modules-for-tests', 'copy-tests'], function () {
    return gulp.src(testFolder + '/*-test.js', {read: false})
        .pipe(mocha());
});

gulp.task('create-build', ['copy-modules-for-debug', 'copy-libs-for-debug', 'copy-modules-for-prod', 'copy-libs-for-prod']);

gulp.task('default', ['run-tests', 'create-build']);
