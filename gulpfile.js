const path = require("path");
const fs   = require("fs");

const gulp  = require("gulp"),
      pug   = require("gulp-pug"),
      scss  = require("gulp-sass"),
      sourcemaps = require("gulp-sourcemaps"),
      tsc = require("gulp-typescript"),
      zpath = require("zpath");

const fileServer = new (require("node-static")).Server("./build", {cache: 0, headers: {"Cache-Control": "no-cache, must-revalidate"}});
const http = require("http");

const src = zpath.create("src");
const build = zpath.create("build");

let srcViewFolder = src.make("view *.pug");
let srcStyleFolder = src.make("style *.scss");
let srcJsFolder = src.make("js *.js");
let srcTsFolder = src.make("scripts *.ts");
let srcImgFolder = src.make("img ** *.*");
let srcFontsFolder = src.make("fonts ** *.*");

let srcViewWatchFolder = src.make("view ** *.pug");
let srcStyleWatchFolder = src.make("style ** *.scss");
let srcTsWatchFolder = src.make("scripts ** *.ts");
let srcJsWatchFolder = src.make("js ** *.js");

let buildViewFolder = build.make();
let buildStyleFolder = build.make("css");
let buildJsFolder = build.make("js");
let buildTsFolder = buildJsFolder;
let buildImgFolder = build.make("img");
let buildFontsFolder = build.make("fonts");

gulp.task("build:view", () => {
    gulp.src(srcViewFolder)
        .pipe(pug())
        .pipe(gulp.dest(buildViewFolder));
});

gulp.task("build:style", () => {
    gulp.src(srcStyleFolder)
        .pipe(sourcemaps.init())
        .pipe(scss({outputStyle: "compressed"}).on("error", scss.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(buildStyleFolder));
});

gulp.task("build:js", () => {
    gulp.src(srcJsFolder)
        .pipe(gulp.dest(buildJsFolder));
});

gulp.task("build:ts", () => {
    gulp.src(srcTsFolder)
        .pipe(tsc({
            noImplicitAny: true,
            target: "ES5"
        }))
        .pipe(gulp.dest(buildTsFolder));
})

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

gulp.task("build", ["build:view", "build:style", "build:js", "build:ts","build:img", "build:fonts"], (done) => {
    done();
});

gulp.task("make:fs",(done) => {
    // define file system
    let project = require("./define.fs.json");

    //get object with folder name and inner folder names
    let srcRootFolder = project.srcFolders;

    // create root folder
    fs.mkdir(path.normalize(srcRootFolder.root), function (e, msg) {
        if (e) {
            console.error(`ERROR ${e.message}`);
            if (e.code != "EEXIST") {
                done();
                return;
            }
        } else {
            console.log(`OK! ${path.normalize(srcRootFolder.root)} created`);
        }

        // create inner folders
        srcRootFolder.inners.forEach(function (value, index, array) {
            let curPath = path.join(srcRootFolder.root, value);
            fs.mkdir(curPath, doAfterMkdir(curPath, index, array, done));
        });
    });

    function doAfterMkdir(msg, index, arr, cl) {
        return function (e) {
            if (e) {
                console.error(`ERROR ${e.message}`);
                if (index === (arr.length - 1)) {
                    cl();
                }
                return;
            }
            console.log(`OK! ${msg} created`);         
            if (index === (arr.length - 1)) {
                cl();
            }
        }
    }
});

gulp.task("watch", (done) => {
    gulp.watch(srcViewWatchFolder, ["build:view"]);
    gulp.watch(srcStyleWatchFolder, ["build:style"]);
    gulp.watch(srcJsWatchFolder, ["build:js"]);
    gulp.watch(srcTsWatchFolder, ["build:ts"]);
    gulp.watch(srcImgFolder, ["build:img"]);
    gulp.watch(srcFontsFolder, ["build:fonts"]);
    setTimeout(() => {console.log("watching");}, 1);
    done();
});

gulp.task("default", ["build", "watch"], (done) => {
    gulp.start("server");
    done();
});