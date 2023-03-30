import weixinApi from 'src/api/weixin';
import workWeiXinApi from 'src/api/workWeiXin';

export const bindWeiXin = () => {
  return new Promise((reslove, reject) => {
    const entryUrl = sessionStorage.getItem('entryUrl');
    const url = (entryUrl || location.href).split('#')[0];
    weixinApi.getWeiXinConfig({
      url: encodeURI(url),
    }).then(({ data, code }) => {
      if (code === 1) {
        wx.config({
          debug: false,
          appId: data.appId,
          timestamp: data.timestamp,
          nonceStr: data.nonceStr,
          signature: data.signature,
          jsApiList: ['scanQRCode'],
        });
        wx.ready(() => {
          reslove();
        });
        wx.error((res) => {
          res.mdurl = encodeURI(url);
          _alert(JSON.stringify(res));
          reject();
        });
      }
    });
  });
}

export const bindWxWork = (projectId) => {
  return new Promise((reslove, reject) => {
    const url = location.href.split('#')[0];
    const { IsLocal } = md.global.Config;
    workWeiXinApi.getSignatureInfo({
      projectId,
      url: encodeURI(url),
      suiteType: 8,
      tickettype: 1
    }).then((data) => {
      if (!data) {
        reject(1);
        return;
      }
      wx.config({
        beta: true,
        debug: false,
        appId: data.corpId,
        timestamp: data.timestamp,
        nonceStr: data.nonceStr,
        signature: data.signature,
        jsApiList: ['scanQRCode'],
      });
      wx.ready(() => {
        reslove();
      });
      wx.error((res) => {
        res.mdurl = encodeURI(url);
        _alert(JSON.stringify(res));
        reject();
      });
    });
  });
}

export const bindFeishu = projectId => {
  return new Promise((reslove, reject) => {
    const url = encodeURI(location.href.split('#')[0]);
    workWeiXinApi.getFeiShuSignatureInfo({
      projectId,
      url: url,
    }).then(data => {
      window.h5sdk.config({
        appId: data.appId,
        timestamp: data.timestamp,
        nonceStr: data.nonceStr,
        signature: data.signature,
        jsApiList: ['scanCode', 'getLocation'],
        onSuccess: (res) => {},
        onFail: (err) => {
          err.mdurl = url;
          _alert(JSON.stringify(err));
          reject();
        }
      });
      window.h5sdk.ready(() => {
        reslove();
      });
    });
  });
}