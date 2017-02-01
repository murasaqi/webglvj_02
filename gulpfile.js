
var gulp = require('gulp');
var pug = require('gulp-pug');
var stylus = require('gulp-stylus');
var watch = require("gulp-watch")
var plumber = require('gulp-plumber')
var connect = require("gulp-connect")
const babel = require('gulp-babel');
var runSequence = require('run-sequence');

var paths = {srcDir:"src",dstDir:"docs"}
var browserSync = require('browser-sync').create();

gulp.task('browser-sync', function() {
	browserSync.init({
		server: {
			baseDir: './docs', // ルートディレクトリ
			index: 'index.html'
		},
		startPath: ''
	});

});


gulp.task('watch',['browser-sync'],function() {
    gulp.watch('src/**/*.pug',['pug']);
    gulp.watch('src/**/*.js',['js']);
    gulp.watch('src/**/*.styl',['stylus']);


});




gulp.task('refresh',function () {
    browserSync.reload();
    connect.reload();

});

gulp.task('pug', function buildHTML() {
    var srcGlob = paths.srcDir + '/pug/*.pug';
    var dstGlob = paths.dstDir + '/';
    gulp.src([srcGlob])
        .pipe(plumber())
        .pipe(watch([srcGlob]))
        .pipe(pug({pretty:true}))
        .pipe(gulp.dest(dstGlob));
    browserSync.reload();
});





gulp.task('stylus',function(){
    var srcGlob = paths.srcDir + '/stylus/*.styl';
    var dstGlob = paths.dstDir + './css/';
    gulp.src(srcGlob)
        .pipe(plumber())
        .pipe(watch(srcGlob))
        .pipe(stylus())
        .pipe(gulp.dest(dstGlob));


	browserSync.reload();
});

gulp.task('js',function(){
    var srcGlob = paths.srcDir + '/ts/*.*';
    var dstGlob = paths.dstDir + '/js/';
    gulp.src(srcGlob)
        .pipe(gulp.dest(dstGlob));

    browserSync.reload();
});

// ********************************************************* //


gulp.task('default', ['watch']);
gulp.task('compress', ['compress']);
