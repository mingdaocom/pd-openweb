const path = require('path');

module.exports = {
  entry: {
    globals: ['src/common/global'],
    vendors: [
      'src/library/jquery/jquery.min',
      'src/library/jquery/jquery.mousewheel.min',
      'src/library/plupload/plupload.full.min',
      'src/library/vm.js',
    ],
    css: [
      'src/common/mdcss/basic.css',
      'src/common/mdcss/iconfont/mdfont.css',
      'src/common/mdcss/animate.css',
      'src/common/mdcss/tip.css',
      'src/common/mdcss/Themes/theme.less',
    ],
  },
  externals: {
    jquery: 'jQuery',
  },
  resolve: {
    alias: {
      worksheet: 'src/pages/worksheet',
      mobile: 'src/pages/Mobile',
      statistics: 'src/pages/Statistics',
    },
    modules: [path.resolve(__dirname, '../'), path.join(__dirname, '../src'), 'node_modules'],
    extensions: ['.js', '.jsx'],
  },
};
