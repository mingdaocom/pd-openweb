const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const { merge } = require('webpack-merge');
const deleteSync = require('del').deleteSync;
const each = require('gulp-each');
const chalk = require('chalk');
const $ = require('gulp-load-plugins')();
const generate = require('./CI/generate');
const serve = require('./CI/serve');
const webpackConfig = require('./CI/webpack.config');
const webpackConfigForMdFunction = require('./CI/webpack.mdfunction.config');
const { webpackTaskFactory, findEntryMap, uploadFunctionFileToWorksheet } = require('./CI/utils');
require('./locale/gulplang');
const isProduction = process.env.NODE_ENV === 'production';

function handleError(err) {
  console.error(err.toString());
  process.exit(-1);
}

/** 生成 html 入口模板 */
gulp.task('generate-mainweb', done => {
  try {
    generate();
    done();
  } catch (err) {
    handleError(err);
  }
});

/** 前端 server 服务 */
gulp.task('server', done => {
  serve({ done });
});

/** 前端 server 服务 */
gulp.task('server:production', done => {
  serve({ isProduction: true, done });
});

/** webpack 构建任务 */
gulp.task(
  'webpack',
  webpackTaskFactory(merge(webpackConfig(), { entry: findEntryMap(isProduction ? 'index' : undefined) }), false),
);
gulp.task('webpack:watch', webpackTaskFactory(merge(webpackConfig(), { entry: findEntryMap() }), true));

gulp.task(
  'singleEntryExtractModulesWebpack',
  webpackTaskFactory(
    merge(webpackConfig('singleExtractModules'), { entry: findEntryMap('singleExtractModules') }),
    false,
  ),
);

gulp.task(
  'singleEntryWebpack',
  webpackTaskFactory(merge(webpackConfig('single'), { entry: findEntryMap('single') }), false),
);

/** MdFunction 库构建 */
gulp.task('mdFunctionWebpack', webpackTaskFactory(webpackConfigForMdFunction, false));

function cleanStatic(done) {
  console.log('正在删除老文件');
  deleteSync(['./build/files/staticfiles/*'], { force: true });
  done();
}

function copyStatic(done) {
  console.log('正在复制静态资源');
  const task = gulp.parallel(
    () => gulp.src(['src/common/mdcss/iconfont/**/*']).pipe(gulp.dest('./build/files/staticfiles/iconfont')),
    () => gulp.src(['src/common/mdcss/**/*']).pipe(gulp.dest('./build/files/staticfiles/mdcss')),
    () => gulp.src(['src/common/mdjs/**/*']).pipe(gulp.dest('./build/files/staticfiles/mdjs')),
    () => gulp.src(['staticfiles/**/*']).pipe(gulp.dest('./build/files/staticfiles')),
    () => gulp.src(['staticfiles/html/**/*']).pipe(gulp.dest('./build/files')),
    () => gulp.src(['locale/**/*.js']).pipe(gulp.dest('./build/files/staticfiles/lang/')),
  );
  task(err => {
    if (!err) console.log('复制完成');
    done(err);
  });
}

gulp.task('copy', gulp.series(cleanStatic, copyStatic));

/** 清理 build 文件夹 */
gulp.task('clean-build', done => {
  deleteSync(['./build*'], { force: true });
  done();
});

const blackWordList = ['http://hart-dev.com', 'batheticrecords.com', 'http://developer.yahoo.com/yui/license.html'];

gulp.task('editCode', () => {
  return gulp
    .src(['./build/dist/**/*.js'])
    .pipe(
      each(function (content, file, callback) {
        if (content.startsWith('var')) {
          content = `(function(){\n${content}\n})()`;
        }
        callback(null, content);
      }),
    )
    .pipe($.replace(new RegExp(`(${blackWordList.join('|')})`, 'g'), '--****--'))
    .pipe(gulp.dest('./build/dist'));
});

/** 本地方法命令 */
gulp.task('watch', gulp.series('webpack:watch'));

gulp.task('dev:main', done => {
  const devWatchTasks = ['webpack:watch'];
  const devServeTasks = ['generate-mainweb', 'copy', 'server'];
  let devTasks;
  // 输出文件存在时先启服务后构建，否则先构建后启服务
  if (
    !(
      fs.existsSync('./build/dist/pack') &&
      fs.existsSync('./build/files') &&
      fs.existsSync('./build/dist/manifest.json')
    )
  ) {
    console.log(chalk.red('\n本地未找到构建好的文件，将在构建完成后启动服务。\n'));
    devTasks = devWatchTasks.concat(devServeTasks);
  } else {
    devTasks = devServeTasks.concat(devWatchTasks);
  }
  gulp.series(...devTasks, alldone => {
    alldone();
    done();
  })();
});

/** 构建 ->  webpack 编译 js 代码，生成至 ./build/dist */
gulp.task('release', gulp.series('clean-build', 'webpack', 'singleEntryExtractModulesWebpack', 'singleEntryWebpack'));

/** 清理 sourceMap, LICENSE 文件 */
gulp.task('clean-file', done => {
  deleteSync(['./build/**/*.map', './build/**/*.LICENSE.txt'], { force: true });
  done();
});

/** 发布 ->
 * 1. 替换编译后的 js 代码里的服务端地址
 * 2. 按发布环境生成主站内的入口文件
 * 3. 按发布环境生成静态页面文件
 * 4. 拷贝静态资源
 */
gulp.task('publish', publishdone => {
  // if (!(fs.existsSync('./build/dist/pack') && fs.existsSync('./build/dist/manifest.json'))) {
  //   console.log(chalk.red('publish 失败💀'));
  //   console.log('dist 文件不存在，请先执行 release 操作');
  //   return;
  // }
  gulp.series('clean-file', 'editCode', 'generate-mainweb', 'copy', function log(done) {
    done();
    publishdone();
    console.log(chalk.green('publish 成功 🎉'));
  })();
});

/** 打包函数库 */
gulp.task('build-md-function', alldone => {
  const filePath = path.join(__dirname, './build/dist/mdfunction.bundle.js');
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  gulp.series('mdFunctionWebpack', function log(done) {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath).toString();
      fs.writeFileSync(
        filePath,
        'var _l=function(c){ return (typeof c === "string" ? c : String(c)).replace(/%0\d+$/g, "");};' +
          content +
          `
          if (typeof window === "undefined") { window = {} }
          var safeParse = JSON.parse;
          var executeMdFunction = MdFunction.run;
          if (typeof window !== "undefined") { window.executeMdFunction = executeMdFunction; }
          if (typeof module !== "undefined") { module.exports = {
            run: obj => MdFunction.run(obj, 'obj'),
            runWithString: str => MdFunction.run(str, 'str'),
          } }
        `,
      );

      console.log(chalk.green('明道函数功能运算核心库构建成功 🎉🎉🎉 '));
    } else {
      console.log(chalk.red('💀 没有找到生成的文件'));
    }
    done();
    alldone();
  })();
});
