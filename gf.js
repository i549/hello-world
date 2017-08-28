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
