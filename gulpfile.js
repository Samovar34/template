const gulp  = require("gulp"),
      pug   = require("gulp-pug"),
      scss  = require("gulp-sass"),
      zpath = require("zpath");

const fileServer = new (require("node-static")).Server("./build", {cache: 0, headers: {"Cache-Control": "no-cache, must-revalidate"}});
const http = require("http");

const src = zpath.create("src");
const build = zpath.create("build");

let srcViewFolder = src.make("view *.pug");
let srcStyleFolder = src.make("style *.scss");
let srcJsFolder = src.make("js *.js");
let srcImgFolder = src.make("img ** *.*");
let srcFontsFolder = src.make("fonts ** *.*");

let srcViewWatchFolder = src.make("view ** *.pug");
let srcStyleWatchFolder = src.make("style ** *.scss");
let srcJsWatchFolder = src.make("js ** *.js");

let buildViewFolder = build.make();
let buildStyleFolder = build.make("css");
let buildJsFolder = build.make("js");
let buildImgFolder = build.make("img");
let buildFontsFolder = build.make("fonts");

gulp.task("build:view", () => {
    gulp.src(srcViewFolder)
        .pipe(pug())
        .pipe(gulp.dest(buildViewFolder));
});

gulp.task("build:style", () => {
    gulp.src(srcStyleFolder)
        .pipe(scss())
        .pipe(gulp.dest(buildStyleFolder));
});

gulp.task("build:js", () => {
    gulp.src(srcJsFolder)
        .pipe(gulp.dest(buildJsFolder));
});

gulp.task("build:img", () => {
    gulp.src(srcImgFolder)
        .pipe(gulp.dest(buildImgFolder));
});

gulp.task("build:fonts", () => {
    gulp.src(srcFontsFolder)
        .pipe(gulp.dest(buildFontsFolder));
});

gulp.task("server", (done) => {
    var server = http.createServer((req, res) => {
        req.addListener("end",  () => {
            fileServer.serve(req, res, (err, result) => {
                if (err) {
                    res.writeHead(err.status, err.headers);
                    res.end(err.message);
                }
            });
        }).resume();
    });

    server.listen(8080, () => {
        done();
    });
});

gulp.task("build", ["build:view", "build:style", "build:js", "build:img", "build:fonts"], (done) => {
    done();
});

gulp.task("watch", (done) => {
    gulp.watch(srcViewWatchFolder, ["build:view"]);
    gulp.watch(srcStyleWatchFolder, ["build:style"]);
    gulp.watch(srcJsWatchFolder, ["build:js"]);
    gulp.watch(srcImgFolder, ["build:img"]);
    gulp.watch(srcFontsFolder, ["build:fonts"]);
    setTimeout(() => {console.log("watching");}, 1);
    done();
});

gulp.task("default", ["build", "watch"], (done) => {
    gulp.start("server");
    done();
});