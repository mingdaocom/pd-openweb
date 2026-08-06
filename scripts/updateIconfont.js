const fs = require('fs');
const os = require('os');
const path = require('path');
const { ROOT_PATH, print, runCommand } = require('./utils');

const DEFAULT_DOWNLOAD_URL = 'https://www.iconfont.cn/api/project/download.zip?pid=2032949';
const DEFAULT_REFERER = 'https://www.iconfont.cn/manage/index?manage_type=myprojects&projectId=2032949';
const TARGET_DIR = path.join(ROOT_PATH, 'src/common/mdcss/iconfont');
const SESSION_CACHE_PATH = path.join(ROOT_PATH, '.iconfont-session');
const ICONFONT_FILES = ['iconfont.css', 'iconfont.ttf', 'iconfont.woff', 'iconfont.woff2'];

function walkFiles(dirPath, handler) {
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

function collectIconfontFiles(sourceDir) {
  const files = {};

  walkFiles(sourceDir, filePath => {
    const fileName = path.basename(filePath);

    if (ICONFONT_FILES.includes(fileName) && !files[fileName]) {
      files[fileName] = filePath;
    }
  });

  return files;
}

function isZipFile(filePath) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).size < 4) return false;

  const buffer = Buffer.alloc(4);
  const fd = fs.openSync(filePath, 'r');

  try {
    fs.readSync(fd, buffer, 0, 4, 0);
  } finally {
    fs.closeSync(fd);
  }

  return buffer[0] === 0x50 && buffer[1] === 0x4b;
}

function getFilePreview(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  return content.replace(/\s+/g, ' ').trim().slice(0, 500);
}

function readCachedEggSession() {
  if (!fs.existsSync(SESSION_CACHE_PATH)) return '';

  return fs.readFileSync(SESSION_CACHE_PATH, 'utf8').trim();
}

function cacheEggSession(eggSession) {
  fs.writeFileSync(SESSION_CACHE_PATH, `${eggSession}\n`, { mode: 0o600 });
  fs.chmodSync(SESSION_CACHE_PATH, 0o600);
}

function getCurlArgs(downloadUrl, zipPath, eggSession) {
  return [
    '-fL',
    downloadUrl,
    '-o',
    zipPath,
    '-H',
    'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    '-H',
    `Referer: ${DEFAULT_REFERER}`,
    '-H',
    `Cookie: EGG_SESS_ICONFONT=${eggSession}`,
  ];
}

async function main() {
  const inputEggSession = process.argv[2];
  const eggSession = inputEggSession || readCachedEggSession();

  if (!eggSession) {
    throw new Error(
      [
        '未找到 EGG_SESS_ICONFONT 缓存。',
        '首次使用请传入 EGG_SESS_ICONFONT 的 value:',
        'yarn iconfont:update "Hu68kBY7XO7C6Udp3T99..."',
      ].join('\n'),
    );
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'md-iconfont-'));
  const zipPath = path.join(tempDir, 'iconfont.zip');
  const unzipDir = path.join(tempDir, 'source');

  try {
    fs.mkdirSync(unzipDir, { recursive: true });

    print.info(`下载 iconfont: ${DEFAULT_DOWNLOAD_URL}`);
    await runCommand('curl', getCurlArgs(DEFAULT_DOWNLOAD_URL, zipPath, eggSession));

    if (!isZipFile(zipPath)) {
      const preview = getFilePreview(zipPath);

      throw new Error(
        [
          '下载结果不是 zip 文件，iconfont 可能返回了登录页或错误页。',
          preview ? `响应摘要: ${preview}` : '',
          '如果缓存已过期，请重新传入 EGG_SESS_ICONFONT 的 value:',
          'yarn iconfont:update "新的 EGG_SESS_ICONFONT value"',
        ]
          .filter(Boolean)
          .join('\n'),
      );
    }

    print.info('解压 iconfont 压缩包');
    await runCommand('unzip', ['-o', zipPath, '-d', unzipDir]);

    const files = collectIconfontFiles(unzipDir);
    const missingFiles = ICONFONT_FILES.filter(fileName => !files[fileName]);

    if (missingFiles.length) {
      throw new Error(`iconfont 压缩包缺少文件: ${missingFiles.join(', ')}`);
    }

    fs.mkdirSync(TARGET_DIR, { recursive: true });

    ICONFONT_FILES.forEach(fileName => {
      fs.copyFileSync(files[fileName], path.join(TARGET_DIR, fileName));
      print.info(`已更新 ${path.relative(ROOT_PATH, path.join(TARGET_DIR, fileName))}`);
    });

    if (inputEggSession) {
      cacheEggSession(inputEggSession);
      print.success('已缓存 EGG_SESS_ICONFONT，后续可直接运行 yarn iconfont:update');
    }

    print.success('iconfont 更新完成');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

if (require.main === module) {
  main().catch(err => {
    print.danger(err.stack || err.message);
    process.exit(1);
  });
}

module.exports = main;
