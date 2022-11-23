import './css/createShare.css';
import moment from 'moment';
import { htmlEncodeReg } from 'src/util';
import copy from 'copy-to-clipboard';
import animatePopup from 'src/components/animatePopup/animatePopup';
import 'src/components/mdDialog/dialog';

var CreateShare = function (opts) {
  var defaults = {
    isCreate: true,
    linkURL: '',
    content: '',
    isCalendar: false, // 为true时弹左下角框
    calendarOpt: {
      title: _l('分享日程'),
      openURL: '',
      isAdmin: true,
      keyStatus: true,
      name: '',
      startTime: '',
      endTime: '',
      address: '',
      shareID: '',
      recurTime: '',
      token: '',
      ajaxRequest: null,
      shareCallback: null,
    },
  };

  this.settings = $.extend(defaults, opts);
  this.init();
};

$.extend(CreateShare.prototype, {
  // 初始化
  init: function () {
    var _this = this;
    if (_this.settings.isCreate) {
      setTimeout(function () {
        _this.createDialog();
      }, 500);
    } else {
      _this.contentDialog();
    }
  },
  createDialog: function () {
    var _this = this;
    // 邀请微信好友
    var inviteFn = function () {
      _this.contentDialog();
    };

    // 前往查看
    var createShareLink = function () {
      window.open(_this.settings.linkURL);
    };

    animatePopup({
      title: _this.settings.content,
      status: 1,
      btnL: _this.settings.isCalendar ? _l('邀请微信好友') : '',
      btnR: !(window.location.href.search(/\/calendar\/home/i) >= 0 && _this.settings.isCalendar) ? _l('前往查看') : '',
      btnLFn: inviteFn,
      btnRFn: createShareLink,
      timeout: 5000,
    });
  },
  contentDialog: function () {
    var _this = this;
    var settings = this.settings.calendarOpt;
    var dialogOpts = {
      dialogBoxID: 'createShare',
      container: {
        header: settings.title,
        content: _this.getContentHtml(settings.keyStatus, settings.token),
        yesText: '',
        noText: '',
      },
      width: 520,
      readyFn: function () {
        _this.editBtnClass(settings.keyStatus);
        _this.createClip();

        $('#createShare').on('click', '.shareBtn', function () {
          settings.ajaxRequest
            .updateCalednarShare({
              calendarID: settings.shareID,
              recurTime: settings.recurTime,
              keyStatus: !settings.keyStatus,
            })
            .then(function (resource) {
              if (resource.code === 1) {
                settings.keyStatus = !settings.keyStatus;
                if (settings.keyStatus) {
                  settings.token = resource.data;
                }
                // 更新内容
                $('#createShare .dialogContent').html(_this.getContentHtml(settings.keyStatus, settings.token));
                // 更换按钮样式
                _this.editBtnClass(settings.keyStatus);
                // 回调
                if ($.isFunction(settings.shareCallback)) {
                  settings.shareCallback(settings.keyStatus, settings.token);
                }
                _this.createClip();
              }
            });
        });
      },
    };

    settings.dialog = $.DialogLayer(dialogOpts);
  },
  getURL: function (token) {
    return this.settings.calendarOpt.openURL + '?calendartoken=' + this.settings.calendarOpt.token;
  },
  copyHtml: function (getURL) {
    var settings = this.settings.calendarOpt;
    return (
      htmlEncodeReg(settings.name) +
      '\n' +
      _l('时间：') +
      _l('%0 至 %1', moment(settings.startTime).format('YYYY-MM-DD HH:mm'), moment(settings.endTime).format('YYYY-MM-DD HH:mm')) +
      '\n' +
      _l('地点：') +
      htmlEncodeReg(settings.address) +
      '\n\n' +
      _l('加入日程') +
      '\n' +
      getURL
    );
  },
  editBtnClass: function (keyStatus) {
    if (this.settings.calendarOpt.isAdmin) {
      if (keyStatus) {
        $('#createShare .shareBtn')
          .removeClass('cancelStyle')
          .addClass('ThemeColor3');
      } else {
        $('#createShare .shareBtn')
          .removeClass('ThemeColor3')
          .addClass('cancelStyle');
      }
    }
  },
  getContentHtml: function (keyStatus, token) {
    var content = '';
    var settings = this.settings.calendarOpt;
    var getURL = this.getURL(token);
    var copyHtml = this.copyHtml(getURL);
    var url = md.global.Config.AjaxApiUrl +'code/CreateQrCodeImage?url=' + encodeURIComponent(getURL);

    if (keyStatus) {
      content += '<div class="qrCode"><img src="'+ url + '"></div>';
      content += '<div class="createShareDesc Font16">' + _l('扫扫二维码，发送给微信上的朋友加入日程') + '</div>';
      content +=
        '<div class="createShareCopy Font14 ' +
        (!settings.isAdmin ? 'createSharePadding' : '') +
        '"><span data-clipboard-text="' +
        copyHtml +
        '"><i></i>' +
        _l('复制日程分享链接') +
        '</span></div>';
      if (settings.isAdmin) {
        content += '<div class="shareOperator"><span class="shareBtn shareBtnClose" data-tip="' + _l('取消分享') + '">' + _l('取消分享') + '</span></div>';
      }
    } else {
      content += '<div class="noShare"><i></i></div>';
      if (settings.isAdmin) {
        content +=
          '<div class="noShareContent Font16">' +
          _l('生成分享链接，通过微信、QQ等方式发送给好友') +
          '<br>' +
          _l('所有收到此分享链接的人都可以申请加入日程') +
          '</div>';
        content += '<div class="shareOperator"><span class="shareBtn">' + _l('开启分享') + '</span></div>';
      } else {
        content += '<div class="noShareContent Font16 noShareContentP">' + _l('此日程的分享已经被发起者关闭') + '</div>';
      }
    }

    return content;
  },
  createClip: function () {
    $('.createShareCopy span').off().on('click', function () {
      copy($('.createShareCopy span').attr('data-clipboard-text'));
      alert(_l('已经复制到粘贴板，你可以使用Ctrl+V 贴到需要的地方去了哦'));
    });
  },
});

export default function (opts) {
  return new CreateShare(opts);
};
