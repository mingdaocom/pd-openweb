var gulp = require('gulp');
var fs = require('fs');
var jsonToJs = require('gulp-json-to-js');
var uglify = require('gulp-uglify');
var each = require('gulp-each');
var gettextToI18next = require('i18next-conv').gettextToI18next;
var bom = require('gulp-bom');
var opencc = require('node-opencc');

var langDPEn = require('./en/mdTranslation.js');
var langDPHant = require('./zh-Hant/mdTranslation.js');

var langDPPackageSettings = {
  en: langDPEn,
  zh_Hant: langDPHant,
};

var poSettings = {
  en: {
    languageTeam: 'English',
    language: 'en_US',
  },
  zh_Hant: {
    languageTeam: 'Chinese Traditional',
    language: 'zh_TW',
  },
};

// 提取key 生成 pot 模板
var langKeys = [];
var _getLangKey = function (paths, done) {
  langKeys = [];
  return gulp
    .src(paths)
    .pipe(
      each(function (content, file, callback) {
        content = content.replace(/_l\([\n|\r\n]\s*/g, '_l(').replace(/,[\n|\r\n]\s*\)/g, ')');
        // [[[xxxx %0 xxxx %1 ||| p1 ||| p2 ]]]  ||  _l('xxxx %0 xxxx %1', p1, p2)
        var regStr =
          /(\[\[\[(.+?)(?:\|\|\|(.+?))*(?:\/\/\/(.+?))?\]\]\])|(_l\(['|"](.+?)['|"](['|"]?(\s*)?,(\s*)['|"]?(.+?))*\))/;

        var reg = new RegExp(regStr, 'g');
        var reg1 = new RegExp(regStr);
        var matchs = content.match(reg);
        if (matchs) {
          matchs.forEach(function (item) {
            var groups = reg1.exec(item);
            if (groups) {
              key = groups[2] || groups[6];
              if (key != 'undefined' && langKeys.indexOf(key) === -1) {
                langKeys.push(key);
              }
            }
          });
        }
        // console.log(file.history);
        callback(null, content);
        // })).on('end', done);
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
var _buildPot = function (fileName, langPackage) {
  var header =
    'msgid ""\n' +
    'msgstr ""\n' +
    '"Project-Id-Version: \\n"\n' +
    '"POT-Creation-Date: ' +
    new Date().toLocaleString() +
    '+08:00\\n"\n' +
    '"MIME-Version: 1.0\\n"\n' +
    '"Content-Type: text/plain; charset=utf-8\\n"\n' +
    '"Content-Transfer-Encoding: 8bit\\n"\n' +
    '"X-Generator: i18n.POTGenerator\\n"\n\n';

  var oldContent = '';
  var newContent = '';
  console.log(langKeys.length);
  langKeys.map(function (key) {
    var val = langPackage[key];

    // " 转义处理 并不含 \"
    if (key.indexOf('"') > -1 && key.indexOf('\\"') === -1) {
      key = key.replace(new RegExp('"', 'g'), '\\"');
    }

    if (val) {
      oldContent += '#: Disabled references:1\n';
      oldContent += 'msgid "' + key + '"\n';
      oldContent += 'msgstr ""\n\n';
    } else {
      newContent += '#: Disabled references:1\n';
      newContent += 'msgid "' + key + '"\n';
      newContent += 'msgstr ""\n\n';
    }
  });

  fs.writeFile('locale/' + fileName + '.pot', header + oldContent, function (err) {
    if (err) console.log('old ' + fileName + ' pot 构建失败');
    else console.log('old ' + fileName + ' pot 构建成功');
  });

  fs.writeFile('locale/' + fileName + '_new.pot', header + newContent, function (err) {
    if (err) console.log('new ' + fileName + ' pot 构建失败');
    else console.log('new ' + fileName + ' pot 构建成功');
  });
};
// 动态页面
var getDPLangKey = function (done) {
  return _getLangKey(['src/**/*.{js,jsx,html,htm,tpl}', 'modules/**/*.{js,jsx,html,htm,tpl}'], done);
};
var buildDPPot = function (done) {
  _buildPot('mdTranslation', langDPEn);
  done();
};

// 自动完成中文和繁体的翻译
var _buildAutoTransDPPot = function (fileName) {
  gettextToI18next('zh-Hant', fs.readFileSync('locale/' + fileName + '.pot')).then(function (result) {
    if (result) {
      var newKeys = [];
      var resultJson = JSON.parse(result);
      for (var key in resultJson) {
        newKeys.push(key);
      }

      var langFileName = fileName + '_auto.po';

      var hantHeader = _getPoHeader('zh-Hant');
      var hantContent = '';
      newKeys.map(function (item) {
        hantContent += '#: Disabled references:1\n';
        hantContent += 'msgid "' + item + '"\n';
        hantContent += 'msgstr "' + opencc.simplifiedToTaiwanWithPhrases(item) + '"\n\n';
      });
      fs.writeFile('locale/zh-Hant/' + langFileName, hantHeader + hantContent, function (err) {
        if (err) console.log(langFileName + ' 繁体生成失败');
        else console.log(langFileName + ' 繁体生成成功');
      });
    }
  });
};
var buildAutoTransPot = function (done) {
  _buildAutoTransDPPot('mdTranslation_new');
  done();
};

var _getPoHeader = function (lang) {
  var setting = poSettings[lang.replace('-', '_')];

  var header =
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
    '"Last-Translator: beckjin <beck.jin@mingdao.com>\\n"\n' +
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
var _buildPoItem = function (lang, langPackageSettings, fileName) {
  var header = _getPoHeader(lang);

  var content = '';
  var langPackage = langPackageSettings[lang.replace('-', '_')];
  var langEnPackage = langPackageSettings.en;
  langKeys.forEach(function (key) {
    var val = langPackage[key];
    if (val && langEnPackage[key]) {
      // " 转义处理 并不含 \"
      if (key.indexOf('"') > -1 && key.indexOf('\\"') === -1) {
        key = key.replace(new RegExp('"', 'g'), '\\"');
      }

      // " 转义处理 并不含 \"
      if (val.indexOf('"') > -1 && val.indexOf('\\"') === -1) {
        val = val.replace(new RegExp('"', 'g'), '\\"');
      }

      content += '#: Disabled references:1\n';
      content += 'msgid "' + key + '"\n';
      content += 'msgstr "' + val + '"\n\n';
    }
  });
  fs.writeFile('locale/' + lang + '/' + fileName + '.po', header + content, function (err) {
    if (err) console.log(lang + ' ' + fileName + ' po 构建失败：' + err);
    else console.log(lang + ' ' + fileName + ' po 构建成功');
  });
};
var buildDPPo = function (done) {
  // 动态页面
  _buildPoItem('en', langDPPackageSettings, 'mdTranslation');
  _buildPoItem('zh-Hant', langDPPackageSettings, 'mdTranslation');
  done();
};

// po文件转成js
var _poToJs = function (lang, fileName) {
  var langDir = 'locale/' + lang + '/';
  var filePath = langDir + fileName;
  var poText = fs.readFileSync(filePath + '.po');
  if (!poText) return;
  gettextToI18next(lang, poText).then(
    function (result) {
      fs.writeFileSync(filePath + '.json', result);
      gulp
        .src(filePath + '.json')
        .pipe(jsonToJs())
        .pipe(gulp.dest(langDir));
      console.log(filePath + '.js 构建成功');
    },
    function (err) {
      console.log(filePath + '.js 构建失败');
      console.error(err);
    },
  );
};
// 压缩js语言包
var _langUglify = function () {
  return gulp.src('locale/**/*.js').pipe(uglify()).pipe(bom()).pipe(gulp.dest('locale/'));
};
var _copyToLocaleTool = function () {
  return gulp
    .src('locale/**/*.js')
    .pipe(
      each(function (content, file, callback) {
        var pathDir = file.history[0].split(/[\\/]/);
        var fileName = pathDir[pathDir.length - 1].split('.')[0];
        content = content + '\nmodule.exports = ' + fileName + ';';
        callback(null, content);
      }),
    )
    .pipe(gulp.dest('localeTool'));
};
var buildPoToJs = function (done) {
  _poToJs('en', 'mdTranslation');
  _poToJs('zh-Hant', 'mdTranslation');

  setTimeout(function () {
    _langUglify();
    _copyToLocaleTool();
    done();
  }, 5000);
};

// 提取key
gulp.task('getDPLangKey', getDPLangKey);

// 登录后页面
gulp.task('buildDPPot', gulp.series(['getDPLangKey'], buildDPPot));
gulp.task('buildDPPo', gulp.series(['getDPLangKey'], buildDPPo));

// po文件转js文件，供_l('xxxx')使用
gulp.task('buildPoToJs', buildPoToJs);

// 增量的pot文件里面的key自动生成翻译
gulp.task('buildAutoTransPot', buildAutoTransPot);
