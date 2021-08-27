var MdNotice = {};
var _Popup = null;
MdNotice.init = function() {
  MdNotice.loadMdNotice();
};

MdNotice.loadMdNotice = function() {
  if (md.global.Config.MdNoticeServer) {
    $.ajax({
      url: `${md.global.Config.MdNoticeServer}/notice/getActive`,
      dataType: 'jsonp',
      data: {
        accountId: md.global.Account.accountId,
      },
      timeout: 3000,
      jsonp: 'jsoncallback',
      success: function(payload) {
        if (payload) {
          MdNotice.handleUpdateNotice(payload.data);
          return;
        }
        console.log(payload);
      },
      onerror: console.error,
    });
  }
};

MdNotice.handleUpdateNotice = function(data) {
  if (!md.global.Config.MdNoticeServer) return;

  if (data) {
    if (data.type === 1) {
      if (data.createTime && moment(data.createTime).toDate() < moment(md.global.Account.createTime).toDate()) return;
      const { title, desc, link, noticeId } = data;
      if (_Popup) _Popup.destroy();
      require(['animatePopup'], function(animatePopup) {
        _Popup = animatePopup({
          title: title,
          status: 3,
          showClose: true,
          content: "<div class='pLeft30 pTop5 LineHeight22'>" + (desc && desc.replace(/\n/g, '<br/>')) + '</div>',
          closeFn: function() {
            _Popup = null;
            $.ajax({
              dataType: 'jsonp',
              url: `${md.global.Config.MdNoticeServer}/notice/read`,
              data: {
                accountId: md.global.Account.accountId,
                noticeId,
              },
              jsonp: 'jsoncallback',
              success: function(data) {},
            });
          },
          btnL: link ? '<a target="_blank" href="' + link + '">' + _l('查看详情') + '</a>' : '',
          timeout: -1,
        });
      });
    } else if (data.type === 2) {
      if (data.createTime && moment(data.createTime).toDate() < moment(md.global.Account.createTime).toDate()) return;
      _Popup && _Popup.destroy();
      const { title, noticeId } = data;
      require(['animatePopup'], function(animatePopup) {
        _Popup = animatePopup({
          title: _l('检测到系统更新 🚀'),
          status: 1,
          showClose: true,
          content: `<div class="pLeft30 pTop5 LineHeight22">${_l('为了不影响您的正常使用，建议刷新页面')}</div>`,
          closeFn: function() {
            _Popup = null;
            $.ajax({
              dataType: 'jsonp',
              url: `${md.global.Config.MdNoticeServer}/notice/read`,
              data: {
                accountId: md.global.Account.accountId,
                noticeId,
              },
              jsonp: 'jsoncallback',
              success: function(data) {},
            });
          },
          btnL: `<div>${_l('立即刷新')}</div>`,
          btnLFn: function() {
            location.reload();
          },
          timeout: -1,
        });
      });
    } else {
      md.global.updated = true;

      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage('update');
      }
    }
  }
};

module.exports = MdNotice;
