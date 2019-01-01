const gulp = require('gulp');
const sass = require('gulp-sass');

sass.compiler = require('node-sass');
 
gulp.task('sass', function () {
	return gulp.src('./scss/style.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('./src'));
});
 
gulp.task('sass:watch', function () {
	gulp.watch('./scss/style.scss', ['sass']);
});