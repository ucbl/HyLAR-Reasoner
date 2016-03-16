/**
 * Created by Spadon on 28/07/2015.
 */

var gulp = require('gulp');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var replace = require('gulp-replace');
var debug = require('gulp-debug');

var libPath = 'lib';

var regtofix = /context = context \? _\.defaults\(root\.Object\(\), context, _\.pick\(root, contextProps\)\) : root;/g;
var lodashfix = 'context = context ? _.defaults(root.Object(), ' +
                'context, _.pick(root, contextProps)) : root; \n' +
                ' if (typeof context.Object !== "function") context = this;';

process.argv.forEach(function(value, index) {
    if ((value == '-d') || (value == '--directory')) {
        libPath = process.argv[index + 1];
    }
});

gulp.task('clean', function () {
    return gulp.src(libPath + '/hylar.js', {read: false})
        .pipe(clean());
});

gulp.task('build-migrate', function() {
    return gulp.src('hylar/hylar.js')
        .pipe(debug())
        .pipe(browserify({
            insertGlobals : true,
            debug : false,
            standalone: 'lodash'
        }))
        .pipe(concat('hylar-client.js'))
        .pipe(replace(regtofix, lodashfix)) // Fixing lodash issues
        .pipe(gulp.dest(libPath));
});

gulp.task('default', function() {
    return runSequence('clean', 'build-migrate');
});