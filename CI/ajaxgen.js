const fs = require('fs');
const http = require('http');
const path = require('path');
const ejs = require('ejs');
const gulp = require('gulp');
const gutil = require('gulp-util');
var $ = require('gulp-load-plugins')();
const { apiServer } = require('./publishConfig');
const API_SERVER = apiServer || 'http://wwwapi.dev.mingdao.net';

function main(callback) {
  callback = callback || function () {};
  var AJAX_PATH = path.join(__dirname, '../src/api');
  gulp
    .src([AJAX_PATH + '/*'], {
      read: false,
    })
    .pipe(
      $.clean({
        force: true,
      }),
    );
  console.log(gutil.colors.red(`已经删除 ${AJAX_PATH} 下所有的请求文件`));
  console.log('开始获取 swagger.json');
  console.log('...');
  http.get((API_SERVER + '/swagger/v6.0.0.0/swagger.json').replace(/\/\//g, '/'), res => {
    res.setEncoding('utf-8');
    var data = '';
    res.on('data', function (chunk) {
      data += chunk.toString();
    });
    res.on('end', function () {
      console.log('已获取到 swagger.json 开始解析 swagger.json');
      let swaggerdata;
      try {
        swaggerdata = JSON.parse(data);
      } catch (err) {
        console.log('获取 swagger 数据失败');
        console.log(err);
      }
      const paths = Object.keys(swaggerdata.paths);
      const dirMap = {};
      paths.forEach(swaggerpath => {
        let dirname = swaggerpath.split('/')[1];
        let fnname = swaggerpath.split('/')[2];
        if (dirname && fnname) {
          const dirMapKey = dirname.replace(/^[A-W]{1}/, first => first.toLowerCase());
          const post = swaggerdata.paths[swaggerpath].post;
          if (!post) {
            return;
          }
          let schema;
          try {
            schema =
              swaggerdata.components.schemas[
                post.requestBody.content['application/json'].schema.$ref.match('[^/]+(?!.*/)')[0]
              ];
          } catch (err) {}
          const value = {
            description: post.summary,
            fnname: fnname.substr(0, 1).toLowerCase() + fnname.slice(1),
            path: swaggerpath,
            actionName: fnname,
            controllerName: dirname,
            params: (schema && schema.properties) || [],
          };
          if (dirMap[dirMapKey]) {
            dirMap[dirMapKey] = dirMap[dirMapKey].concat(value);
          } else {
            dirMap[dirMapKey] = [value];
          }
        }
      });
      Object.keys(dirMap).forEach(ajaxFileName => {
        var ajaxFilePath = path.join(AJAX_PATH, ajaxFileName);
        var renderData = dirMap[ajaxFileName];
        var content = ejs.render(fs.readFileSync(path.join(__dirname, './templates/ajax.tpl.html')).toString(), {
          fns: renderData,
        });
        fs.writeFileSync(ajaxFilePath + '.js', content);
        console.log(gutil.colors.green(`${ajaxFilePath}.js 输出成功`));
      });
      console.log(gutil.colors.blue(`\n请求文件已全部生成到${AJAX_PATH}`));
      callback();
    });
  });
}
gulp.task('ajaxgen', main);
