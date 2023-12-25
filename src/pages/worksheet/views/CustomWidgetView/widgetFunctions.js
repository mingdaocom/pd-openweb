import axios from 'axios';
import { isEmpty, reject } from 'lodash';
import { getPssId } from 'src/util/pssId';
import addRecord from 'worksheet/common/newRecord/addRecord';
import { openAddRecord as mobileAddRecord } from 'mobile/Record/addRecord';
import { openRecordInfo } from 'worksheet/common/recordInfo';
import { openMobileRecordInfo } from 'src/pages/Mobile/Record';
import { selectUser } from 'mobile/components/SelectUser';
import { mobileSelectRecord } from 'src/components/recordCardListDialog/mobile';
import { selectOrgRole as mobileSelectOrgRole } from 'mobile/components/SelectOrgRole';
import { antAlert } from 'src/util/antdWrapper';
import dialogSelectUser from 'src/components/dialogSelectUser/dialogSelectUser';
import { selectOrgRole } from 'src/components/DialogSelectOrgRole';
import DialogSelectGroups from 'src/components/dialogSelectDept';
import { selectRecord } from 'src/components/recordCardListDialog';
import renderText from 'worksheet/components/CellControls/renderText';
import selectLocation from './selectLocation';
import { browserIsMobile, addBehaviorLog, mdAppResponse } from 'src/util';

function mdPost(action, controller, data) {
  let pssId = getPssId();
  const headers = {
    authorization: pssId ? `md_pss_id ${pssId}` : '',
  };
  if (window.share) {
    headers.share = window.share;
  }
  if (window.access_token) {
    // 工作流&统计服务
    headers.access_token = window.access_token;
    // 主站服务
    headers.Authorization = `access_token ${window.access_token}`;
  }
  return axios
    .post(`${window.__api_server__.main}/${action}/${controller}`, data, {
      headers,
    })
    .then(res => {
      if (res.data.state) {
        return res.data.data;
      } else {
        throw new Error(res.data.exception);
      }
    });
}

export const api = {
  getFilterRowsTotalNum: data => mdPost('Worksheet', 'GetFilterRowsTotalNum', data),
  getFilterRows: data => mdPost('Worksheet', 'GetFilterRows', data),
  getRowRelationRows: data => mdPost('Worksheet', 'GetRowRelationRows', data),
  getRowDetail: data => mdPost('Worksheet', 'GetRowDetail', data),
  addWorksheetRow: data => mdPost('Worksheet', 'AddWorksheetRow', data),
  deleteWorksheetRow: data => mdPost('Worksheet', 'DeleteWorksheetRows', data),
  updateWorksheetRow: data => mdPost('Worksheet', 'UpdateWorksheetRow', data),
  getWorksheetInfo: data => mdPost('Worksheet', 'GetWorksheetInfo', data),
};

const isMobile = browserIsMobile();
const isMingDaoMobileClient = navigator.userAgent.toLowerCase().indexOf('mingdao application') >= 0;

