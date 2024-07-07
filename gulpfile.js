import { src, dest, watch, series } from 'gulp'
import terser from 'gulp-terser'
import rename from 'gulp-rename'
import inject from 'gulp-source-injector'
import size from 'gulp-size'
import browserSync from 'browser-sync'

const server = browserSync.create()


function js() {
  return src('./src/main.js')
    .pipe(rename('readable.js'))
    .pipe(dest('./build'))
    .pipe(terser({
      module: true,
      compress: {},
      mangle: {},
      output: {},
      parse: {},
      rename: {},
    }))
    .pipe(rename('min.js'))
    .pipe(size())
    .pipe(dest('./build'));
}

function html() {
  return src('./src/*.html')
    .pipe(inject())
    .pipe(rename('index.html'))
    .pipe(dest('./build'));
}

function serve(cb) {
  server.init({
    server: {
      baseDir: './build'
    },
    port: 1337,
  });

  cb();
}

function reload(cb) {
  server.reload();

  cb();
}


export default series(js, html);
export const dev = series(js, html, serve, () => {
  watch('src/*.js', series(js, html, reload));
})
