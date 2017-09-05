'use strict';

var gulp = require('gulp');
//var jshint = require('jshint');
var $ = require('gulp-load-plugins')();
var del = require('del');
var merge = require('merge-stream');
var runSequence = require('run-sequence');
var amdOptimize = require('amd-optimize');
var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');

// 设置参数
var RELEASE = !!argv.release;             // 是否在构建时压缩和打包处理
var DEMO = !!argv.demo;                   // 是否在构建Demo环境
var AUTOPREFIXER_BROWSERS = [             // autoprefixer 配置
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];
console.log('release =', RELEASE);
console.log('demo =', DEMO);

var src = {
    assets: 'assets/**/*',
    images: 'images/**/*',
    pages: 'pages/**/*',
    dataJs: 'dataJs/**/*',
    styles: ['styles/bootstrap.less', 'styles/partials/**/*.{css,less}', 'styles/**/**'],
    scripts: ['scripts/**/*.js', '!scripts/**/*.min.js', 'scripts/**/*.min.js', 'scripts/**/*.json', 'scripts/**/**']
};

var pkgs = require('./package.json').dependencies;

gulp.task('default', ['server'], function () {
    gulp.start('help');
});

// 清除
gulp.task('clean', del.bind(null, ['build/*'], {dot: true}));

// 第三方插件管理
gulp.task('vendor', function () {
    return merge(
        gulp.src('node_modules/jquery/dist/*.*')
            .pipe(gulp.dest('build/js/vendor/jquery')),
        gulp.src('node_modules/bootstrap/dist/js/*.*')
            .pipe(gulp.dest('build/js/vendor/bootstrap'))
    );
});

// 静态资源文件
gulp.task('assets', function () {
    return gulp.src(src.assets)
        .pipe(gulp.dest('build'));
});

// 图片
gulp.task('images', function () {
    return gulp.src(src.images)
        .pipe($.plumber({errorHandler: $.notify.onError('images Error: <%= error.message %>')}))
        //.pipe($.cache($.imagemin({
        //    progressive: true,
        //    interlaced: true
        //})))
        //.pipe($.imagemin({
        //    progressive: true,
        //    interlaced: true
        //}))
        .pipe($.changed('build/images'))
        .pipe(gulp.dest('build/images'));
});

// 字体
gulp.task('fonts', function () {
    return gulp.src('node_modules/bootstrap/fonts/**')
        .pipe(gulp.dest('build/fonts'));
});

// 在线帮助的文件
gulp.task('onlinehelp', function () {
    return gulp.src('onlinehelp/**/*.*')
        .pipe(gulp.dest('build/onlinehelp'));
});

// HTML 页面
gulp.task('pages', function () {
    return gulp.src(src.pages)
        .pipe($.plumber({errorHandler: $.notify.onError('pages Error: <%= error.message %>')}))
        .pipe($.changed('build', {extension: '.html'}))
        .pipe(gulp.dest('build'));
});

// CSS 样式
gulp.task('styles-base', function () {
    return gulp.src('styles/bootstrap.less')
        //return gulp.src(src.styles[0])
        .pipe($.plumber({errorHandler: $.notify.onError('styles Error: <%= error.message %>')}))
        .pipe($.if(!RELEASE, $.sourcemaps.init()))
        .pipe($.less())
        .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
        .pipe($.csscomb())
        .pipe(RELEASE ? $.cssmin() : $.util.noop())
        //.pipe($.cssmin())
        .pipe($.rename('style.css'))
        //.pipe($.if(!RELEASE, $.sourcemaps.write()))
        .pipe($.changed('build/css', {extension: '.less'}))
        .pipe(gulp.dest('build/css'));
});
gulp.task('styles', function () {
    //return gulp.src('styles/bootstrap.less')
    return gulp.src(src.styles[1])
        .pipe($.plumber({errorHandler: $.notify.onError('styles Error: <%= error.message %>')}))
        //.pipe($.if(!RELEASE, $.sourcemaps.init()))
        .pipe($.less())
        .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
        .pipe($.csscomb())
        .pipe(RELEASE ? $.cssmin() : $.util.noop())
        //.pipe($.cssmin())
        //.pipe($.rename('style.css'))
        //.pipe($.if(!RELEASE, $.sourcemaps.write()))
        .pipe($.changed('build/css/partials', {extension: '.less'}))
        .pipe(gulp.dest('build/css/partials'));
});

// JavaScript
gulp.task('scripts', function () {
    return gulp.src(src.scripts.slice(0, 1))
        //.pipe(jshint()) // 进行js静态检查
        //.pipe(jshint.reporter('default')) // 对js代码进行报错提示
        .pipe($.plumber({errorHandler: $.notify.onError('scripts Error: <%= error.message %>')}))
        //.pipe($.if(!RELEASE, $.sourcemaps.init()))
        .pipe($.if(RELEASE, $.uglify({mangle: false})))
        //.pipe($.rename({suffix:'.min'}))
        //.pipe($.if(!RELEASE, $.sourcemaps.write()))
        .pipe($.changed('build/js'))
        .pipe(gulp.dest('build/js'));
});
gulp.task('unscripts', function () {
    return gulp.src(src.scripts.slice(2))
        .pipe($.plumber({errorHandler: $.notify.onError('unscripts Error: <%= error.message %>')}))
        //.pipe($.if(!RELEASE, $.sourcemaps.init()))
        //.pipe($.if(RELEASE, $.uglify({ mangle: false })))
        //.pipe($.if(!RELEASE, $.sourcemaps.write()))
        .pipe($.changed('build/js'))
        .pipe(gulp.dest('build/js'));
});


