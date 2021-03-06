const gulp = require('gulp');
const fs = require('fs');
const each = require('gulp-each');
const gettextToI18next = require('i18next-conv').gettextToI18next;
const opencc = require('node-opencc');
const UglifyJS = require('uglify-js');
const langs = require('../src/common/langConfig');
const langPackage = require('./en/mdTranslation.js');

// 提取key
let langKeys = [];

// 动态页面
const getDPLangKey = function(done) {
  langKeys = [];

  return gulp
    .src(['src/**/*.{js,jsx,html,htm,tpl}', 'modules/**/*.{js,jsx,html,htm,tpl}'])
    .pipe(
      each(function(content, file, callback) {
        content = content.replace(/_l\([\n|\r\n]\s*/g, '_l(').replace(/,[\n|\r\n]\s*\)/g, ')');
        // [[[xxxx %0 xxxx %1 ||| p1 ||| p2 ]]]  ||  _l('xxxx %0 xxxx %1', p1, p2)
        let regStr = /(\[\[\[(.+?)(?:\|\|\|(.+?))*(?:\/\/\/(.+?))?\]\]\])|(_l\(['|"](.+?)['|"](['|"]?(\s*)?,(\s*)['|"]?(.+?))*\))/;

        let reg = new RegExp(regStr, 'g');
        let reg1 = new RegExp(regStr);
        let matchs = content.match(reg);
        if (matchs) {
          matchs.forEach(function(item) {
            let groups = reg1.exec(item);
            if (groups) {
              key = groups[2] || groups[6];
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
const buildDPPot = function(done) {
  const header = `msgid ""\nmsgstr ""\n"Project-Id-Version: "\n"POT-Creation-Date: ${new Date().toLocaleString()}+08:00"\n"MIME-Version: 1.0\\n"\n"Content-Type: text/plain; charset=utf-8"\n"Content-Transfer-Encoding: 8bit"\n"X-Generator: i18n.POTGenerator"\n\n`;
  let oldContent = '';
  let newContent = '';

  langKeys.map(function(key) {
    let val = langPackage[key];

    // " 转义处理 并不含 \"
    if (key.indexOf('"') > -1 && key.indexOf('\\"') === -1) {
      key = key.replace(new RegExp('"', 'g'), '\\"');
    }

    if (val) {
      oldContent += `#: Disabled references:1\nmsgid "${key}"\nmsgstr ""\n\n`;
    } else {
      newContent += `#: Disabled references:1\nmsgid "${key}"\nmsgstr ""\n\n`;
    }
  });

  fs.writeFile('locale/mdTranslation.pot', header + oldContent, function(err) {
    console.log(`old mdTranslation pot 构建${err ? '失败' : '成功'}`);
  });

  fs.writeFile('locale/mdTranslation_new.pot', header + newContent, function(err) {
    console.log(`new mdTranslation pot 构建${err ? '失败' : '成功'}`);
  });

  done();
};

const _getPoHeader = function(lang) {
  const setting = langs.find(item => item.key === lang) || {};
  const header =
    'msgid ""\n' +
    'msgstr ""\n' +
    '"Project-Id-Version: mingdao-web\\n"\n' +
    '"POT-Creation-Date:  ' +
    new Date().toLocaleString() +
    '+08:00\\n"\n' +
    '"MIME-Version: 1.0\\n"\n' +
    '"Content-Type: text/plain; charset=UTF-8\\n"\n' +
    '"Content-Transfer-Encoding: 8bit\\n"\n' +
    '"X-Generator: i18n.POTGenerator\\n"\n' +
    '"Plural-Forms: nplurals=1; plural=0;\\n"\n' +
    '"Last-Translator: ""\\n"\n' +
    '"Language-Team: ' +
    setting.languageTeam +
    '\\n"\n' +
    '"Language: ' +
    setting.language +
    '\\n"\n' +
    '"PO-Revision-Date:  ' +
    new Date().toLocaleString() +
    '-0400\\n"\n\n';

  return header;
};

const buildAutoTransPot = function(done) {
  gettextToI18next('zh-Hant', fs.readFileSync('locale/mdTranslation_new.pot')).then(function(result) {
    if (result) {
      let newKeys = [];
      let resultJson = JSON.parse(result);
      for (let key in resultJson) {
        newKeys.push(key);
      }

      const hantHeader = _getPoHeader('zh-Hant');
      let hantContent = '';
      newKeys.map(function(item) {
        hantContent += `#: Disabled references:1\nmsgid "${item}"\nmsgstr "${opencc.simplifiedToTaiwanWithPhrases(
          item,
        )}"\n\n`;
      });

      fs.writeFile('locale/zh-Hant/mdTranslation_new_auto.po', hantHeader + hantContent, function(err) {
        console.log(`mdTranslation_new_auto.po 繁体生成${err ? '失败' : '成功'}`);
      });
    }
  });

  done();
};

const buildPoToJs = function(done) {
  langs.forEach(item => {
    const filePath = `locale/${item.key}/mdTranslation`;
    const poText = fs.readFileSync(filePath + '.po');

    if (!poText) return;

    gettextToI18next(item.key, poText).then(
      function(result) {
        fs.writeFileSync(
          filePath + '.js',
          UglifyJS.minify(
            `var mdTranslation=${result};if (typeof module !== "undefined") { module.exports = mdTranslation; }`,
          ).code,
        );
        console.log(filePath + '.js 构建成功');
      },
      function(err) {
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

// 增量的pot文件里面的key自动生成翻译
gulp.task('buildAutoTransPot', buildAutoTransPot);

// po文件转js文件，供_l('xxxx')使用
gulp.task('buildPoToJs', buildPoToJs);
