import sheetAjax from 'src/api/worksheet';
import moment from 'moment';
import { navigateTo } from 'src/router/navigateTo';
import { formatTemporaryData, formatKcAttachmentData } from 'src/components/UploadFiles/utils.js';
import { WORKSHEET_ROLE_TYPE, SUB_PERMISSION_NAME, ROW_HEIGHT, VIEW_DISPLAY_TYPE } from './enum';
import _ from 'lodash';

// 进入配置控件页面参数处理
export const getCustomWidgetUri = function ({ sourceName, templateId, sourceId, projectId, appconfig = {} }) {
  const fromURL = sId => {
    if (location.href.indexOf('application') > -1) {
      return encodeURIComponent(location.href);
    }

    return encodeURIComponent(`/app/${appconfig.appId}/${appconfig.appSectionId}/${sId}/${appconfig.viewId || ''}`);
  };

  let uri = `/worksheet/field/edit?projectId=${projectId}&sourceName=${encodeURIComponent(sourceName)}`;

  if (appconfig.appId) {
    uri += `&appId=${appconfig.appId}`;
  }

  if (sourceId) {
    uri += `&sourceId=${sourceId}&fromURL=${fromURL(sourceId)}&templateId=${templateId}`;
    navigateTo(uri);
  } else {
    sheetAjax.addWorksheet({ name: sourceName, projectid: projectId, sourceType: 1 }).then(data => {
      uri += `&sourceId=${data.id}&fromURL=${fromURL(data.id)}&templateId=${data.templateId}`;
      navigateTo(uri);
    });
  }
};

// 控件处理后的value值转化为给接口的值
export const getCellValue = function (cellItem, type) {
  switch (type) {
    // case 9:
    // case 11:
    //   return cellItem.value ? JSON.stringify([cellItem.value]) : '';
    case 10: {
      let mutiValue = '';
      let arrs = [];
      const value = _.forIn(cellItem.value, (value, key) => {
        if (!value) {
          delete cellItem.value[key];
        }
      });
      Object.keys(value).forEach(key => {
        if (!mutiValue) {
          mutiValue = key;
        } else if (mutiValue.length > key.length) {
          arrs = mutiValue.split('');
          arrs.splice(mutiValue.length - key.length, 1, '1');
          mutiValue = arrs.join('');
        } else {
          mutiValue = key.substr(0, key.length - mutiValue.length) + mutiValue;
        }
      });
      return cellItem.value ? mutiValue : '';
    }
    case 14: {
      if (cellItem.value) {
        // 附件：isEdit 后端判断是否是是新加文件，isEdit = false 为新加文件  true为原来就有的文件。
        cellItem.value.attachments = formatTemporaryData(cellItem.value.attachments).map(attItem => {
          let isEdit = false;
          if (attItem.twice) {
            isEdit = true;
          }
          return {
            ...attItem,
            isEdit,
          };
        });
        cellItem.value.knowledgeAtts = formatKcAttachmentData(cellItem.value.knowledgeAtts).map(knowAttItem => {
          let isEdit = false;
          if (!knowAttItem.isUpload) {
            isEdit = true;
          }
          return {
            ...knowAttItem,
            isEdit,
          };
        });
        // cellItem.value.attachments = cellItem.value.attachments.map((item) => {
        //   let isEdit = false;
        //   if (item.twice) {
        //     isEdit = true;
        //   }
        //   return {
        //     ...item,
        //     isEdit,
        //   };
        // });
        // cellItem.value.knowledgeAtts = cellItem.value.knowledgeAtts.map((item) => {
        //   let isEdit = false;
        //   if (item.twice) {
        //     isEdit = true;
        //   }
        //   return {
        //     ...item,
        //     isEdit: !!item.twice,
        //   };
        // });
      }
      return cellItem.value ? JSON.stringify(cellItem.value) : '';
    }
    case 15:
      return cellItem.value ? moment(cellItem.value).format('YYYY-MM-DD') : '';
    case 16:
      return cellItem.value ? moment(cellItem.value).format('YYYY-MM-DD HH:mm') : '';
    case 17:
    case 18:
      return cellItem.value ? JSON.stringify(cellItem.value.map(item => moment(item).format('YYYY-MM-DD HH:mm'))) : '';
    case 19:
    case 23:
    case 24:
      return cellItem.value ? cellItem.value[cellItem.value.length - 1].id : '';
    case 27:
      return cellItem.value ? JSON.stringify([cellItem.value]) : '';
    case 21:
    case 26:
    case 28:
      return cellItem.value ? JSON.stringify(cellItem.value) : '';
    case 29:
      return cellItem.value
        ? JSON.stringify(
            cellItem.value.map(relateRecordItem => {
              return {
                ...relateRecordItem,
                sourcevalue: {},
              };
            }),
          )
        : '';
    default:
      return cellItem.value ? (typeof cellItem.value === 'string' ? cellItem.value : cellItem.value.toString()) : '';
  }
};

