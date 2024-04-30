import kcService from '../../api/service';
import shareAjax from 'src/api/share';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import worksheetAjax from 'src/api/worksheet';
import qs from 'query-string';
import _ from 'lodash';

function login() {
  window.nativeAlert(_l('请先登录'));
  location.href =
    md.global.Config.WebUrl +
    'login?ReturnUrl=' +
    encodeURIComponent(window.location.href.replace('checked=login', ''));
}

function getParams() {
  const query = qs.parse(location.search.slice(1, location.search.length));
  if (/\/apps\/kcshare\/(\w+)/.test(location.pathname)) {
    return {
      type: 'kc_share',
      id: location.pathname.match(/.*\/apps\/kcshare\/(\w+)/)[1],
    };
  } else if (/.*\/recordfile\/(\w+)\/(\d+)/.test(location.pathname.replace(/^\/portal/, ''))) {
    // 草稿箱内文件详情添加getType
    return {
      type: 'record_share',
      id: location.pathname.match(/.*\/recordfile\/(\w+)\/(\d+)/)[1],
      getType: location.pathname.match(/.*\/recordfile\/(\w+)\/(\d+)/)[2],
    };
  } else if (/\/recordfile\/\w+/.test(location.pathname.replace(/^\/portal/, ''))) {
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
  const { type, id, getType } = getParams();
  if (!id) {
    return;
  }
  switch (type) {
    case 'kc_share':
      return shareAjax.getShareNode({ shareId: id }).then(r => {
        if (r.actionResult === 2) {
          login();
          return Promise.reject();
        } else {
          return { ...r, node: { ...r.node, isKc: true } };
        }
      });
    case 'kc':
      return kcService.getNodeById(id).then(node => ({ node: { ...node, isKc: true } }));
    case 'record_share':
      if (!_.get(md, 'global.Account.accountId')) {
        login();
        return;
      }
      return worksheetAjax
        .getAttachmentDetail({
          attachmentShareId: id,
          getType: !!getType ? Number(getType) : undefined,
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
        .catch(err => {
          console.log(err);
          alert(_l('获取附件详情失败'), 2);
        });
    default:
      return;
  }
}
