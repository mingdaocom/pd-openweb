const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { mapLimit } = require('async');

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

function check(keyword) {
  return new Promise((resolve, reject) => {
    const runner = spawn('grep', [
      '-ri',
      '--exclude-dir',
      './src/api',
      `${keyword[0].toLowerCase()}${keyword.slice(1)}`,
      './src',
    ]);
    let output = '';
    runner.stdout.on('data', chunk => {
      output += chunk.toString();
    });

    runner.on('close', () => {
      resolve(output || 'not found');
    });
  });
}

function fundKeyWords() {
  let result = [];
  const dir = fs.readdirSync(path.join(__dirname, '../../src/api'));
  const files = dir.map(name => path.join(__dirname, '../../src/api/' + name));
  files.forEach(file => {
    const code = fs.readFileSync(file).toString();
    result = result.concat(
      code.match(/(\w+): function/g || []).map(str => ({
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

async function run() {
  const keywords = fundKeyWords();
  const total = keywords.length;
  let list = [];
  let count = 0;
  mapLimit(
    keywords,
    100,
    (item, callback) => {
      count++;
      console.log(`checking ${item.controller}/${item.action}  ${count}/${total}`);
      check(item.action).then(result => {
        if (result === 'not found') {
          list.push(item);
        }
        callback();
      });
    },
    () => {
      console.log(list);
      fs.writeFileSync(path.join(__dirname, './result.json'), JSON.stringify(list, null, 2));
      resultToCsv(list);
    },
  );
}

function resultToCsv(list) {
  fs.writeFileSync(
    path.join(__dirname, './result.csv'),
    ['Controller,Action'].concat(list.map(item => `${item.controller},${item.action}`)).join('\n'),
  );
}

run();
