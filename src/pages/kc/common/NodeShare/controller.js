import { getNodeById } from '../../api/service';
import { getShareNode } from 'src/api/share';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { getAttachmentDetail } from 'src/api/worksheet';
import qs from 'query-string';
import _ from 'lodash';

function login() {
  window._alert(_l('请先登录'));
  location.href =
    md.global.Config.WebUrl +
    'login?ReturnUrl=' +
    encodeURIComponent(window.location.href.replace('checked=login', ''));
}

function getParams() {
  const query = qs.parse(location.search.slice(1, location.search.length));
  if (/^\/apps\/kcshare\/(\w+)/.test(location.pathname)) {
    return {
      type: 'kc_share',
      id: location.pathname.match(/.*\/apps\/kcshare\/(\w+)/)[1],
    };
  } else if (/^\/recordfile\/\w+/.test(location.pathname.replace(/^\/portal/, ''))) {
    return {
      type: 'record_share',
      id: location.pathname.match(/.*\/recordfile\/(\w+)/)[1],
    };
  } else if (query.id) {
    return {
      type: 'kc',
      id: query.id,
    };
  }
  return {};
}

export function getAttachment() {
  const { type, id } = getParams();
  if (!id) {
    return;
  }
  switch (type) {
    case 'kc_share':
      return getShareNode({ shareId: id }).then(r => {
        if (r.actionResult === 2) {
          login();
          return Promise.reject();
        } else {
          return { ...r, node: { ...r.node, isKc: true } };
        }
      });
    case 'kc':
      return getNodeById(id).then(node => ({ node: { ...node, isKc: true } }));
    case 'record_share':
      if (!_.get(md, 'global.Account.accountId')) {
        login();
        return;
      }
      return getAttachmentDetail({
        attachmentShareId: id,
      })
        .then(res => {
          if (res.resultCode === 1) {
            const recordAttachmentSwitch = isOpenPermit(
              permitList.recordAttachmentSwitch,
              res.switchPermits,
              res.attachmentShareModel.viewId,
            );
            return {
              node: res.attachmentDetail,
              allowDownload: recordAttachmentSwitch,
            };
          } else {
            return;
          }
        })
        .fail(err => {
          console.log(err);
          alert(_l('获取附件详情失败'));
        });
    default:
      return;
  }
}
