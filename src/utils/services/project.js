import _, { get } from 'lodash';
import accountAjax from 'src/api/account';
import actionLogAjax from 'src/api/actionLog';
import projectAjax from 'src/api/project';
import { SYS_CHART_COLORS, SYS_COLOR } from 'src/utils/domain/project/colors';
import { setSessionStorageItemSafely } from 'src/utils/platform/storage/safe';

/**
 * 从当前账户缓存中获取指定组织信息，必要时同步补取外部组织授权。
 */
export const getCurrentProject = (id, isExternalProject) => {
  if (!id) return {};

  const externalProjects = _.get(md, ['global', 'Account', 'externalProjects']) || [];
  const projects = (_.get(md, ['global', 'Account', 'projects']) || []).concat(
    isExternalProject ? externalProjects : [],
  );
  let info = _.find(projects, item => item.projectId === id);

  if (!info && isExternalProject) {
    return getSyncLicenseInfo(id);
  }

  return info || {};
};

/**
 * 通过桌面或移动 App 桥接发送请求，并解析 Base64 编码的异步响应。
 */
export function mdAppResponse(param) {
  return new Promise(resolve => {
    // 注册监听
    window.MD_APP_RESPONSE = base64 => {
      const decodedData = window.atob(base64);
      resolve(JSON.parse(decodeURIComponent(escape(decodedData))));
    };

    // 触发监听的回调函数
    const string = JSON.stringify(param);
    const base64 = window.btoa(string);

    if (window.isMacOs) {
      window.webkit?.messageHandlers?.MD_APP_REQUEST?.postMessage(base64);
    } else {
      window.Android.MD_APP_REQUEST(base64);
    }
  });
}

/**
 * 从账户缓存读取组织授权信息，缺失时同步请求并缓存外部组织授权。
 */
export const getSyncLicenseInfo = projectId => {
  const { projects = [], externalProjects = [] } = md.global.Account;
  let projectInfo = _.find(projects.concat(externalProjects), o => o.projectId === projectId) || {};

  if (_.isEmpty(projectInfo)) {
    if (
      window.isPublicApp ||
      !/^[A-Za-z0-9]{8}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{12}$/.test(projectId)
    ) {
      return {};
    }

    const info = projectAjax.getProjectLicenseInfo({ projectId }, { ajaxOptions: { sync: true } });

    projectInfo = { ...info, projectId };
    md.global.Account.externalProjects = (md.global.Account.externalProjects || []).concat(projectInfo);
  }

  return projectInfo;
};

/**
 * 根据组织版本与产品项返回功能状态：正常或需升级。
 */
export function getFeatureStatus(projectId, featureId) {
  if (window.shareState.shareId) return;
  if (!/^[A-Za-z0-9]{8}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{12}$/.test(projectId)) return;

  const { Versions = [] } = md.global || {};
  const { version = { versionIdV2: '-1' } } = getSyncLicenseInfo(projectId);
  const versionInfo = _.find(Versions || [], item => item.VersionIdV2 === version.versionIdV2) || {};

  return (_.find(versionInfo.Products || [], item => item.ProductType === featureId) || {}).Type;
}

/**
 * 添加行为日志。
 * @param {string} type - 日志类型，可选值为 'app', 'worksheet', 'customPage', 'worksheetRecord', 'printRecord',
 * 'printWord', 'pintTemplate', 'printQRCode', 'printBarCode', 'batchPrintWord', 'previewFile', 'decode'。
 * @param {string} entityId - 实体 ID。(根据访问类型不同， 传不同模块id：浏览应用，entityId =应用id，
 * 浏览自定义页面，entityId = 页面id。其他的浏览行为 =worksheetId）
 * @param {Object} params - 额外的参数，用于记录日志的详细信息。
 * @param {boolean} isLinkVisited - 是否通过链接访问
 */
