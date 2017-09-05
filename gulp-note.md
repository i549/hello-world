gulp构建前端项目
    
    1. gulp安装命令
        sudo npm install -g gulp

    2. 在根目录下新建package.json文件
        npm init .

    3. 安装gulp包
        npm install gulp --save-dev


安装常用插件

        sass的编译                      （gulp-ruby-sass）
        自动添加css前缀                 （gulp-autoprefixer）
        压缩css                         （gulp-minify-css）
        js代码校验                      （gulp-jshint）
        合并js文件                      （gulp-concat）
        压缩js代码                      （gulp-uglify）
        压缩图片                        （gulp-imagemin）
        自动刷新页面                    （gulp-livereload）
        图片缓存，只有图片替换了才压缩  （gulp-cache）
        更改提醒                        （gulp-notify）
        清除文件                        （del）

    npm install gulp-ruby-sass gulp-autoprefixer gulp-minify-css gulp-jshint gulp-concat gulp-uglify gulp-imagemin gulp-notify gulp-rename gulp-livereload gulp-cache del --save-dev

    注：-save和-save-dev可以省掉你手动修改package.json文件的步骤
        npm install module-name -save 自动把模块和版本号添加到dependencies部分
        npm install module-name -save-dev 自动把模块和版本号添加到devdependencies部分


gulpfile.js加载模块

        var gulp = require('gulp'),
            jshint = require('gulp-jshint'),
            uglify = require('gulp-uglify'),
            concat = require('gulp-concat');

        gulp.task('js', function () {
           return gulp.src('js/*.js')
              .pipe(jshint())
              .pipe(jshint.reporter('default'))
              .pipe(uglify())
              .pipe(concat('app.js'))
              .pipe(gulp.dest('build'));
        });

    这种一一加载的写法，比较麻烦。使用gulp-load-plugins模块，可以加载package.json文件中所有的gulp模块。

    package.json中包含以下内容：
        {
           "devDependencies": {
              "gulp-concat": "~2.2.0",
              "gulp-uglify": "~0.2.1",
              "gulp-jshint": "~1.5.1",
              "gulp": "~3.5.6"
           }
        }

    gulpfile.js中写法
        var gulp = require('gulp');
        var $ = require('gulp-load-plugins')();
        gulp.task('js', function () {
           return gulp.src('js/*.js')
              .pipe($.jshint())
              .pipe($.jshint.reporter('default'))
              .pipe($.uglify())
              .pipe($.concat('app.js'))
              .pipe(gulp.dest('build'));
        });


gulp命令
    
    gulp.task(name[, deps], fn) 定义任务  name：任务名称 deps：依赖任务名称 fn：回调函数

    gulp.run(tasks...)：尽可能多的并行运行多个task

    gulp.watch(glob, fn)：当glob内容发生改变时，执行fn

    gulp.src(glob)：置需要处理的文件的路径，可以是多个文件以数组的形式，也可以是正则

    gulp.dest(path[, options])：设置生成文件的路径