// 接口的值转化为控件的value值
export const getControlValue = function (controlItem) {
  switch (controlItem.type) {
    // case 9:
    // case 11:
    //   return controlItem.value ? JSON.parse(controlItem.value)[0] : 0;
    // case 14: {
    //   const value = {};
    //   value.attachments = JSON.parse(controlItem.value);
    //   return controlItem.value ? JSON.parse(controlItem.value) : '';
    // }
    case 14: {
      const value = {
        attachments: [],
        knowledgeAtts: [],
        attachmentData: [],
      };
      const fileData = controlItem.value ? JSON.parse(controlItem.value) : {};
      if (fileData && fileData.map) {
        fileData.map((_file, i, list) => {
          if (_file.refType) {
            value.knowledgeAtts.push(_file);
          } else {
            value.attachments.push(_file);
          }
          return null;
        });
      }
      return value;
    }
    case 17:
    case 18: {
      if (controlItem.value) {
        try {
          return JSON.parse(controlItem.value).filter(item => item).length > 0
            ? JSON.parse(controlItem.value).map(item => {
                return item ? moment(item).format('x') : '';
              })
            : '';
        } catch (error) {
          return controlItem.value.split(',').filter(item => item).length > 0
            ? controlItem.value.split(',').map(item => {
                return item || '';
              })
            : '';
        }
      }
      break;
    }
    // return controlItem.value && JSON.parse(controlItem.value).filter(item => item).length > 0 ? JSON.parse(controlItem.value).map((item) => { return item ? moment(item).format('x') : ''; }) : '';
    case 15:
    case 16:
      return controlItem.value ? JSON.parse(moment(controlItem.value).format('x')) : '';
    case 21:
    case 26:
    case 28:
    case 29:
      return controlItem.value ? JSON.parse(controlItem.value) : '';
    case 27:
      return controlItem.value ? JSON.parse(controlItem.value)[0] : '';
    default:
      return controlItem.value;
  }
};

export function getUserRoleDesc(permissionIds) {
  return permissionIds
    .map(pId => {
      const typeId = Math.floor(pId / 1000);
      switch (typeId) {
        case 301:
          return _l('可查看%0', pId === 301100 ? _l('全部') : SUB_PERMISSION_NAME[pId - 301000]);
        case 302:
          return _l('可编辑%0', SUB_PERMISSION_NAME[pId - 302000]);
        case 303:
          return _l('可分享%0', SUB_PERMISSION_NAME[pId - 303000]);
        case 304:
          return _l('可导出%0', SUB_PERMISSION_NAME[pId - 304000]);
        default:
          return '';
      }
    })
    .filter(a => a)
    .join('、');
}

// 从lcoalstorage读取显隐列
export function getHidedColumnsFromStorage(id) {
  const storageStr = window.localStorage.getItem(`worksheet_hided_columns_${md.global.Account.accountId}_${id}`);
  if (!storageStr) {
    return [];
  } else {
    return storageStr.split(',');
  }
}

// 存储显隐列到lcoalstorage
export function saveHidedColumnsToStorage(id, hidedColumns) {
  safeLocalStorageSetItem(`worksheet_hided_columns_${md.global.Account.accountId}_${id}`, hidedColumns.join(','));
}

// 是否看板视图、画廊视图
export const isGalleryOrBoard = type => {
  return [VIEW_DISPLAY_TYPE.gallery, VIEW_DISPLAY_TYPE.board].includes(String(type));
};

// 是否看板视图、画廊视图、层级视图、详情视图
export const isGalleryOrBoardOrStructureOrDetail = type => {
  return [
    VIEW_DISPLAY_TYPE.gallery,
    VIEW_DISPLAY_TYPE.board,
    VIEW_DISPLAY_TYPE.structure,
    VIEW_DISPLAY_TYPE.detail,
  ].includes(String(type));
};

// 根据视图类型，设置封面位置和显示方式的默认值
export const getDefaultViewSet = data => {
  let { viewType, advancedSetting = {}, coverType = 0 } = data;
  if (VIEW_DISPLAY_TYPE.gallery === String(viewType)) {
    let { coverposition = '2' } = advancedSetting;
    // 画廊视图封面设置项 默认上，且上时，显示方式只支持 填满和完整显示
    if (coverposition === '2' && coverType >= 2) {
      coverType = 0;
    }
    return {
      ...data,
      coverType,
      advancedSetting: {
        ...advancedSetting,
        coverposition,
      },
    };
  } else {
    //看板视图、表视图、层级视图封面设置项 默认右
    let { coverposition = '0' } = advancedSetting;
    let childTypeObj = {};
    if (coverposition === '2') {
      coverposition = '0';
    }
    //表视图 新建默认不启用业务规则
    if (VIEW_DISPLAY_TYPE.sheet === String(viewType)) {
      advancedSetting = { ...advancedSetting, enablerules: '1' };
    }
    if (VIEW_DISPLAY_TYPE.detail === String(viewType)) {
      childTypeObj = { childType: 2 };
    }
    return {
      ...data,
      coverType,
      advancedSetting: {
        ...advancedSetting,
        coverposition,
      },
      ...childTypeObj,
    };
  }
};