export const addBehaviorLog = (type, entityId, params = {}, isLinkVisited) => {
  if (!get(md, 'global.Account.accountId')) return;

  const typeObj = {
    app: 1, // 应用
    worksheet: 2, // 工作表
    customPage: 3, // 自定义页面
    worksheetRecord: 4, // 工作表记录
    printRecord: 5, // 打印了记录
    printWord: 6, // 使用了word模板打印
    pintTemplate: 7, // 使用了模板打印了记录
    printQRCode: 8, // 打印了二维码
    printBarCode: 9, // 打印了条形码
    batchPrintWord: 10, // 批量word打印
    previewFile: 11, // 文件预览
    worksheetDecode: 12, // 工作表解码(字段只读状态下记日志，包含H5记录呈现态)
    worksheetBatchDecode: 13, // 工作表批量解码
    robot: 20, // 对话机器人
  };

  if ((type === 'worksheetDecode' && !params.rowId) || (type === 'worksheetDecode' && !params.controlId)) return;

  const addBehaviorLogInfo = sessionStorage.getItem('addBehaviorLogInfo')
    ? safeParse(sessionStorage.getItem('addBehaviorLogInfo'), null)
    : undefined;

  if (isLinkVisited && _.isEqual(addBehaviorLogInfo, { type, entityId, params })) {
    return;
  }

  setSessionStorageItemSafely('addBehaviorLogInfo', JSON.stringify({ type, entityId, params }));

  // 调用 actionLogAjax.addLog 方法记录行为日志
  actionLogAjax
    .addLog({ type: typeObj[type], entityId, params })
    .then(res => {
      if (res && !(type === 'app' && !isLinkVisited) && !(type === 'worksheet' && !isLinkVisited)) {
        sessionStorage.removeItem('addBehaviorLogInfo');
      }
    })
    .catch(() => {
      sessionStorage.removeItem('addBehaviorLogInfo');
    });
};

/**
 * 获取组织管理颜色配置。
 * @param {string} projectId - 网络ID
 * @returns {Object} - 包含图表颜色和主题颜色配置的对象。
 */
const getProjectColor = projectId => {
  const { PorjectColor, Account } = md.global;
  const { projects = [] } = Account;
  const currentProjectId = localStorage.getItem('currentProjectId');
  const id = projectId || currentProjectId || _.get(projects[0], 'projectId');
  const data = _.find(PorjectColor, { projectId: id });

  if (data) {
    const mapColor = colors =>
      colors.map(item => {
        const data = _.find(SYS_CHART_COLORS, { id: item.id });
        return {
          ...data,
          enable: item.enable,
        };
      });
    data.chartColor.system = _.isEmpty(data.chartColor.system) ? SYS_CHART_COLORS : mapColor(data.chartColor.system);
    data.themeColor.system = _.isEmpty(data.themeColor.system) ? SYS_COLOR : data.themeColor.system;

    return data;
  } else {
    return {
      chartColor: {
        custom: [],
        system: SYS_CHART_COLORS,
      },
      themeColor: {
        custom: [],
        system: SYS_COLOR,
      },
    };
  }
};

/** 获取启用的系统与自定义图表配色方案。 */
export const getProjectChartColors = projectId => {
  const { chartColor } = getProjectColor(projectId);
  const systemColors = (chartColor.system || []).filter(item => item.enable !== false && !_.isEmpty(item.colors));
  const customColors = (chartColor.custom || []).filter(item => item.enable !== false && !_.isEmpty(item.colors));
  return systemColors.concat(customColors);
};

/**
 * 获取组织管理主题色。
 * @param {string} projectId - 网络ID
 * @returns {[]} - 包含系统色和自定义色的颜色数组。
 */
export const getThemeColors = projectId => {
  // 获取项目颜色配置
  const { themeColor } = getProjectColor(projectId);
  // 过滤并映射系统色，去除未启用的项
  const systemColorList = (themeColor.system || []).filter(item => item.enable !== false).map(item => item.color);
  // 过滤并映射自定义色，去除未启用的项
  const customColorList = (themeColor.custom || []).filter(item => item.enable !== false).map(item => item.color);
  // 合并系统色和自定义色的颜色数组
  return systemColorList.concat(customColorList);
};

/**
 * 从本地缓存读取当前账户联系方式，并在缓存失效时同步刷新。
 */
export const getContactInfo = key => {
  const contactInfo = safeParse(window.localStorage.getItem('contactInfo') || '{}');

  if (!md.global.Account.accountId) return '';

  // 用户不匹配、用户信息更改重新获取数据
  if (
    _.isEmpty(contactInfo) ||
    contactInfo.accountId !== md.global.Account.accountId ||
    (contactInfo[key] &&
      md.global.Account[key].replace(/\*/g, (a, b) => {
        return contactInfo[key][b];
      }) !== contactInfo[key])
  ) {
    const data = accountAjax.getMyContactInfo({}, { ajaxOptions: { sync: true } });
    safeLocalStorageSetItem('contactInfo', JSON.stringify(data));
    return data[key];
  }

  return contactInfo[key];
};

/**
 * 在明道云 App 中优先调用可用的 MDJS 方法，否则执行 H5 回退逻辑。
 */
export const compatibleMDJS = (jsFuncName, jsParams = {}, h5callBack = () => {}, appCallBack = () => {}) => {
  if (window.isMingDaoApp && window.MDJS && window.MDJS[jsFuncName]) {
    window.MDJS[jsFuncName](jsParams);
    appCallBack();
  } else {
    h5callBack();
  }
};
