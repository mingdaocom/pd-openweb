export const getMaxControlsCount = () => (window.platformENV.isLocal ? 2000 : 200);

/** 读取指定应用的运行时时区偏移。 */
export const getAppTimeZone = appId => window[`timeZone_${appId}`];

/** 读取附件重建所需的平台及文件存储配置。 */
export const getAttachmentRuntimeConfig = () => ({
  documentHost: md.global.FileStoreConfig.documentHost,
  isLocal: window.platformENV.isOverseas || window.platformENV.isLocal,
  pictureHost: md.global.FileStoreConfig.pictureHost,
});

/** 读取当前账户地图配置，未登录时回退到系统默认地图。 */
export const getMapConfig = () => (md.global.Account.accountId ? md.global.Account.map : md.global.Config.DefaultMap);

/** 读取子表字段在编辑器中的运行时模式。 */
export const getSubListSheetMode = controlId => (window.subListSheetConfig || {})[controlId]?.mode;

/** 判断指定应用的运行时语言包是否已加载。 */
export const hasAppLangData = appId => Boolean(window[`langData-${appId}`]);

/** 判断当前账户是否为外部门户账户。 */
export const isPortalAccount = () => Boolean(md.global.Account.isPortal);