// Build
gulp.task('build', ['clean'], function (cb) {
    if (DEMO) {
        runSequence(['pages', 'assets', 'vendor', 'images', 'fonts', 'styles-base', 'styles', 'unscripts', 'scripts', 'MockData', 'onlinehelp'], cb);
    } else {
        runSequence(['pages', 'assets', 'vendor', 'images', 'fonts', 'styles-base', 'styles', 'unscripts', 'scripts', 'onlinehelp'], cb);
    }
});

// MockData
gulp.task('MockData', function () {
    var baseUrl = 'dataJs';
    var appendData = '';
    var mockJsFile = './scripts/plugins/mockData/MockData.js';
    var files;
    fs.writeFileSync(mockJsFile, 'define( [ \'plugins/mockData/mock-min\'], function (Mock) {\n' +
    'var errorData = {"success": false,"data": null,"failCode": 404,"params": null,"message": "没有找到此文件"};\n', 'utf8'); //同步写入
    if (fs.existsSync(baseUrl)) { //获取目录下的文件
        files = fs.readdirSync(baseUrl);

        for (var i = 0, fileLen = files.length; i < fileLen; i++) {
            var _thisFile = files[i];
            var objName = _thisFile.replace('.js', '');
            var requireFile = "./" + baseUrl + "/" + objName;
            var _thisObj = require(requireFile);
            for (var item in _thisObj) {
                var _thisTemplate = _thisObj[item];
                if (typeof _thisObj[item] === "object") {
                    _thisTemplate = JSON.stringify(_thisTemplate);
                }
                appendData = 'Mock.mock("/' + objName + '/' + item + '",' + _thisTemplate + ');\n';
                fs.appendFileSync(mockJsFile, appendData, 'utf8');
            }
        }
        imageFunc();
        var reg = /^\//;
        fs.appendFileSync(mockJsFile, '\n  $.ajaxPrefilter(function (options, originalOptions, jqXHR) { if((options.type).toUpperCase() == \'GET\'){options.cache = true;} (!(' + reg + '.test(options.url))) && (options.url = "/" + options.url)});\n  ' +
        '\n  var tokenId = parseInt(1000000000*Math.random()); ' +
        '\n return {config: {isMock: true,login: function (user) {' +
        'tokenId && Cookies.setCookByName(\'tokenId\', tokenId);' +
        'if (user) {' +
        'Cookies.setCookByName(\'userName\', user.userName);' +
        'Cookies.setCookByName(\'loginName\', user.loginName);' +
        'Cookies.setCookByName(\'userid\', user.userid);' +
        'Cookies.setCookByName(\'userType\', user.userType);' +
        '}' +
        '}}};\n});', 'utf8');
        //createStreamFile();
    } else {
        console.log(baseUrl + "  Not Found!");
    }

    function imageFunc() {
        var srtImgFun = '\n var regArr = [".jpg",".gif",".svg",".png"];' +
            '//var reg=/^?(\.jpg|\.png|\.gif|\.svg)$/;\n' +
            'var imgs= $("img");' +
            'if(imgs.length){' +
            '$.each(imgs,function(index,item){' +
            'var thisImgSrc = $(item).attr("src");' +
            'console.log(thisImgSrc);' +
            'var thisImgSrcType = $(item).attr("src").slice(-4);' +
            'if(thisImgSrcType.indexOf(regArr)<0){' +
            '$.get(thisImgSrc,function(result){' +
            'console.log(result);' +
            'var data = JSON.parse(result);' +
            '$(item).attr("src",data.imageUrl);' +
            '/*$(item).attr("src", eval(result));*/' +
            '})' +
            '}' +
            '}' +
            ')}';
        fs.appendFileSync(mockJsFile, srtImgFun, 'utf8');
    }
});
// 运行 BrowserSync
gulp.task('server', ['build'], function () {

    var path = require('path');
    var url = require('url');
    var fs = require('fs');
    var browserSync = require('browser-sync');
    var proxyMiddleware = require('http-proxy-middleware');
    var Mock = require('mockjs');
    var uuid = require('uuid');

    var middleware = [];
    var isMock = DEMO;

    if (isMock) {
        middleware = function (req, res, next) {
            var urlObj = url.parse(req.url, true),
                method = req.method,
                query = urlObj.query,
                mockUrl,
                newSearch = '';

            var body = '';
            req.on('data', function (data) {
                body += data;
            });

            req.on('end', function () {

                if (urlObj.pathname.match(/\..+$/) || urlObj.pathname.match(/\/$/)) {
                    next();
                    return;
                }
                console.log('[requist] ', method, urlObj.pathname, body);
                var rts = /([?&])_=[^&]*/;
                if (rts.test(req.url)) {
                    delete query._;

                    if (JSON.stringify(query) !== "{}") {
                        newSearch = '?';
                        newSearch += JSON.stringify(query).replace(/[\"\{\}]/g, "").replace(/\:/g, "=").replace(/\,/g, "&");
                    }
                }

                var pathTree = urlObj.pathname.split('/');
                var mockDataFile = path.join(__dirname + path.sep + 'dataJs', path.sep + pathTree[1]) + ".js";
                //file exist or not
                fs.access(mockDataFile, fs.F_OK, function (err) {
                    var isImage = req.headers.accept.indexOf('image') != -1;

                    if (err) {
                        var c = {
                            "success": false,
                            "data": null,
                            "failCode": 404,
                            "params": null,
                            "message": "无响应数据",
                            "notFound": mockDataFile
                        };
                        //console.log('[response] ', c);
                        res.setHeader('Content-Type', (isImage ? 'image/*' : 'application/json'));
                        res.end(JSON.stringify(c));
                        next();
                        return;
                    }

                    try {
                        delete require.cache[require.resolve(mockDataFile)];

                        var data = require(mockDataFile) || {};
                        var result, mockUrl = pathTree[2] + newSearch;

                        if (data[mockUrl] && typeof data[mockUrl] === "object") {
                            result = Mock.mock(data[mockUrl]);
                        } else if (typeof data[mockUrl] === 'function') {
                            var options = {body: JSON.parse(body) || {}};
                            result = Mock.mock(data[mockUrl](options));
                        }
                        isImage && (result = Mock.Random.image(data[mockUrl]));

                        res.setHeader('Access-Control-Allow-Origin', '*');
                        res.setHeader('Content-Type', (isImage ? 'image/*' : 'application/json'));
                        res.setHeader('tokenId', uuid.v1());
                        var s = result || {
                                "success": false,
                                "data": null,
                                "failCode": 0,
                                "params": null,
                                "message": null
                            };
                        //console.log('[response] ', JSON.stringify(s));
                        res.end(JSON.stringify(s) || s);
                    } catch (e) {
                        console.error(e);
                    }
                });

            });
            //next();
        };
    } else {
        var host = 'http://10.10.16.135:8080';
        middleware = [
            proxyMiddleware(['/auth'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/ssoClient'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/povertyAll'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/village'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/inspect'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/params'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/workflow'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/defect'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/oMMap'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/domain'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/user'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/role'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/devAlarm'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/dataLimit'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/alarmSetting'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/alarmModel'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/station'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/systemNote'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/devControl'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/devPV'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/plants'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/dispersion'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/signalmodel'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/realTimeAlarm'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/rm'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/inverterRm'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/cnRm'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/signalconf'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/fileManager'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/devManager'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/devSupplement'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/devUpgrade'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/upgrade'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/upGradePackManage'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/pinnetDc'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/indexhtml'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/documentManage'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/ongridprice'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/enterpriseInfo'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/license'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/devLicense'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/ivcurve'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/dpu'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/thirdInterface'], {target: host, changeOrigin: true}),
            proxyMiddleware(['/logManage'], {target: host, changeOrigin: true})
        ];
    }

    browserSync({
        //files: '/build/**', //监听整个项目
        open: false, // 'external' 打开外部URL, 'local' 打开本地主机URL
        //https: true,
        port: 80,
        online: false,
        notify: false,
        logLevel: "info",
        logPrefix: "iems mock",
        logConnections: true, //日志中记录连接
        logFileChanges: true, //日志信息有关更改的文件
        scrollProportionally: false, //视口同步到顶部位置
        ghostMode: {
            clicks: false,
            forms: false,
            scroll: false
        },
        server: {
            baseDir: './build',
            middleware: middleware
        }
    });

    gulp.watch(src.assets, ['assets']);
    gulp.watch(src.images, ['images']);
    gulp.watch(src.pages, ['pages']);
    gulp.watch(src.dataJs, ['MockData']);
    gulp.watch(src.styles, ['styles-base', 'styles']);
    //gulp.watch(src.styles[2], ['styles']);
    gulp.watch(src.scripts[4], ['unscripts', 'scripts']);
    gulp.watch('./build/**/*.*', function (file) {
        browserSync.reload(path.relative(__dirname, file.path));
    });

});

gulp.task('help', function () {
    console.log('	gulp build			        文件发布打包');
    console.log('	gulp assets			        静态资源文件发布');
    console.log('	gulp images			        图片文件发布');
    console.log('	gulp pages			        html（模板）页面文件发布');
    console.log('	gulp styles			        css（less）层叠样式文件发布');
    console.log('	gulp scripts			    JavaScript脚本文件发布');
    console.log('	gulp help			        gulp参数说明');
    console.log('	gulp server			        测试server');
    console.log('	gulp --demo  			    生产环境（默认生产环境）');
    console.log('	gulp --deploy			    生产环境（默认生产环境）');
    console.log('	gulp --release			    开发环境');
});
