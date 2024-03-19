import weixinApi from 'src/api/weixin';
import workWeiXinApi from 'src/api/workWeiXin';

export const bindWeiXin = () => {
  return new Promise((reslove, reject) => {
    const isIphone = window.navigator.userAgent.toLowerCase().includes('iphone');
    const entryUrl = sessionStorage.getItem('entryUrl');
    const url = (isIphone ? entryUrl || location.href : location.href).split('#')[0];
    weixinApi.getWeiXinConfig({
      url: encodeURI(url),
    }).then(({ data, code }) => {
      if (code === 1) {
        window.wx.config({
          debug: false,
          appId: data.appId,
          timestamp: data.timestamp,
          nonceStr: data.nonceStr,
          signature: data.signature,
          jsApiList: ['scanQRCode'],
        });
        window.wx.ready(() => {
          reslove();
        });
        window.wx.error((res) => {
          res.mdurl = encodeURI(url);
          window.nativeAlert(JSON.stringify(res));
          reject();
        });
      } else {
        reject(1);
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
      window.wx.config({
        beta: true,
        debug: false,
        appId: data.corpId,
        timestamp: data.timestamp,
        nonceStr: data.nonceStr,
        signature: data.signature,
        jsApiList: ['scanQRCode'],
      });
      window.wx.ready(() => {
        reslove();
      });
      window.wx.error((res) => {
        res.mdurl = encodeURI(url);
        window.nativeAlert(JSON.stringify(res));
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
      url,
    }).then(data => {
      if (!data) {
        reject(1);
        return;
      }
      window.h5sdk.config({
        appId: data.appId,
        timestamp: data.timestamp,
        nonceStr: data.noncestr,
        signature: data.signature,
        jsApiList: ['scanCode', 'getLocation'],
        onSuccess: (res) => {},
        onFail: (err) => {
          err.mdurl = url;
          window.nativeAlert(JSON.stringify(err));
          reject();
        }
      });
      window.h5sdk.ready(() => {
        reslove();
      });
    });
  });
}

export const bindDing = projectId => {
  return new Promise((reslove, reject) => {
    const isIphone = window.navigator.userAgent.toLowerCase().includes('iphone');
    const entryUrl = sessionStorage.getItem('entryUrl') || location.href;
    const url = (isIphone ? location.href : entryUrl).split('#')[0];
    workWeiXinApi.getDDSignatureInfo({
      projectId,
      url,
    }).then(data => {
      if (!data) {
        reject();
      }
      window.dd.config({
        agentId: data.agentId,
        corpId: data.corpId,
        timeStamp: data.timestamp,
        nonceStr: data.noncestr,
        signature: data.signature,
        jsApiList : ['device.geolocation.get']
      });
      window.dd.ready(() => {
        reslove();
      });
      window.dd.error((err) => {
        err.mdurl = url;
        window.nativeAlert(JSON.stringify(err));
      });
    });
  });
}

export const bindWeLink = projectId => {
  return new Promise((reslove, reject) => {
    const url = encodeURI(location.href.split('#')[0]);
    workWeiXinApi.getWeLinkSignatureInfo({
      projectId,
      url,
    }).then(data => {
      if (!data) {
        reject();
      }
      window.HWH5.config({
        appId: data.appId,
        timestamp: data.timestamp,
        noncestr: data.noncestr,
        signature: data.signature,
        jsApiList: ['getLocation']
      });
      window.HWH5.ready(() => {
        reslove();
      });
      window.HWH5.error(err => {
        err.mdurl = url;
        window.nativeAlert(JSON.stringify(err));
      });
    });
  });
}

export const handleTriggerEvent = (scanFn, bindFn, errorFn = _.noop) => {
  if (window.currentUrl !== location.href) {
    window.currentUrl = location.href;
    window.configSuccess = false;
    window.configLoading = false;
  }
  if (window.configSuccess) {
    scanFn();
  } else {
    if (!window.configLoading) {
      bindFn.then(() => {
        window.configLoading = false;
        window.configSuccess = true;
        scanFn();
      }).catch(errorFn);
    }
  }
}
