import _ from 'lodash';
import agentApi from 'src/api/agent';
import appManagementApi from 'src/api/appManagement';
import homeAppApi from 'src/api/homeApp';
import { getAppLangCode } from 'src/common/langConfig';
import { DEFAULT_CONFIG, WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { genBotSessionId } from 'src/utils/agentSession';

export const PUBLIC_APP_BASE_LANG = '_base_';

export const getWidgetTypeName = type => {
  const widgetType = _.findKey(WIDGETS_TO_API_TYPE_ENUM, value => value === type);

  return { controlTypeName: _.get(DEFAULT_CONFIG, `${widgetType}.widgetName`), controlType: String(widgetType) };
};

export const getExistWorksheet = (data = {}) => {
  const existWorksheet = [];
  const sections = Array.isArray(data) ? data : data.sections || [];

  const pushWorksheet = item => {
    existWorksheet.push({
      name: item.workSheetName || item.name,
      description: item.remark,
      type: item.type === 1 ? 'page' : 'table',
    });
  };

  const walkSections = sectionList => {
    (sectionList || []).forEach(section => {
      (section.item || []).forEach(pushWorksheet);

      (section.workSheetInfo || []).forEach(item => {
        if (item.type === 2) {
          const childSection = (section.childSections || []).find(child => child.appSectionId === item.workSheetId);

          if (childSection) {
            walkSections([childSection]);
          }
        } else {
          pushWorksheet(item);
        }
      });
    });
  };

  walkSections(sections);

  return existWorksheet;
};

export const generateAppOrWorksheetDescription = async ({ name = '', description = '', isApp = true, data = {} }) => {
  let param = {
    userLanguage: window.getCurrentLang() || 'zh-Hans',
  };

  if (isApp) {
    param.appName = name || data.name;
    param.groups = JSON.stringify({
      appName: name || data.name,
      description: description || data.desc,
      existWorksheet: getExistWorksheet(data),
    });
  } else {
    param.tableName = name || data.name;
    param.tableDescription = description || data.description;
    param.fields = JSON.stringify(
      (_.get(data, 'template.controls') || []).map(item => {
        return {
          controlName: item.controlName,
          type: getWidgetTypeName(item.type).controlTypeName,
        };
      }),
    );
  }

  const result = await agentApi.agentExecute(
    {
      agentName: isApp ? 'app-description-generator' : 'worksheet-description-generator',
      sessionId: genBotSessionId(),
      message: _l('开始'),
      context: param,
    },
    { silent: true },
  );
  return result;
};

const langDataIndexCache = new WeakMap();

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
        data = btoa(data.replace(/fill=".*?"/g, '').replace(/<svg/, `<svg fill="${iconColor}"`));
      } else {
        data = btoa(data.replace(/<svg/, `<svg fill="${iconColor}"`));
      }

      $('[rel="icon"]').attr('href', `data:image/svg+xml;base64,${data}`);
    })
    .catch(() => {});
};

const getLangDataIndex = langData => {
  const cache = langDataIndexCache.get(langData);

  if (cache && cache.length === langData.length) {
    return cache;
  }

  const correlationIdMap = new Map();
  const parentIdMap = new Map();

  langData.forEach(item => {
    if (!item) return;

    const { correlationId, parentId } = item;

    if (!correlationIdMap.has(correlationId)) {
      correlationIdMap.set(correlationId, item);
    }

    if (!parentIdMap.has(parentId)) {
      parentIdMap.set(parentId, new Map());
    }

    const parentMap = parentIdMap.get(parentId);

    if (!parentMap.has(correlationId)) {
      parentMap.set(correlationId, item);
    }
  });

  const index = {
    length: langData.length,
    correlationIdMap,
    parentIdMap,
  };

  langDataIndexCache.set(langData, index);
  return index;
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

  if (!Array.isArray(langData)) {
    const findCondition = { correlationId: id };

    if (parentId) {
      findCondition.parentId = parentId;
    }

    const info = _.find(langData, findCondition);
    return info ? info.data || {} : {};
  }

  if (!langData.length) return {};

  const { correlationIdMap, parentIdMap } = getLangDataIndex(langData);
  const parentMap = parentId ? parentIdMap.get(parentId) : null;
  const info = parentId ? parentMap && parentMap.get(id) : correlationIdMap.get(id);

  return info ? info.data || {} : {};
};

/**
 * 获取应用的翻译包数据
 */
export const getAppLangDetail = appDetail => {
  const { langInfo } = appDetail;
  const appId = appDetail.id;
  return new Promise(resolve => {
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

/**
 * 按 appId 按需加载应用翻译包
 * 仅加载「当前应用」之外的语言包（如跨应用打开关联记录），保证 getTranslateInfo / replaceControlsTranslateInfo 能命中缓存
 */
export const ensureAppLangData = async appId => {
  if (!appId || window[`langData-${appId}`]) return;

  // 公开分享 / 公开表单等未登录态由 shareGetAppLangDetail 处理，避免在此调用需鉴权接口
  const isPublic =
    _.get(window, 'shareState.shareId') ||
    _.get(window, 'shareState.isPublicForm') ||
    _.get(window, 'shareState.isPublicWorkflowRecord');

  if (isPublic || !_.get(window, 'md.global.Account.accountId')) return;

  try {
    const langInfo = await homeAppApi.getAppLangInfo({ appId });

    if (langInfo && langInfo.appLangId && langInfo.version !== window[`langVersion-${appId}`]) {
      const lang = await appManagementApi.getAppLangDetail({
        appId,
        appLangId: langInfo.appLangId,
        projectId: langInfo.projectId,
      });
      window[`langData-${appId}`] = lang.items;
      window[`langVersion-${appId}`] = langInfo.version;
    }
  } catch (err) {
    // 加载失败时退回原文，不阻塞记录打开
    console.error(err);
  }
};

export const shareGetAppLangDetail = data => {
  const appLang = new URL(location.href).searchParams.get('app_lang');
  const isBaseLang = appLang === PUBLIC_APP_BASE_LANG;
  const langKey = isBaseLang ? '' : appLang || getAppLangCode(getCurrentLang());
  const { appId, projectId } = data;
  return new Promise(resolve => {
    appManagementApi
      .getAppLangs({
        appId,
        projectId,
      })
      .then(data => {
        window[`appLangs-${appId}`] = data || [];

        if (isBaseLang) {
          delete window[`langData-${appId}`];
          delete window[`langVersion-${appId}`];
          resolve();
          return;
        }

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
