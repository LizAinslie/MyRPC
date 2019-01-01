const gulp = require('gulp');
const sass = require('gulp-sass');

sass.compiler = require('node-sass');
 
gulp.task('sass', function () {
	return gulp.src('./src/scss/style.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('./src/public'));
});
 
gulp.task('sass:watch', function () {
	gulp.watch('./src/scss/style.scss', ['sass']);
});