import moment from 'moment';
import mdNotification from 'ming-ui/functions/notify';

export default function sysNotice(data) {
  if (!md.global.Config.MdNoticeServer) return;

  if (data) {
    if (data.type === 1) {
      if (data.createTime && moment(data.createTime).toDate() < moment(md.global.Account.createTime).toDate()) return;
      const { title, desc, link, noticeId } = data;
      mdNotification.success({
        key: 'systemNotice',
        title: title,
        description: desc,
        duration: null,
        btnList: [
          {
            text: _l('查看详情'),
            onClick: () => window.open(link),
          },
        ],
        onClose: function () {
          $.ajax({
            dataType: 'jsonp',
            url: `${md.global.Config.MdNoticeServer}/notice/read`,
            data: {
              accountId: md.global.Account.accountId,
              noticeId,
            },
            jsonp: 'jsoncallback',
            success: function (data) {},
          });
        },
      });
    } else if (data.type === 2) {
      if (data.createTime && moment(data.createTime).toDate() < moment(md.global.Account.createTime).toDate()) return;
      const { noticeId } = data;
      mdNotification.success({
        key: 'systemNotice',
        title: _l('检测到系统更新 🚀'),
        description: _l('为了不影响您的正常使用，建议刷新页面'),
        duration: null,
        btnList: [
          {
            text: _l('立即刷新'),
            onClick: () => location.reload(),
          },
        ],
        onClose: function () {
          $.ajax({
            dataType: 'jsonp',
            url: `${md.global.Config.MdNoticeServer}/notice/read`,
            data: {
              accountId: md.global.Account.accountId,
              noticeId,
            },
            jsonp: 'jsoncallback',
            success: function (data) {},
          });
        },
      });
    } else {
      md.global.updated = true;

      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage('update');
      }
    }
  }
}
