const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { ROOT_PATH, print } = require('./utils');

const API_DIR = path.join(ROOT_PATH, 'src/api');
const OUTPUT_DIR = path.join(ROOT_PATH, 'build/unused-api');
const SEARCH_CONCURRENCY = 100;

const ignoreControllers = [
  'fixedData',
  'form',
  /** 私有部署 **/
  'sms',
  'email',
  'privateGuide',
  'private',
  /** **/
];
const ignorePaths = [
  'plus/getAccessToken',
  'user/getLeaveUserList',
  /** 私有部署 **/
  'externalPortal/exportalSSO',
  'login/workWeiXinLogin',
  'login/workWeiXinInstallAuthLogin',
  'project/addTpAuthorizerInfo',
  /** **/
];

function searchKeyword(keyword) {
  const term = keyword && `${keyword[0].toLowerCase()}${keyword.slice(1)}`;

  if (!term) return Promise.resolve('not found');

  return new Promise(resolve => {
    const runner = spawn('rg', ['-i', '--glob', '!src/api/**', '--', term, 'src'], { cwd: ROOT_PATH });
    let output = '';

    runner.stdout.on('data', chunk => {
      output += chunk.toString();
    });

    runner.on('error', () => {
      resolve('not found');
    });

    runner.on('close', code => {
      if (code !== 0) {
        resolve('not found');
        return;
      }

      resolve(output || 'not found');
    });
  });
}

function findKeywords() {
  let result = [];
  const files = fs
    .readdirSync(API_DIR)
    .filter(name => path.extname(name) === '.js')
    .map(name => path.join(API_DIR, name));

  files.forEach(file => {
    const code = fs.readFileSync(file).toString();
    const matches = code.match(/(\w+): function/g) || [];
    result = result.concat(
      matches.map(str => ({
        controller: path.parse(file).name,
        action: str.replace(': function', ''),
      })),
    );
  });
  return result.filter(
    item =>
      ignoreControllers.indexOf(item.controller) < 0 && ignorePaths.indexOf(`${item.controller}/${item.action}`) < 0,
  );
}

async function mapWithLimit(items, limit, iteratee) {
  const results = [];
  let index = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const currentIndex = index++;
      results[currentIndex] = await iteratee(items[currentIndex], currentIndex);
    }
  });

  await Promise.all(workers);
  return results;
}

function writeResult(list) {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'result.json'), JSON.stringify(list, null, 2));
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'result.csv'),
    ['Controller,Action'].concat(list.map(item => `${item.controller},${item.action}`)).join('\n'),
  );
}

async function run() {
  const keywords = findKeywords();
  const total = keywords.length;
  let count = 0;

  const results = await mapWithLimit(keywords, SEARCH_CONCURRENCY, async item => {
    const currentCount = ++count;
    print.normal(`checking ${item.controller}/${item.action}  ${currentCount}/${total}`);
    const result = await searchKeyword(item.action);

    return result === 'not found' ? item : null;
  });

  const unusedList = results.filter(Boolean);
  console.log(unusedList);
  writeResult(unusedList);
  print.success(`检查完成,结果已输出到 ${OUTPUT_DIR}`);
}

if (require.main === module) {
  run().catch(err => {
    print.danger(err.stack || err.message);
    process.exit(1);
  });
}

module.exports = {
  findKeywords,
  run,
};
