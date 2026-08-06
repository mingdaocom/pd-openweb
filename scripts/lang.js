const fs = require('fs');
const path = require('path');
const gettextParser = require('gettext-parser');
const UglifyJS = require('uglify-js');
const _ = require('lodash');
const moment = require('moment');
const fetch = require('node-fetch').default;
const { ROOT_PATH, print } = require('./utils');

const SOURCE_DIR = path.join(ROOT_PATH, 'src');
const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.html', '.htm', '.tpl']);

const getLangConfig = function () {
  const fileContent = fs
    .readFileSync(path.join(ROOT_PATH, 'src/common/langConfig.js'))
    .toString()
    .replace(/export\s+default\s+config\s*;?/, '')
    .replace(/export\s+(const|let|var)\s+/g, '$1 ')
    .replace(/export\s+function\s+/g, 'function ');

  return new Function(`${fileContent}\nreturn config;`)();
};

const langs = getLangConfig();

const getTranslationJS = function (langPath) {
  const fileContent = fs.readFileSync(path.join(ROOT_PATH, langPath), 'utf-8');
  const moduleShim = { exports: {} };
  const evaluate = new Function('module', 'exports', `${fileContent}\nmodule.exports = translations;`);

  evaluate(moduleShim, moduleShim.exports);
  return moduleShim.exports;
};

const getLangPackage = function () {
  return langs.reduce((result, item) => {
    result[item.key] = getTranslationJS(`locale/${item.key.replace('-', '_')}/mdTranslation.js`);
    return result;
  }, {});
};

function poToTranslationMap(poText) {
  const parsed = gettextParser.po.parse(poText);
  const translations = {};

  Object.keys(parsed.translations || {}).forEach(context => {
    Object.keys(parsed.translations[context] || {}).forEach(msgid => {
      if (!msgid) return;

      const item = parsed.translations[context][msgid] || {};
      translations[msgid] = (item.msgstr && item.msgstr[0]) || '';
    });
  });

  return translations;
}

// " 转义处理 并不含 \"
const escapeSymbol = function (key) {
  key = key || '';

  if (key.indexOf('"') > -1 && key.indexOf('\\"') === -1) {
    key = key.replace(new RegExp('"', 'g'), '\\"');
  }

  return key;
};

function walkSourceFiles(dir, result = []) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const filePath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walkSourceFiles(filePath, result);
      return;
    }

    if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      result.push(filePath);
    }
  });

  return result;
}

