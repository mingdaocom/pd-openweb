const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const { merge } = require('webpack-merge');
const gutil = require('gulp-util');
const $ = require('gulp-load-plugins')();
const generate = require('./CI/generate');
const serve = require('./CI/serve');
const webpackConfig = require('./CI/webpack.config');
const webpackConfigForMdFunction = require('./CI/webpack.mdfunction.config');
const webpackSingleConfig = require('./CI/webpack.single.config');
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
  webpackTaskFactory(merge(webpackConfig, { entry: findEntryMap(isProduction ? 'index' : undefined) }), false),
);
gulp.task('webpack:watch', webpackTaskFactory(merge(webpackConfig, { entry: findEntryMap() }), true));

gulp.task(
  'singleEntryWebpack',
  webpackTaskFactory(merge(webpackSingleConfig, { entry: findEntryMap('single') }), false),
);

/** MdFunction 库构建 */
gulp.task('mdFunctionWebpack', webpackTaskFactory(webpackConfigForMdFunction, false));

function pipeAll(pipes, done) {
  const length = pipes.length;
  let count = 0;
  pipes.forEach(p => {
    p.on('end', () => {
      count += 1;
      if (count === length) {
        done();
      }
    });
  });
}

async function copy(done) {
  pipeAll(
    [
      gulp.src(['src/library/**/*']).pipe(gulp.dest('./build/files/staticfiles/library')),
      gulp.src(['src/common/mdcss/**/*']).pipe(gulp.dest('./build/files/staticfiles/mdcss')),
      gulp.src(['src/common/mdjs/**/*']).pipe(gulp.dest('./build/files/staticfiles/mdjs')),
      gulp.src(['src/pages/Admin/**/*.png']).pipe(gulp.dest('./build/files/staticfiles/components/Admin')),
      gulp.src(['src/components/pay/**/*']).pipe(gulp.dest('./build/files/staticfiles/components/pay')),
      gulp.src(['src/components/upgrade/**/*']).pipe(gulp.dest('./build/files/staticfiles/components/upgrade')),
      gulp.src(['src/components/images/**/*']).pipe(gulp.dest('./build/files/staticfiles/components/images')),
      gulp.src(['staticfiles/**/*']).pipe(gulp.dest('./build/files/staticfiles')),
      gulp.src(['staticfiles/html/**/*']).pipe(gulp.dest('./build/files')),
      gulp.src(['locale/**/*.js']).pipe(gulp.dest('./build/files/staticfiles/lang/')),
    ],
    done,
  );
}

gulp.task('copy', done => {
  console.log('正在删除老文件');
  gulp
    .src(['./build/files/staticfiles/*'])
    .pipe($.clean({ force: true }))
    .on('finish', () => {
      console.log('正在复制静态资源');
      copy(() => {
        console.log('复制完成');
        done();
      });
    });
});

/** 清理 build 文件夹 */
gulp.task('clean-build', done => {
  gulp.src(['./build*']).pipe($.clean({ force: true }));
  done();
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
    console.log(gutil.colors.red('\n本地未找到构建好的文件，将在构建完成后启动服务。\n'));
    devTasks = devWatchTasks.concat(devServeTasks);
  } else {
    devTasks = devServeTasks.concat(devWatchTasks);
  }
  gulp.series.apply(
    null,
    devTasks.concat(function lastdone(alldone) {
      alldone();
      done();
    }),
  )();
});

/** 构建 ->  webpack 编译 js 代码，生成至 ./build/dist */
gulp.task('release', gulp.series('clean-build', 'webpack', 'singleEntryWebpack'));

/** 清理 sourceMap, LICENSE 文件 */
gulp.task('clean-file', done => {
  gulp.src(['./build/**/*.map', './build/**/*.LICENSE.txt']).pipe($.clean({ force: true }));
  done();
});

/** 发布 ->
 * 1. 替换编译后的 js 代码里的服务端地址
 * 2. 按发布环境生成主站内的入口文件
 * 3. 按发布环境生成静态页面文件
 * 4. 拷贝静态资源
 */
gulp.task('publish', publishdone => {
  if (!(fs.existsSync('./build/dist/pack') && fs.existsSync('./build/dist/manifest.json'))) {
    console.log(gutil.colors.red('publish 失败💀'));
    console.log('dist 文件不存在，请先执行 release 操作');
    return;
  }
  gulp.series('clean-file', 'generate-mainweb', 'copy', function log(done) {
    done();
    publishdone();
    console.log(gutil.colors.green('publish 成功 🎉'));
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
        'var _l=function(c){ return c;};' +
          content +
          `
          var executeMdFunction = MdFunction.run;
          if (typeof window !== "undefined") { window.executeMdFunction = executeMdFunction; }
          if (typeof module !== "undefined") { module.exports = {
            run: obj => MdFunction.run(obj, 'obj'),
            runWithString: str => MdFunction.run(str, 'str'),
          } }
        `,
      );
      console.log(gutil.colors.green('明道函数功能运算核心库构建成功 🎉🎉🎉 '));
    } else {
      console.log(gutil.colors.red('💀 没有找到生成的文件'));
    }
    done();
    alldone();
  })();
});

/** 上传函数库 */
gulp.task('upload-md-function', done => {
  const filePath = path.join(__dirname, './build/dist/mdfunction.bundle.js');
  console.log(gutil.colors.green('开始上传到 JavaScript 库交付 工作表...'));
  uploadFunctionFileToWorksheet(filePath, err => {
    if (err) {
      console.log(gutil.colors.red('上传失败 💀 '));
      done();
    } else {
      console.log(gutil.colors.green('上传成功 🎉🎉🎉 '));
      done();
    }
  });
});
