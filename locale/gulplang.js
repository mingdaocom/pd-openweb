const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const each = require('gulp-each');
const gettextToI18next = require('i18next-conv').gettextToI18next;
const UglifyJS = require('uglify-js');
const _ = require('lodash');
const moment = require('moment');
const fetch = require('node-fetch');
const langs = eval(
  fs
    .readFileSync(path.join(__dirname, '../src/common/langConfig.js'))
    .toString()
    .replace('export default config;', 'module.exports = config;'),
);
const getTranslationJS = function (langPath) {
  let fileContent = fs.readFileSync(path.join(__dirname, langPath), 'utf-8');
  return eval(fileContent + 'module.exports = translations;');
};
const langPackage = {
  en: getTranslationJS('./en/mdTranslation.js'),
  ja: getTranslationJS('./ja/mdTranslation.js'),
  'zh-Hans': getTranslationJS('./zh_Hans/mdTranslation.js'),
  'zh-Hant': getTranslationJS('./zh_Hant/mdTranslation.js'),
};

// " 转义处理 并不含 \"
const escapeSymbol = function (key) {
  key = key || '';

  if (key.indexOf('"') > -1 && key.indexOf('\\"') === -1) {
    key = key.replace(new RegExp('"', 'g'), '\\"');
  }

  return key;
};

// 提取key
let langKeys = [];

// 提取src下的词条
const getLangKey = function (done) {
  langKeys = [];

  return gulp
    .src('src/**/*.{js,jsx,html,htm,tpl}')
    .pipe(
      each(function (content, file, callback) {
        content = content.replace(/_l\([\n|\r\n]\s*/g, '_l(').replace(/,[\n|\r\n]\s*\)/g, ')');
        // _l('xxxx %0 xxxx %1', p1, p2)
        // let regStr = /(\[\[\[(.+?)(?:\|\|\|(.+?))*(?:\/\/\/(.+?))?\]\]\])|(_l\(['|"](.+?)['|"](['|"]?(\s*)?,(\s*)['|"]?(.+?))*\))/;
        let regStr = /(\[\[\[(.+?)\]\]\])|(_l\(('(.+?)'|"(.+?)"|`(.+?)`)(['"]?(\s*)?,(\s*)['"]?(.+?))*\))/;

        let reg = new RegExp(regStr, 'g');
        let reg1 = new RegExp(regStr);
        let matchs = content.match(reg);
        if (matchs) {
          matchs.forEach(function (item) {
            let groups = reg1.exec(item);
            if (groups) {
              key = groups[2] || groups[5] || groups[6] || groups[7];
              if (key != 'undefined' && langKeys.indexOf(key) === -1) {
                langKeys.push(key);
              }
            }
          });
        }
        callback(null, content);
      }),
    )
    .on('end', () => {
      if (langKeys.length) {
        console.log('keys total: ' + langKeys.reduce((a = [], b = []) => a.concat(b)).length);
      } else {
        console.log('keys is empty');
      }
      done();
    });
};

// 生成新增的po文件
const buildNewPo = function (done) {
  let cnContent = '';
  let otherContent = '';

  _.uniq(langKeys).map(function (key) {
    let isExist = langPackage['zh-Hans'][key];

    if (!isExist) {
      key = escapeSymbol(key);
      cnContent += `#: Disabled references:1\nmsgid "${key}"\nmsgstr "${key.replace(/%\d{5}$/, '')}"\n\n`;
      otherContent += `#: Disabled references:1\nmsgid "${key}"\nmsgstr ""\n\n`;
    }
  });

  langs.forEach(item => {
    const filePath = `locale/${item.key.replace('-', '_')}/mdTranslation.po`;
    const poText = fs.readFileSync(filePath);

    if (!poText) return;

    try {
      fs.writeFileSync(
        filePath,
        poText.toString().trim() + '\n\n' + (item.key === 'zh-Hans' ? cnContent : otherContent),
      );

      console.log(`${item.key} mdTranslation po 构建成功`);
    } catch (err) {
      console.log(`${item.key} mdTranslation po 构建失败`);
    }
  });

  done();
};

const buildPoToJs = function (done) {
  langs.forEach(item => {
    const filePath = `locale/${item.key.replace('-', '_')}/mdTranslation`;
    const poText = fs.readFileSync(filePath + '.po');

    if (!poText) return;

    gettextToI18next(item.key, poText).then(
      function (result) {
        fs.writeFileSync(filePath + '.js', UglifyJS.minify(`var translations=${result};`).code);
        console.log(filePath + '.js 构建成功');
      },
      function (err) {
        console.log(filePath + '.js 构建失败');
        console.error(err);
      },
    );
  });

  done();
};

// 清理无效的key
const clearPoLangKey = function (done) {
  const content = {};

  _.uniq(langKeys).map(function (key) {
    langs.forEach(item => {
      const value =
        escapeSymbol(langPackage[item.key][key]) ||
        (item.key === 'zh-Hans' ? escapeSymbol(key).replace(/%\d{5}$/, '') : '');

      content[item.key] += `#: Disabled references:1\nmsgid "${escapeSymbol(key)}"\nmsgstr "${value}"\n\n`;
    });
  });

  langs.forEach(item => {
    const filePath = `locale/${item.key.replace('-', '_')}/mdTranslation.po`;

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

      console.log(`${item.key} mdTranslation po 清理成功`);
    } catch (err) {
      console.log(`${item.key} mdTranslation po 清理失败`);
    }
  });

  done();
};

// push key
const pushLangKey = function (done) {
  const rows = _.uniq(langKeys)
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
          value: escapeSymbol(langPackage['en'][key]) || '',
        },
        {
          controlId: 'ja',
          value: escapeSymbol(langPackage['ja'][key]) || '',
        },
      ];
    })
    .filter(item => !!item.filter(o => !o.value).length);

  console.log(`新增key ${rows.length} 个`);

  const sendRequests = async () => {
    for (const items of _.chunk(rows, 1000)) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 延迟 1 秒
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

    done();
  };

  sendRequests();
};

// 提取key
gulp.task('getLangKey', getLangKey);

// push增量key
gulp.task('pushLangKey', gulp.series(['getLangKey'], pushLangKey));

// 生成新的po文件
gulp.task('buildNewPo', gulp.series(['getLangKey'], buildNewPo));

// po文件转js文件，供_l('xxxx')使用
gulp.task('buildPoToJs', buildPoToJs);

// 清理无效的语言key
gulp.task('clearPoLangKey', gulp.series(['getLangKey'], clearPoLangKey));
