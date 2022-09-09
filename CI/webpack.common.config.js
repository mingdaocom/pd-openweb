const path = require('path');
const { find, pick } = require('lodash');
const isProduction = process.env.NODE_ENV === 'production';

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
    vendors: (isProduction
      ? ['src/library/jquery/1.8.3/jquery', 'src/library/lodash/lodash.min', 'src/library/moment/moment.min']
      : ['src/library/jquery/1.8.3/jquery-debug', 'src/library/lodash/lodash', 'src/library/moment/moment']
    ).concat([
      'src/library/vm.js',
      'src/library/jquery/1.8.3/jqueryAnimate',
      'src/library/jquery/1.8.3/jquery.mousewheel.min',
      'src/library/plupload/plupload.full.min',
      'src/library/moment/locale/zh-cn',
      'src/library/moment/locale/zh-tw',
    ]),
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
      /* mdcontrol*/
      myupdater: 'src/components/myupdater/myupdater.js',
      alert: 'src/components/alert/alert.js',
      autoTextarea: 'src/components/autoTextarea/autoTextarea.js',
      dialogSelectDept: 'src/components/dialogSelectDept/index.js',
      dialogSelectUser: 'src/components/dialogSelectUser/dialogSelectUser.js',
      selectUser: 'src/components/selectUser/selectUser.js',
      chooseInvite: 'src/components/chooseInvite/chooseInvite.js',
      dialogSelectMapGroupDepart: 'src/components/dialogSelectMapGroupDepart/dialogSelectMapGroupDepart.js',
      selectLocation: 'src/components/selectLocation/selectLocation.js',
      pager: 'src/components/pager/pager.js',
      'md.select': 'src/components/select/select.js',
      tooltip: 'src/components/tooltip/tooltip.js',
      uploadAttachment: 'src/components/uploadAttachment/uploadAttachment.js',
      fileConfirm: 'src/components/fileConfirm/fileConfirm.js',
      mentioninput: 'src/components/mentioninput/mentionsInput.js',
      selectGroup: 'src/components/selectGroup/selectAllGroup.js',
      voteUpdater: 'src/components/voteUpdater/voteUpdater.js',
      attachmentPlayer: 'src/components/attachmentPlayer/attachmentPlayer.js',
      previewAttachments: 'src/components/previewAttachments/previewAttachments.js',
      'attachmentsPreview.enum': 'src/pages/kc/common/AttachmentsPreview/constant/enum.js',
      mdDatePicker: 'src/components/mdDatePicker/mdDatePicker.js',
      textboxList: 'src/components/textboxList/textboxList.js',
      linkView: 'src/components/linkView/linkView.js',
      mdDialog: 'src/components/mdDialog/dialog.js',
      createTask: 'src/components/createTask/createTask.js',
      createCalendar: 'src/components/createCalendar/createCalendar.js',
      createShare: 'src/components/createShare/createShare.js',
      animatePopup: 'src/components/animatePopup/animatePopup.js',
      mdAutocomplete: 'src/components/mdAutocomplete/mdAutocomplete.js',
      mdBusinessCard: 'src/components/mdBusinessCard/mdBusinessCard.js',
      reactMdBusinessCard: 'src/components/mdBusinessCard/reactMdBusinessCard',
      modernizr: 'src/components/modernizr/modernizr.js',
      quickSelectUser: 'src/components/quickSelectUser/quickSelectUser.js',
      addFriends: 'src/components/addFriends/addFriends.js',
      confirm: 'src/components/confirm/confirm',
      emotion: 'src/components/emotion/emotion',
      commenter: 'src/components/comment/commenter',
      commentList: 'src/components/comment/commentList',
      uploadFiles: 'src/components/UploadFiles',
      plupload: '@mdfe/jquery-plupload',
      dot: '@mdfe/dot',
      nanoScroller: '@mdfe/nanoscroller',
      jqueryUI: '@mdfe/jquery-ui',
      poshytip: '@mdfe/poshytip',
      selectize: '@mdfe/selectize',
      s: 'src/components/common/mstc/s/s.js',
      t: 'src/components/common/mstc/t/t.js',
      c: 'src/components/common/mstc/c/c.js',
      u: 'src/components/common/mstc/u/u.js',
      mdFunction: 'src/components/common/function.js',
      addFriendConfirm: 'src/components/addFriendConfirm/addFriendConfirm.js',
      worksheet: 'src/pages/worksheet',
      mobile: 'src/pages/Mobile',
      statistics: 'src/pages/Statistics',
    },
    modules: [path.resolve(__dirname, '../'), path.join(__dirname, '../src'), 'node_modules'],
    extensions: ['.js', '.jsx', '.jsx.js', '.ts', '.tsx'],
  },
  generateLessLoader: (isModule = false) =>
    (isProduction
      ? []
      : [
        {
          loader: 'style-loader',
        },
      ]
    ).concat([
      {
        loader: 'css-loader',
        options: isModule
          ? { sourceMap: true, module: true, localIdentName: '[name]__[local]___[hash:base64:5]' }
          : { sourceMap: true },
      },
      {
        loader: 'less-loader',
        options: { sourceMap: true },
      },
      {
        loader: 'sass-resources-loader',
        options: {
          resources: path.join(__dirname, '../src/common/mdcss/Themes/themeVariables.less'),
        },
      },
    ]),
};
