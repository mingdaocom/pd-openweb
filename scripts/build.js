const fs = require('fs');
const path = require('path');
const { fork } = require('child_process');

const chalk = require('chalk');
const { merge } = require('webpack-merge');

const generate = require('../CI/generate');
const serve = require('../CI/serve');
const { findEntryMap, uploadFunctionFileToWorksheet, webpackTaskFactory } = require('../CI/utils');
const webpackConfig = require('../CI/webpack.config');
const webpackConfigForMdFunction = require('../CI/webpack.mdfunction.config');
const webpackConfigForMingoEntryWidget = require('../CI/webpack.mingo-entry-widget.config');
const { ROOT_PATH } = require('./utils');

const isProduction = process.env.NODE_ENV === 'production';
const blackWordList = ['http://hart-dev.com', 'batheticrecords.com', 'http://developer.yahoo.com/yui/license.html'];
const keepAliveCommands = new Set(['dev', 'dev:main', 'server', 'server:production', 'watch', 'webpack:watch']);

// 拼接项目根目录下的绝对路径，避免命令执行目录影响文件定位。
function resolvePath(...segments) {
  return path.join(ROOT_PATH, ...segments);
}

// 将普通字符串转成可安全放入 RegExp 的匹配片段。
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatDuration(ms) {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }

  const totalSeconds = Math.round(ms / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  const parts = [];

  if (hours) {
    parts.push(`${hours}h`);
  }

  if (hours || minutes) {
    parts.push(`${minutes}m`);
  }

  parts.push(`${seconds}s`);
  return parts.join(' ');
}

// 将 callback 风格任务包装成 Promise，方便按构建顺序串行执行。
function runTask(task) {
  return new Promise((resolve, reject) => {
    let settled = false;

    const done = err => {
      if (settled) return;

      settled = true;
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    };

    try {
      task(done);
    } catch (err) {
      reject(err);
    }
  });
}

// 执行 webpack 构建任务，watch 模式会在首轮编译结束后 resolve。
function runWebpackTask(config, isWatch = false) {
  return runTask(webpackTaskFactory(config, isWatch));
}

// 递归遍历目录下的文件，并对每个文件执行传入的处理函数。
function walkFiles(dirPath, handler) {
  if (!fs.existsSync(dirPath)) return;

  fs.readdirSync(dirPath, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      walkFiles(fullPath, handler);
      return;
    }

    if (entry.isFile()) {
      handler(fullPath);
    }
  });
}

// 递归复制目录内容，目标目录不存在时自动创建。
function copyDir(sourcePath, targetPath) {
  if (!fs.existsSync(sourcePath)) return;

  fs.mkdirSync(targetPath, { recursive: true });
  fs.cpSync(sourcePath, targetPath, { recursive: true });
}

