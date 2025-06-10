import _ from 'lodash';
import qs from 'query-string';
import appManagementApi from 'src/api/appManagement';

/**
 * 设置应用的 favicon。
 * @param {string} iconUrl - 图标的 URL。
 * @param {string} iconColor - 用于设置图标的颜色。
 */
export const setFavicon = (iconUrl, iconColor) => {
  fetch(iconUrl)
    .then(res => res.text())
    .then(data => {
      if (iconUrl.indexOf('_preserve.svg') === -1) {
        data = btoa(data.replace(/fill=\".*?\"/g, '').replace(/\<svg/, `<svg fill="${iconColor}"`));
      } else {
        data = btoa(data.replace(/\<svg/, `<svg fill="${iconColor}"`));
      }

      $('[rel="icon"]').attr('href', `data:image/svg+xml;base64,${data}`);
    });
};

/**
 * 获取应用界面特性是否可见
 */
export const getAppFeaturesVisible = () => {
  const { s, tb, tr, ln, rp, td, ss, ac, ch } = qs.parse(location.search.substr(1));

  return {
    s: s !== 'no', // 回首页按钮
    tb: tb !== 'no', // 应用分组
    tr: tr !== 'no', // 导航右侧内容（应用扩展信息）
    ln: ln !== 'no', // 左侧导航
    rp: rp !== 'no', // chart
    td: td !== 'no', // 待办
    ss: ss !== 'no', // 超级搜索
    ac: ac !== 'no', // 账户
    ch: ch !== 'no', // 消息侧边栏
  };
};

/**
 * 获取应用界面特性路径
 */
export const getAppFeaturesPath = () => {
  const { s, tb, tr, ln, rp, td, ss, ac, ch } = getAppFeaturesVisible();

  return [
    s ? '' : 's=no',
    tb ? '' : 'tb=no',
    tr ? '' : 'tr=no',
    ln ? '' : 'ln=no',
    rp ? '' : 'rp=no',
    td ? '' : 'td=no',
    ss ? '' : 'ss=no',
    ac ? '' : 'ac=no',
    ch ? '' : 'ch=no',
  ]
    .filter(o => o)
    .join('&');
};

/**
 * 获取翻译数据
 * @param {*} appId 应用id
 * @param {*} parentId 父级id (应用项id)
 * @param {*} id 项目id (应用项id、分组id、视图id、...)
 * @param {*} data 翻译包数据
 * @returns { name、description、hintText、... }
 */
export const getTranslateInfo = (appId, parentId, id, data) => {
  const langData = data || window[`langData-${appId}`] || [];
  const findCondition = { correlationId: id };
  if (parentId) {
    findCondition.parentId = parentId;
  }
  const info = _.find(langData, findCondition);
  return info ? info.data || {} : {};
};

/**
 * 获取应用的翻译包数据
 */
export const getAppLangDetail = appDetail => {
  const { langInfo } = appDetail;
  const appId = appDetail.id;
  return new Promise((resolve, reject) => {
    if (langInfo && langInfo.appLangId && langInfo.version !== window[`langVersion-${appId}`]) {
      appManagementApi
        .getAppLangDetail({
          projectId: appDetail.projectId,
          appId,
          appLangId: langInfo.appLangId,
        })
        .then(lang => {
          window[`langData-${appId}`] = lang.items;
          window[`langVersion-${appId}`] = langInfo.version;
          resolve(lang);
        });
    } else {
      resolve();
    }
  });
};

export const shareGetAppLangDetail = data => {
  const langKey = getBrowserLang();
  const { appId, projectId } = data;
  return new Promise(resolve => {
    appManagementApi
      .getAppLangs({
        appId,
        projectId,
      })
      .then(data => {
        const langInfo = _.find(data, { langCode: langKey });
        if (langInfo) {
          appManagementApi
            .getAppLangDetail({
              appId,
              projectId,
              appLangId: langInfo.id,
            })
            .then(lang => {
              window[`langData-${appId}`] = lang.items;
              resolve(lang);
            });
        } else {
          resolve();
        }
      });
  });
};

// 从浏览器获取 language 匹配 getAppLangs 接口
const getBrowserLang = () => {
  let langKey = null;
  switch (navigator.language) {
    case 'zh-CN':
    case 'zh_cn':
    case 'zh-cn':
    case 'zh-SG':
    case 'zh_sg':
      langKey = 'zh_hans';
      break;
    case 'zh-TW':
    case 'zh-HK':
    case 'zh-Hant':
      langKey = 'zh_hant';
      break;
    case 'en-CA':
    case 'en-GB':
    case 'en-US':
    case 'en-AU':
    case 'en-IN':
    case 'en-IE':
    case 'en-NZ':
    case 'en-ZA':
    case 'en-GB-oxendict':
      langKey = 'en';
      break;
    case 'ko-KR':
      langKey = 'ko';
      break;
    default:
      langKey = navigator.language || 'en';
  }
  return langKey;
};