function extractLangKeysFromContent(content) {
  const result = [];
  const normalizedContent = content.replace(/_l\([\n|\r\n]\s*/g, '_l(').replace(/,[\n|\r\n]\s*\)/g, ')');
  // 使用 [\s\S] 而非 .，否则参数跨行时（如链式 .sort().map()）整条 _l(...) 匹配失败、首参词条漏提
  const reg =
    /(\[\[\[([\s\S]+?)\]\]\])|(_l\(('([\s\S]+?)'|"([\s\S]+?)"|`([\s\S]+?)`)(['"]?(\s*)?,(\s*)['"]?([\s\S]+?))*\))/g;

  let groups = reg.exec(normalizedContent);

  while (groups) {
    const key = groups[2] || groups[5] || groups[6] || groups[7];

    if (key && key !== 'undefined') {
      result.push(key.trim());
    }

    groups = reg.exec(normalizedContent);
  }

  return result;
}

function getLangKeys() {
  const langKeys = [];

  walkSourceFiles(SOURCE_DIR).forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf-8');
    langKeys.push(...extractLangKeysFromContent(content));
  });

  if (langKeys.length) {
    print.info('keys total: ' + langKeys.length);
  } else {
    print.info('keys is empty');
  }

  return _.uniq(langKeys);
}

function getPoPath(lang) {
  return path.join(ROOT_PATH, 'locale', lang.key.replace('-', '_'), 'mdTranslation.po');
}

function getTranslationPath(lang) {
  return path.join(ROOT_PATH, 'locale', lang.key.replace('-', '_'), 'mdTranslation');
}

// 生成新增的 po 文件
function buildNewPo() {
  const langKeys = getLangKeys();
  const langPackage = getLangPackage();
  let cnContent = '';
  let otherContent = '';

  langKeys.forEach(key => {
    const isExist = langPackage['zh-Hans'][key];

    if (!isExist) {
      const escapedKey = escapeSymbol(key);
      cnContent += `#: Disabled references:1\nmsgid "${escapedKey}"\nmsgstr "${escapedKey.replace(/%\d{5}$/, '')}"\n\n`;
      otherContent += `#: Disabled references:1\nmsgid "${escapedKey}"\nmsgstr ""\n\n`;
    }
  });

  if (!cnContent && !otherContent) {
    print.info('没有新增语言 key');
    return;
  }

  langs.forEach(item => {
    const filePath = getPoPath(item);
    const poText = fs.readFileSync(filePath);

    if (!poText) return;

    try {
      fs.writeFileSync(
        filePath,
        poText.toString().trim() + '\n\n' + (item.key === 'zh-Hans' ? cnContent : otherContent),
      );

      print.success(`${item.key} mdTranslation po 构建成功`);
    } catch (err) {
      print.danger(`${item.key} mdTranslation po 构建失败: ${err.message}`);
    }
  });
}

// po 文件转 js 文件，供 _l('xxxx') 使用
async function buildPoToJs() {
  await Promise.all(
    langs.map(async item => {
      const filePath = getTranslationPath(item);
      const poText = fs.readFileSync(filePath + '.po');

      if (!poText) return;

      try {
        const result = JSON.stringify(poToTranslationMap(poText));
        const minified = UglifyJS.minify(`var translations=${result};`);

        if (minified.error) {
          throw minified.error;
        }

        fs.writeFileSync(filePath + '.js', minified.code);
        print.success(filePath + '.js 构建成功');
      } catch (err) {
        print.danger(filePath + '.js 构建失败');
        throw err;
      }
    }),
  );
}

// 清理无效的 key
function clearPoLangKey() {
  const langKeys = getLangKeys();
  const langPackage = getLangPackage();
  const content = langs.reduce((result, item) => {
    result[item.key] = '';
    return result;
  }, {});

  langKeys.forEach(key => {
    langs.forEach(item => {
      const value =
        escapeSymbol(langPackage[item.key][key]) ||
        (item.key === 'zh-Hans' ? escapeSymbol(key).replace(/%\d{5}$/, '') : '');

      content[item.key] += `#: Disabled references:1\nmsgid "${escapeSymbol(key)}"\nmsgstr "${value}"\n\n`;
    });
  });

  langs.forEach(item => {
    const filePath = getPoPath(item);

    try {
      fs.writeFileSync(
        filePath,
        `msgid ""\nmsgstr ""\n"Project-Id-Version: "\n"POT-Creation-Date: ${moment().format(
          'YYYY-MM-DD HH:mm:ss',
        )}"\n"Language-Team: ${item.languageTeam}"\n"Language: ${
          item.language
        }"\n"MIME-Version: 1.0"\n"Content-Type: text/plain; charset=utf-8"\n"Content-Transfer-Encoding: 8bit"\n"X-Generator: i18n.POTGenerator"\n\n` +
          content[item.key],
      );

      print.success(`${item.key} mdTranslation po 清理成功`);
    } catch (err) {
      print.danger(`${item.key} mdTranslation po 清理失败: ${err.message}`);
    }
  });
}

// push key
async function pushLangKey() {
  const langKeys = getLangKeys();
  const langPackage = getLangPackage();
  const rows = langKeys
    .map(key => {
      return [
        {
          controlId: 'key',
          value: key,
        },
        {
          controlId: 'zh_Hans',
          value: key.replace(/%\d{5}$/, ''),
        },
        {
          controlId: 'zh_Hant',
          value: escapeSymbol(langPackage['zh-Hant'][key]) || '',
        },
        {
          controlId: 'en',
          value: escapeSymbol(langPackage.en[key]) || '',
        },
        {
          controlId: 'ja',
          value: escapeSymbol(langPackage.ja[key]) || '',
        },
      ];
    })
    .filter(item => !!item.filter(o => !o.value).length);

  print.info(`新增key ${rows.length} 个`);

  for (const items of _.chunk(rows, 1000)) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await fetch('https://api2.mingdao.com/v2/open/worksheet/addRows', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appKey: process.env.LANG_APP_KEY,
        sign: process.env.LANG_APP_SING,
        worksheetId: process.env.LANG_WORKSHEET_ID,
        triggerWorkflow: true,
        rows: items,
        allowPartialSuccess: true,
      }),
    });
  }
}

const commandMap = {
  'sync-po': buildNewPo,
  'build-js': buildPoToJs,
  'clean-po': clearPoLangKey,
  'push-key': pushLangKey,
};

async function main() {
  const command = process.argv[2];
  const run = commandMap[command];

  if (!run) {
    throw new Error(`未知语言命令: ${command || ''}, 可用命令: ${Object.keys(commandMap).join(', ')}`);
  }

  await run();
}

if (require.main === module) {
  main().catch(err => {
    print.danger(err.stack || err.message);
    process.exit(1);
  });
}

module.exports = {
  buildNewPo,
  buildPoToJs,
  clearPoLangKey,
  extractLangKeysFromContent,
  getLangKeys,
  pushLangKey,
};
