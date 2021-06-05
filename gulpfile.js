var gulp = require('gulp');
var typedoc = require("gulp-typedoc");
var ts = require('gulp-typescript');
var merge_stream = require('merge2');
var fs = require('fs');

var tsSources = ['src/**/*.ts'];
var tsProject = ts.createProject('tsconfig.json');

gulp.task("scripts",function(){
  var tsResult = gulp.src(tsSources).pipe(tsProject());
  return merge_stream([ // Merge the two output streams, so this task is finished when the IO of both operations is done.
      tsResult.dts.pipe(gulp.dest('./typings')),
      tsResult.js.pipe(gulp.dest('./dist'))
  ]);
});

gulp.task("typedoc", function() {
  return gulp.src(tsSources)
    .pipe(typedoc({
      out: "./docs",
      // json: "output/to/file.json",
      // TypeDoc options (see typedoc docs)
      // name: "my-project",
      // theme: "/path/to/my/theme",
      // plugins: ["my", "plugins"],
      // module: "commonjs",
      // target: "es6",
      // ignoreCompilerErrors: false,
      version: true,
    }));
});

gulp.task('docs', gulp.series('typedoc', async function(cb) {
    fs.writeFileSync('docs/.nojekyll',cb);
}));

gulp.task('watch', gulp.series('scripts', async function() {
    gulp.watch(tsSources, gulp.series('scripts'));
}));

gulp.task('build', gulp.parallel('scripts', 'docs'));

gulp.task('default', gulp.parallel('build'));

// TODO: Create a 'release' script to do:
// ['docs','scripts'], bump version, commit and tag, then npm publish