// 删除目录下所有满足 matcher 条件的文件。
function deleteFilesByMatcher(basePath, matcher) {
  walkFiles(basePath, filePath => {
    if (matcher(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
}

// 根据 html template 生成 build/files 下的页面入口文件。
async function generateMainweb() {
  await generate();
}

// 启动本地静态服务，服务启动成功后 resolve。
function startServer(options = {}) {
  return new Promise(resolve => {
    serve({ ...options, done: resolve });
  });
}

// 以生产参数启动本地静态服务。
function startProductionServer() {
  return startServer({ isProduction: true });
}

// 构建主站入口资源，生产环境只编译 index 类型入口。
function buildWebpack() {
  return runWebpackTask(merge(webpackConfig(), { entry: findEntryMap(isProduction ? 'index' : undefined) }));
}

// 监听所有入口资源变化，并在首轮构建后继续后续流程。
function watchWebpack() {
  return runWebpackTask(merge(webpackConfig(), { entry: findEntryMap() }), true);
}

// 把 webpack watch 丢到独立子进程执行，避免编译占满事件循环时阻塞主进程的代理 / 静态服务。
// 子进程复用 build.js 的 webpack:watch 命令，首轮编译完成后通过 IPC 通知父进程。
function forkWebpackWatch() {
  return new Promise((resolve, reject) => {
    // 保留 ipc 通道，同时让子进程的日志直接打到当前终端
    const child = fork(__filename, ['webpack:watch'], { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] });

    const killChild = () => {
      if (!child.killed) child.kill();
    };
    process.on('exit', killChild);
    process.on('SIGINT', () => {
      killChild();
      process.exit(0);
    });
    process.on('SIGTERM', () => {
      killChild();
      process.exit(0);
    });

    child.on('message', message => {
      if (message && message.type === 'task-done') {
        resolve(child);
      }
    });
    child.on('error', reject);
    child.on('exit', code => {
      if (code) reject(new Error(`webpack watch 子进程异常退出，code: ${code}`));
    });
  });
}

// 构建单入口页面需要复用的公共模块资源。
function buildSingleEntryExtractModulesWebpack() {
  return runWebpackTask(merge(webpackConfig('singleExtractModules'), { entry: findEntryMap('singleExtractModules') }));
}

// 构建不走主站公共资源的单入口页面资源。
function buildSingleEntryWebpack() {
  return runWebpackTask(merge(webpackConfig('single'), { entry: findEntryMap('single') }));
}

// 构建明道函数运行核心库。
function buildMdFunctionWebpack() {
  return runWebpackTask(webpackConfigForMdFunction);
}

// 构建官网免登录输入框 JS 直嵌包。
function buildMingoEntryWidgetWebpack() {
  return runWebpackTask(webpackConfigForMingoEntryWidget);
}

// 清理发布目录中的旧静态资源，避免残留文件被再次发布。
function cleanStatic() {
  console.log('Removing old static files');
  fs.rmSync(resolvePath('build/files/staticfiles'), { recursive: true, force: true });
  fs.mkdirSync(resolvePath('build/files/staticfiles'), { recursive: true });
}

// 复制 locale 下的 js 翻译资源到静态资源语言目录。
function copyLocaleFiles() {
  const localePath = resolvePath('locale');
  const targetBasePath = resolvePath('build/files/staticfiles/lang');

  walkFiles(localePath, filePath => {
    if (path.extname(filePath) !== '.js') return;

    const targetPath = path.join(targetBasePath, path.relative(localePath, filePath));
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(filePath, targetPath);
  });
}

// 复制构建后页面运行需要的字体、图片、静态页面和语言资源。
function copyStatic() {
  console.log('Copying static files');
  copyDir(resolvePath('src/common/mdcss/iconfont'), resolvePath('build/files/staticfiles/iconfont'));
  copyDir(resolvePath('staticfiles'), resolvePath('build/files/staticfiles'));
  copyDir(resolvePath('staticfiles/html'), resolvePath('build/files'));
  copyLocaleFiles();
  console.log('Static files copied');
}

// 重新生成 build/files 下的静态资源目录。
function copy() {
  cleanStatic();
  copyStatic();
}

// 清理项目根目录下所有 build 开头的构建产物目录。
function cleanBuild() {
  fs.readdirSync(ROOT_PATH)
    .filter(name => /^build/.test(name))
    .forEach(name => fs.rmSync(resolvePath(name), { recursive: true, force: true }));
}

// 在 publish 前替换构建产物中的敏感字符串。
function editCode() {
  const distPath = resolvePath('build/dist');
  const blackWordPattern = new RegExp(`(${blackWordList.map(escapeRegExp).join('|')})`, 'g');

  walkFiles(distPath, filePath => {
    if (path.extname(filePath) !== '.js') return;

    const content = fs.readFileSync(filePath, 'utf8');
    const nextContent = content.replace(blackWordPattern, '--****--');

    if (nextContent !== content) {
      fs.writeFileSync(filePath, nextContent);
    }
  });
}

// 本地开发入口：确保 html 和静态资源生成后，再启动服务和 webpack watch。
async function devMain() {
  const hasBuildFiles =
    fs.existsSync(resolvePath('build/dist/pack')) &&
    fs.existsSync(resolvePath('build/files')) &&
    fs.existsSync(resolvePath('build/dist/manifest.json'));

  if (!hasBuildFiles) {
    console.log(chalk.red('\nNo local build found. The dev server will start after the first build finishes.\n'));
    await forkWebpackWatch();
    await generateMainweb();
    copy();
    await startServer();
    return;
  }

  await generateMainweb();
  copy();
  await startServer();
  await forkWebpackWatch();
}

// 完整编译 js/css 资源，输出到 build/dist。
async function release() {
  const startTime = process.hrtime.bigint();

  cleanBuild();
  await buildWebpack();
  await buildSingleEntryExtractModulesWebpack();
  await buildSingleEntryWebpack();
  await buildMingoEntryWidget();

  const duration = Number(process.hrtime.bigint() - startTime) / 1e6;
  console.log(chalk.green(`release success, duration: ${formatDuration(duration)}`));
}

// 生成可被 MDHome 直接 script 引入的官网免登录输入框 widget。
async function buildMingoEntryWidget() {
  const outputPath = webpackConfigForMingoEntryWidget.output.path;
  const filePath = path.join(outputPath, webpackConfigForMingoEntryWidget.output.filename);

  fs.rmSync(outputPath, { recursive: true, force: true });

  await buildMingoEntryWidgetWebpack();

  if (!fs.existsSync(filePath)) {
    console.log(chalk.red('mingo-entry-widget.js was not generated'));
    return;
  }

  console.log(chalk.green('mingo-entry-widget.js build success'));
}

// 删除 source map 和 LICENSE 文件，减少 publish 后的产物体积。
function cleanFile() {
  deleteFilesByMatcher(
    resolvePath('build'),
    filePath => path.extname(filePath) === '.map' || filePath.endsWith('.LICENSE.txt'),
  );
}

// 生成发布所需的 html、静态资源，并清理不需要发布的辅助文件。
async function publish() {
  cleanFile();
  editCode();
  await generateMainweb();
  copy();
  console.log(chalk.green('publish success'));
}

// 生成 mdfunction.bundle.js，并包装成浏览器和 Node 都可消费的格式。
async function buildMdFunction() {
  const filePath = resolvePath('build/dist/mdfunction.bundle.js');

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await buildMdFunctionWebpack();

  if (!fs.existsSync(filePath)) {
    console.log(chalk.red('mdfunction.bundle.js was not generated'));
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  fs.writeFileSync(
    filePath,
    'var _l=function(c){ return (typeof c === "string" ? c : String(c)).replace(/%0\\d+$/g, "");};' +
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
  console.log(chalk.green('mdfunction.bundle.js build success'));
}

// 将 mdfunction.bundle.js 上传到 JavaScript 库交付工作表。
function uploadMdFunction() {
  const filePath = resolvePath('build/dist/mdfunction.bundle.js');
  console.log(chalk.green('Uploading mdfunction.bundle.js'));

  return new Promise(resolve => {
    uploadFunctionFileToWorksheet(filePath, err => {
      if (err) {
        console.log(chalk.red('Upload failed'));
      } else {
        console.log(chalk.green('Upload success'));
      }

      resolve();
    });
  });
}

// 命令名到执行方法的映射，package.json 中的 build 命令会从这里取任务。
const commandMap = {
  copy,
  dev: devMain,
  'dev:main': devMain,
  editCode,
  'generate-mainweb': generateMainweb,
  'clean-build': cleanBuild,
  'clean-file': cleanFile,
  mdFunctionWebpack: buildMdFunctionWebpack,
  mingoEntryWidgetWebpack: buildMingoEntryWidgetWebpack,
  publish,
  release,
  server: startServer,
  'server:production': startProductionServer,
  singleEntryExtractModulesWebpack: buildSingleEntryExtractModulesWebpack,
  singleEntryWebpack: buildSingleEntryWebpack,
  'build-md-function': buildMdFunction,
  'build-mingo-entry-widget': buildMingoEntryWidget,
  'upload-md-function': uploadMdFunction,
  watch: watchWebpack,
  webpack: buildWebpack,
  'webpack:watch': watchWebpack,
};

// 读取命令行参数并执行对应构建任务。
async function main() {
  const command = process.argv[2] || 'dev:main';
  const task = commandMap[command];

  if (!task) {
    console.log(`Unknown build command: ${command}`);
    console.log(`Available commands: ${Object.keys(commandMap).sort().join(', ')}`);
    process.exitCode = 1;
    return;
  }

  // 作为子进程运行时，父进程一旦消失（含被 kill -9）IPC 通道会 disconnect，子进程随之自杀，避免残留孤儿进程
  if (process.send) {
    process.on('disconnect', () => process.exit(0));
  }

  await task();

  // 作为子进程（如 devMain fork 的 webpack:watch）运行时，首轮任务结束后通知父进程
  if (process.send) {
    process.send({ type: 'task-done', command });
  }

  if (!keepAliveCommands.has(command)) {
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exitCode = 1;
  });
}

module.exports = {
  commandMap,
};
