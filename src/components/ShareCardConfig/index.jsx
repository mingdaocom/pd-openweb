import loadScript from 'load-script';
import weixinApi from 'src/api/weixin';
import sheetSetAjax from 'src/api/worksheetSetting';
import { getDynamicValue } from 'src/components/Form/core/formUtils';
import { SHARECARDTYPS, VIEW_TYPE_ICON_LIST, WX_ICON_LIST } from './config';

// 微信脚本加载
const loadWeiXinScript = () => {
  if (window.wx) return Promise.resolve();
  return new Promise((resolve, reject) => {
    loadScript('https://res.wx.qq.com/open/js/jweixin-1.6.0.js', err => {
      if (err) {
        reject();
      } else {
        resolve();
      }
    });
  });
};

// 微信分享卡片配置
const initShareConfig = async props => {
  const { title = '', desc = '', projectId, controls = [], worksheetId, type, viewType = 0 } = props;
  const renderTxt = value => {
    if (!value || !(value || '').startsWith('[')) {
      return value;
    }
    return getDynamicValue(controls, {
      type: 2,
      advancedSetting: {
        defsource: value,
      },
    });
  };

  sheetSetAjax.getShareCardSetting({ shareCardId: `${worksheetId}_${type}` }).then(res => {
    const shareConfigValue = res || {};
    const entryUrl = sessionStorage.getItem('entryUrl');
    const url = (window.isIphone ? entryUrl || location.href : location.href).split('#')[0];
    weixinApi.getWeiXinConfig({ url: encodeURI(url), projectId }).then(({ data, code }) => {
      console.log({ data, code });
      if (code === 1) {
        window.wx.config({
          debug: false,
          appId: data.appId,
          timestamp: data.timestamp,
          nonceStr: data.nonceStr,
          signature: data.signature,
          jsApiList: ['updateAppMessageShareData', 'onMenuShareAppMessage'],
        });

        wx.ready(function () {
          const getIconUrl = () => {
            const { icon, iconUrl } = shareConfigValue || {};
            if (icon) {
              return icon.startsWith('http') ? icon : iconUrl;
            }
            const defaultIcon = type === SHARECARDTYPS.VIEW ? VIEW_TYPE_ICON_LIST[viewType] : WX_ICON_LIST[0];
            return `${md.global.FileStoreConfig.pubHost}/${defaultIcon}`;
          };
          const info = {
            title: renderTxt(shareConfigValue.title) || title,
            desc: renderTxt(shareConfigValue.desc) || desc,
            link: encodeURI(location.href),
            imgUrl: getIconUrl(),
            success: function () {
              console.log('设置成功');
            },
          };
          console.log(info);
          //需在用户可能点击分享按钮前就先调用
          if (wx.updateAppMessageShareData) {
            wx.updateAppMessageShareData(info);
          } else {
            wx.onMenuShareAppMessage(info);
          }
        });
        wx.error(function (res) {
          console.log('设置失败:', res);
        });
      }
    });
  });
};

export default async function (props) {
  const { worksheetId } = props;
  if (!window.isWeiXin || !worksheetId) return;

  try {
    await loadWeiXinScript();
    await initShareConfig(props);
  } catch (error) {
    console.error('微信分享初始化失败:', error);
  }
}
