import { getTranslateInfo } from 'src/utils/app';

const getTranslatedName = (appId, id, originalName) => getTranslateInfo(appId, null, id).name || originalName;

const translateObjectName = (appId, obj, idKey, nameKey) => {
  obj[nameKey] = getTranslatedName(appId, obj[idKey], obj[nameKey]);
};

const translateArrayNames = (appId, array, idKey, nameKey) => {
  (array || []).forEach(item => translateObjectName(appId, item, idKey, nameKey));
};

// 翻译工作表相关信息
export const fillTranslateInfo = (appId, roleDetail = {}) => {
  (roleDetail.sheets || []).forEach(sheet => {
    translateObjectName(appId, sheet, 'sheetId', 'sheetName');
    translateArrayNames(appId, sheet.views, 'viewId', 'viewName');
    translateArrayNames(appId, sheet.fields, 'fieldId', 'fieldName');
  });
  translateArrayNames(appId, roleDetail.pages, 'pageId', 'name');
  translateArrayNames(appId, roleDetail.chatbots, 'id', 'name');
};
