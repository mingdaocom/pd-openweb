const path = require('path');

function pathJoin(basedir, pathstr) {
  if (typeof pathstr === 'string') {
    return path.join(basedir, pathstr);
  } else if (typeof pathstr === 'object' && typeof pathstr.length !== 'undefined') {
    return pathstr.map(p => pathJoin(basedir, p));
  } else {
    const result = {};
    Object.keys(pathstr).forEach(key => {
      result[key] = pathJoin(basedir, pathstr[key]);
    });
    return result;
  }
}

module.exports = {
  pathJoin,
  entry: {
    globals: ['src/common/global'],
    vendors: [
      'src/library/jquery/1.8.3/jquery',
      'src/library/lodash/lodash.min',
      'src/library/moment/moment.min',
      'src/library/vm.js',
      'src/library/jquery/1.8.3/jqueryAnimate',
      'src/library/jquery/1.8.3/jquery.mousewheel.min',
      'src/library/plupload/plupload.full.min',
      'src/library/moment/locale/zh-cn',
      'src/library/moment/locale/zh-tw',
    ],
    css: [
      'src/common/mdcss/basic.css',
      'src/common/mdcss/inStyle.css',
      'src/common/mdcss/iconfont/mdfont.css',
      'src/common/mdcss/animate.css',
      'src/common/mdcss/tip.css',
      'src/common/mdcss/Themes/theme.less',
    ],
  },
  externals: {
    jquery: 'jQuery',
    zepto: 'Zepto',
    lodash: '_',
    moment: 'moment',
  },
  resolve: {
    alias: {
      worksheet: 'src/pages/worksheet',
      mobile: 'src/pages/Mobile',
      statistics: 'src/pages/Statistics',
    },
    modules: [path.resolve(__dirname, '../'), path.join(__dirname, '../src'), 'node_modules'],
    extensions: ['.js', '.jsx', '.jsx.js', '.ts', '.tsx'],
  },
};