export const utils = {
  alert: window.alert,
  openRecordInfo: args => {
    addBehaviorLog('worksheetRecord', args.worksheetId, { rowId: args.recordId }); // 浏览记录埋点
    if (isMingDaoMobileClient) {
      const sessionId = Math.random().toString(32).slice(2);
      return mdAppResponse({
        sessionId,
        type: 'native',
        settings: {
          action: 'row',
          appId: args.appId,
          worksheetId: args.worksheetId,
          viewId: args.viewId,
          rowId: args.recordId,
        },
      }).then(res => {
        if (res.action === 'close') {
          return { action: 'close' };
        } else if (res.action === 'row') {
          return { action: 'update', value: safeParse(res.value)[0] };
        }
      });
    }
    return new Promise((resolve, reject) => {
      (isMobile ? openMobileRecordInfo : openRecordInfo)({
        projectId: args.worksheetInfo.projectId,
        allowAdd: args.worksheetInfo.allowAdd,
        ...args,
        ...(isMobile
          ? {
              rowId: args.recordId,
              className: 'full',
              updateSuccess: (rowIds, newRow) => {
                resolve({ action: 'update', value: newRow });
              },
            }
          : {
              updateRows: (rowIds, newRow) => {
                resolve({ action: 'update', value: newRow });
              },
            }),
      });
    });
  },
  openNewRecord: args => {
    if (isMingDaoMobileClient) {
      const sessionId = Math.random().toString(32).slice(2);
      return mdAppResponse({
        sessionId,
        type: 'native',
        settings: {
          action: 'addRow',
          appId: args.appId,
          worksheetId: args.worksheetId,
          viewId: args.viewId,
        },
      }).then(res => {
        if (res.action === 'close') {
          return;
        } else if (res.action === 'addRow') {
          return safeParse(res.value)[0];
        }
      });
    }
    return new Promise((resolve, reject) => {
      (isMobile ? mobileAddRecord : addRecord)({
        ...args,
        onAdd: resolve,
      });
    });
  },
  selectUsers: ({ unique, onClose = () => {}, onSelect = () => {}, ...rest } = {}) => {
    if (isMingDaoMobileClient) {
      const sessionId = Math.random().toString(32).slice(2);
      return mdAppResponse({
        sessionId,
        type: 'native',
        settings: {
          action: 'selectUsers',
          projectId: rest.worksheetInfo.projectId,
          unique: unique,
        },
      }).then(res => {
        if (res.action === 'close') {
          return [];
        } else if (res.action === 'selectUsers') {
          return safeParse(res.value, 'array').map(user => ({
            accountId: user.account_id,
            avatar: user.avatar,
            fullname: user.full_name || user.fullname,
          }));
        }
      });
    }
    return new Promise((resolve, reject) => {
      if (isMobile) {
        selectUser({
          type: 'user',
          projectId: rest.worksheetInfo.projectId,
          onlyOne: unique,
          onSave: resolve,
          ...rest,
        });
      } else {
        dialogSelectUser({
          SelectUserSettings: {
            projectId: rest.worksheetInfo.projectId,
            callback: resolve,
            ...rest,
          },
        });
      }
    });
  },
  selectDepartments: ({ unique, onClose = () => {}, onSelect = () => {}, ...rest } = {}) => {
    if (isMingDaoMobileClient) {
      const sessionId = Math.random().toString(32).slice(2);
      return mdAppResponse({
        sessionId,
        type: 'native',
        settings: {
          action: 'selectDepartments',
          projectId: rest.worksheetInfo.projectId,
          unique: unique,
        },
      }).then(res => {
        if (res.action === 'close') {
          return;
        } else if (res.action === 'selectDepartments') {
          return safeParse(res.value, 'array').map(department => ({
            departmentId: department.department_id,
            departmentName: department.department_name,
          }));
        }
      });
    }
    return new Promise((resolve, reject) => {
      if (isMobile) {
        selectUser({
          type: 'department',
          projectId: rest.worksheetInfo.projectId,
          onlyOne: unique,
          onSave: resolve,
          ...rest,
        });
      } else {
        return new DialogSelectGroups({
          projectId: rest.worksheetInfo.projectId,
          isIncludeRoot: rest.isIncludeRoot,
          unique: unique,
          showCreateBtn: rest.showCreateBtn,
          allPath: rest.allPath,
          selectFn: resolve,
          onClose: () => resolve(),
          ...rest,
        });
      }
    });
  },
  selectOrgRole: ({ unique, onClose = () => {}, onSelect = () => {}, ...rest } = {}) => {
    if (isMingDaoMobileClient) {
      const sessionId = Math.random().toString(32).slice(2);
      return mdAppResponse({
        sessionId,
        type: 'native',
        settings: {
          action: 'selectOrgRole',
          projectId: rest.worksheetInfo.projectId,
          unique: unique,
        },
      }).then(res => {
        if (res.action === 'close') {
          return;
        } else if (res.action === 'selectOrgRole') {
          return safeParse(res.value, 'array').map(orgRole => ({
            organizeId: orgRole.organizeId,
            organizeName: orgRole.organizeName,
          }));
        }
      });
    }
    return new Promise((resolve, reject) => {
      if (isMobile) {
        mobileSelectOrgRole({
          projectId: rest.worksheetInfo.projectId,
          onlyOne: unique,
          onSave: resolve,
          ...rest,
        });
      } else {
        return selectOrgRole({
          projectId: rest.worksheetInfo.projectId,
          unique: unique,
          onSave: resolve,
          ...rest,
        });
      }
    });
  },
  selectRecord: ({ relateSheetId, multiple, onClose = () => {}, onSelect = () => {}, ...rest } = {}) => {
    if (isMingDaoMobileClient) {
      const sessionId = Math.random().toString(32).slice(2);
      return mdAppResponse({
        sessionId,
        type: 'native',
        settings: {
          action: 'selectRecord',
          projectId: rest.worksheetInfo.projectId,
          relateSheetId,
          multiple,
        },
      }).then(res => {
        if (res.action === 'close') {
          return;
        } else if (res.action === 'selectRecord') {
          return safeParse(res.value, 'array');
        }
      });
    }
    return new Promise((resolve, reject) => {
      (isMobile ? mobileSelectRecord : selectRecord)({
        projectId: rest.worksheetInfo.projectId,
        canSelectAll: false,
        pageSize: rest.pageSize,
        multiple: multiple,
        singleConfirm: true,
        relateSheetId,
        onOk: resolve,
        ...rest,
      });
    });
  },
  selectLocation: (options = {}) => {
    const { distance, onClose = () => {}, onSelect = () => {} } = options;
    if (isMingDaoMobileClient) {
      const sessionId = Math.random().toString(32).slice(2);
      return mdAppResponse({
        sessionId,
        type: 'map',
        settings: {
          action: 'map',
          range: distance,
        },
      }).then(res => {
        if (res.action === 'close') {
          return;
        } else if (res.action === 'map') {
          const value = safeParse(res.value);
          return !isEmpty(value)
            ? {
                address: value.address,
                lat: value.lat,
                lng: value.lon,
                name: value.title,
              }
            : undefined;
        }
      });
    }
    return new Promise((resolve, reject) => {
      selectLocation({ ...options, onSelect: resolve });
    });
  },
  renderText,
};
