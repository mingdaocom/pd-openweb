const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const each = require('gulp-each');
const gettextToI18next = require('i18next-conv').gettextToI18next;
const UglifyJS = require('uglify-js');
const _ = require('lodash');
const langs = eval(
  fs
    .readFileSync(path.join(__dirname, '../src/common/langConfig.js'))
    .toString()
    .replace('export default config;', 'module.exports = config;'),
);
const langPackage = require('./zh-Hans/mdTranslation.js');

// 提取key
let langKeys = [];

// 动态页面
const getDPLangKey = function (done) {
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

// 生成新增的 pot文件
const buildDPPot = function (done) {
  let cnContent = '';
  let otherContent = '';

  _.uniq(langKeys).map(function (key) {
    let isExist = langPackage[key];

    if (!isExist) {
      // " 转义处理 并不含 \"
      if (key.indexOf('"') > -1 && key.indexOf('\\"') === -1) {
        key = key.replace(new RegExp('"', 'g'), '\\"');
      }

      cnContent += `#: Disabled references:1\nmsgid "${key}"\nmsgstr "${key.replace(/%\d{5}$/, '')}"\n\n`;
      otherContent += `#: Disabled references:1\nmsgid "${key}"\nmsgstr ""\n\n`;
    }
  });

  langs.forEach(item => {
    const filePath = `locale/${item.key}/mdTranslation.po`;
    const poText = fs.readFileSync(filePath);

    if (!poText) return;

    fs.writeFileSync(
      filePath,
      poText.toString().trim() + '\n\n' + (item.key === 'zh-Hans' ? cnContent : otherContent),
      function (err) {
        console.log(`${item.key} mdTranslation po 构建${err ? '失败' : '成功'}`);
      },
    );
  });

  done();
};

const buildPoToJs = function (done) {
  langs.forEach(item => {
    const filePath = `locale/${item.key}/mdTranslation`;
    const poText = fs.readFileSync(filePath + '.po');

    if (!poText) return;

    gettextToI18next(item.key, poText).then(
      function (result) {
        fs.writeFileSync(
          filePath + '.js',
          UglifyJS.minify(
            `var mdTranslation=${result};if (typeof module !== "undefined") { module.exports = mdTranslation; }`,
          ).code,
        );
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

// 提取key
gulp.task('getDPLangKey', getDPLangKey);

// 增量pot文件
gulp.task('buildDPPot', gulp.series(['getDPLangKey'], buildDPPot));

// po文件转js文件，供_l('xxxx')使用
gulp.task('buildPoToJs', buildPoToJs);
