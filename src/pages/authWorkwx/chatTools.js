import { ajax, login, getRequest, addOtherParam } from 'src/util/sso';

const { url, p } = getRequest();
const currentUrl = location.href.split('#')[0];
const hosts = location.host.split('.');
const projectId = p || hosts[0];

const getCurExternalContact = () => {
  return new Promise((reslove, reject) => {
    wx.invoke('getCurExternalContact', {}, function(res){
      if(res.err_msg == 'getCurExternalContact:ok'){
        reslove(res.userId);
      } else {
        reject();
        console.log('getCurExternalContact error', res);
      }
    });
  });
};

const getCurExternalChat = () => {
  return new Promise((reslove, reject) => {
    wx.invoke('getCurExternalChat', {}, function(res){
      if(res.err_msg == 'getCurExternalChat:ok'){
        reslove(res.chatId);
      } else {
        reject();
        console.log('getCurExternalChat error', res);
      }
    });
  });
};

const succeed = () => {
  wx.invoke('getContext', {}, function(res){
    if (res.err_msg == "getContext:ok") {
      const entry = res.entry;
      if (entry === 'group_chat_tools') {
        getCurExternalChat().then(chatId => {
          const targetUrl = addOtherParam(url, `chat_id=${chatId}&pc_slide=true`);
          location.href = targetUrl;
        });
      }
      if (entry === 'contact_profile' || entry === 'single_chat_tools') {
        getCurExternalContact().then(userId => {
          const targetUrl = addOtherParam(url, `external_userid=${userId}&pc_slide=true`);
          location.href = targetUrl;
        });
      }
    } else {
      console.log('getContext error', res);
    }
  });
};

const agentConfigInit = () => {
  ajax.post({
    url: __api_server__.main + 'WorkWeiXin/GetSignatureInfo',
    data: {
      projectId,
      url: encodeURI(currentUrl),
      suiteType: 8,
      tickettype: 2
    },
    async: true,
    succees: ({ data }) => {
      window.wx.agentConfig({
        corpid: data.corpId,
        agentid: data.agentId,
        timestamp: data.timestamp,
        nonceStr: data.nonceStr,
        signature: data.signature,
        jsApiList: ['getContext', 'getCurExternalContact', 'getCurExternalChat'],
        success: (res) => {
          succeed();
        },
        fail: (res) => {
          res.errorType = 'wx.agentConfig';
          window.nativeAlert(JSON.stringify(res));
        },
      });
    },
    error: login,
  });
}

ajax.post({
  url: __api_server__.main + 'WorkWeiXin/GetSignatureInfo',
  data: {
    projectId,
    url: encodeURI(currentUrl),
    suiteType: 8,
    tickettype: 1
  },
  async: true,
  succees: ({ data }) => {
    window.wx.config({
      beta: true,
      debug: false,
      appId: data.corpId,
      timestamp: data.timestamp,
      nonceStr: data.nonceStr,
      signature: data.signature,
      jsApiList: ['invoke'],
    });
    window.wx.ready(agentConfigInit);
    window.wx.error(res => {
      res.errorType = 'wx.config';
      window.nativeAlert(JSON.stringify(res));
    });
  },
  error: login,
});


