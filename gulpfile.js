var /*webserver = require('gulp-webserver')*/
    connect = require('gulp-connect'),
    gulp = require('gulp'),// 載入 gulp
    bourbon = require("node-bourbon").includePaths,
    plumber = require('gulp-plumber'),
    sass = require('gulp-sass');  // 載入 gulp-sass

gulp.task('webserver', function () {
    connect.server({
        port: 1000,
        livereload: true
    });
});

gulp.task('watch', function () {
    gulp.watch('css/*.scss', ['sass']);
    gulp.watch('*.html', ['html']);
    gulp.watch('js/*.js', ['js']);
});


gulp.task('sass', function () {
    gulp.src('css/*.scss') // 指定要處理的 Scss 檔案目錄
        .pipe(plumber())
        .pipe(sass({ // 編譯 Scss
            outputStyle: 'compressed',
            includePaths: bourbon,
        }))
        .pipe(gulp.dest('css')) // 指定編譯後的 css 檔案目錄
        .pipe(connect.reload()); // 當檔案異動後自動重新載入頁面
});


gulp.task('html', function () {
    gulp.src('*.html')
        .pipe(connect.reload());  // 當檔案異動後自動重新載入頁面
});

gulp.task('js', function () {
    gulp.src('js/*.js')
        .pipe(connect.reload());  // 當檔案異動後自動重新載入頁面
});




gulp.task('default', ['webserver', 'watch', 'html', 'sass', 'js']);