import qs from 'query-string';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import worksheetAjax from 'src/api/worksheet';
import loginApi from 'src/api/login';
import { getDisabledControls, overridePos } from 'src/pages/publicWorksheetConfig/utils';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils';
import { getInfo } from './utils';
import { browserIsMobile, getRequest } from 'src/util';
import _ from 'lodash';
import { FILL_TIMES, WECHAT_FIELD_KEY } from '../publicWorksheetConfig/enum';
import { FILL_STATUS, SYSTEM_FIELD_IDS } from './enum';
import moment from 'moment';
import { themes } from 'src/pages/publicWorksheetConfig/enum';
import { COLORS } from '../AppHomepage/components/SelectIcon/config';
import globalApi from 'src/api/global';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { v4 as uuidv4 } from 'uuid';
import { setPssId } from 'src/util/pssId';

function getVisibleControls(data) {
  const disabledControlIds = getDisabledControls(
    data.originalControls,
    _.pick(data, [
      'ipControlId',
      'browserControlId',
      'deviceControlId',
      'systemControlId',
      'extendSourceId',
      'ipControlId',
      'weChatSetting',
    ]),
  );
  const needHidedControlIds = data.hidedControlIds.concat(disabledControlIds);
  return overridePos(data.originalControls, data.controls).map(c => ({
    ...c,
    advancedSetting: {
      ...(c.advancedSetting || {}),
      showtype: c.type === 29 && (c.advancedSetting || {}).showtype === '2' ? '1' : (c.advancedSetting || {}).showtype,
    },
    controlPermissions:
      _.find(needHidedControlIds, hcid => c.controlId === hcid) ||
      (c.type === 29 && !_.includes([0, 1], c.enumDefault2)) // 条件：关联表控件不允许选择已有记录
        ? '000'
        : c.controlPermissions,
    fieldPermission: c.fieldPermission ? c.fieldPermission.slice(0, 2) + '1' : '',
  }));
}

function getThemeBgColor(themeIndex, themeBgColor) {
  if (!themeBgColor) {
    return !themes[themeIndex] ? COLORS[12] : (themes[themeIndex] || {}).main;
  } else {
    return themeBgColor;
  }
}

export function getPublicWorksheetInfo(worksheetId, cb) {
  publicWorksheetAjax.getPublicWorksheetInfo({ worksheetId }).then(data => {
    const controls = getVisibleControls(data);
    cb(false, {
      publicWorksheetInfo: {
        ...data,
        logoUrl: data.logo,
        themeIndex: data.themeColor,
        themeBgColor: getThemeBgColor(data.themeColor, data.themeBgColor),
        coverUrl: data.cover,
        visibleType: 2,
      },
      formData: controls,
    });
  });
}

function clearUrl(source) {
  history.pushState(
    {},
    '',
    source ? `${location.origin}${location.pathname}?source=${source}` : location.origin + location.pathname,
  );
}

async function getStatus(data, shareId) {
  const {
    visibleType,
    fillTimes,
    linkSwitchTime = {},
    limitWriteCount = {},
    limitPasswordWrite = {},
    weChatSetting,
    isWithinLimitWriteTime,
    completeNumber,
    writeScope,
    projectId,
  } = data;
  const isWeChatEnv = navigator.userAgent.toLowerCase().indexOf('micromessenger') !== -1;

  //需要填写密码
  if (limitPasswordWrite.isEnable) {
    return FILL_STATUS.NEED_FILL_PASSWORD;
  }

  if (visibleType !== 2) {
    return FILL_STATUS.CLOSE;
  }

  //只允许在微信中填写
  if (weChatSetting.onlyWxCollect && !isWeChatEnv) {
    return FILL_STATUS.ONLY_WECHAT_FILL;
  }

  //表单设置了填写时间范围
  if (linkSwitchTime.isEnable) {
    if (moment().isBefore(moment(linkSwitchTime.startTime), 'second')) {
      return FILL_STATUS.NOT_OPEN;
    }
    if (moment().isAfter(moment(linkSwitchTime.endTime), 'second')) {
      return FILL_STATUS.CLOSE;
    }
  }

  //表单设置了填写数量上限
  if (limitWriteCount.isEnable) {
    if (completeNumber >= limitWriteCount.limitWriteCount) {
      return FILL_STATUS.CLOSE;
    }
  }

  // 微信打开
  if (isWeChatEnv) {
    if (weChatSetting.isCollectWxInfo || writeScope !== 1) {
      // 记录初始的 url 地址，用于微信鉴权
      sessionStorage.setItem('entryUrl', location.href);
      //所有人开启收集微信信息，或平台/组织用户，走微信授权跳转
      const request = getRequest();
      if (request.code && request.state) {
        const userInfo = await publicWorksheetAjax.getUserInfo({
          code: request.code,
          state: request.state,
        });
        if (userInfo) {
          safeLocalStorageSetItem('wxUserInfo', JSON.stringify(userInfo || {}));

          if (writeScope !== 1 && !md.global.Config.IsLocal && !!userInfo.state && weChatSetting.collectChannel === 1) {
            //平台或组织用户，非私有部署环境，state不为空，明道云公众号
            //走自动登录逻辑
            const loginResult = await loginApi.tPLogin({
              unionId: userInfo.unionId,
              state: userInfo.state,
              tpType: 1,
            });

            if (loginResult.accountResult === 1) {
              setPssId(loginResult.sessionId);
              const globalResult = await globalApi.getGlobalMeta({});
              if (globalResult) {
                window.config = globalResult.config;
                if (!window.md) {
                  window.md = { global: globalResult['md.global'] };
                } else {
                  window.md.global = globalResult['md.global'];
                }
                if (window.md.global && !window.md.global.Account) {
                  window.md.global.Account = {};
                }
              }
              clearUrl(request.source);
            }
          } else {
            clearUrl(request.source);
          }
        } else {
          const repeatRequestCount = sessionStorage.getItem('repeatRequestCount') || 0;

          if (repeatRequestCount === 0) {
            //为解决在微信中选择"在电脑中打开"获取不到userInfo,重新请求一次
            location.href = location.origin + location.pathname;
            sessionStorage.setItem('repeatRequestCount', repeatRequestCount + 1);
          } else {
            clearUrl(request.source);
          }
        }
      } else {
        //微信returnUrl跳转
        return FILL_STATUS.NEED_WECHAT_AUTH;
      }
    }
  }

  //平台用户,组织用户需要登陆 外部门户需要跳转到登录
  if (writeScope !== 1 && (!md.global.Account.accountId || md.global.Account.isPortal)) {
    return FILL_STATUS.NEED_LOGIN;
  }
  //组织用户, 判断是否是该组织成员
  if (writeScope === 3 && md.global.Account.projects) {
    const projectIds = md.global.Account.projects.map(p => p.projectId);
    if (!_.includes(projectIds, projectId)) {
      return FILL_STATUS.NO_PROJECT_USER;
    }
  }

  const publicWorksheetLastSubmit = localStorage.getItem('publicWorksheetLastSubmit_' + shareId);
  if (
    fillTimes === FILL_TIMES.UNLIMITED ||
    !publicWorksheetLastSubmit ||
    (fillTimes === FILL_TIMES.DAILY && moment().isAfter(moment(publicWorksheetLastSubmit).endOf('day')))
  ) {
    return isWithinLimitWriteTime ? FILL_STATUS.NORMAL : FILL_STATUS.NOT_IN_FILL_TIME;
  } else {
    return FILL_STATUS.COMPLETED;
  }
}

//获取填写者微信信息, 自动填充
function fillWxInfo(formData, weChatSetting) {
  let data = formData;
  const fieldMaps = weChatSetting.fieldMaps;
  const cacheUserInfo = localStorage.getItem('wxUserInfo');
  const wxUserInfo = JSON.parse(cacheUserInfo || '{}');

  if (!_.isEmpty(wxUserInfo)) {
    data = formData.map(item => {
      let itemData = item;
      for (let k in fieldMaps) {
        if (item.controlId === fieldMaps[k]) {
          itemData = {
            ...item,
            value:
              k === WECHAT_FIELD_KEY.HEAD_IMG_URL
                ? JSON.stringify(
                    wxUserInfo.avatarAttachment
                      ? {
                          attachments: [
                            {
                              ...wxUserInfo.avatarAttachment,
                              fileID: uuidv4(),
                              url:
                                wxUserInfo.avatarAttachment.url +
                                (wxUserInfo.avatarAttachment.url.indexOf('?') > -1 ? '' : '?'),
                            },
                          ],
                          knowledgeAtts: [],
                          attachmentData: [],
                        }
                      : {},
                  )
                : wxUserInfo[k],
          };
        }
      }
      return itemData;
    });
  }
  return data;
}

function formatAttachmentValue(value) {
  const attachmentArr = JSON.parse(value || '[]');
  let attachmentValue = attachmentArr;
  if (attachmentArr.length) {
    attachmentValue = attachmentArr
      .filter(item => !item.refId)
      .map((item, index) => {
        const url = new URL(item.fileUrl || '');
        const urlPathNameArr = (url.pathname || '').split('/');
        const fileName = (urlPathNameArr[urlPathNameArr.length - 1] || '').split('.')[0];
        const filePath = (url.pathname || '').slice(1).replace(fileName + item.ext, '');
        return {
          fileID: item.fileId,
          fileSize: item.filesize,
          url: item.fileUrl + (item.fileUrl.indexOf('?') > -1 ? '' : '?'),
          serverName: url.origin + '/',
          filePath,
          fileName,
          fileExt: item.ext,
          originalFileName: item.originalFilename,
          key: (url.pathname || '').slice(1),
          oldOriginalFileName: item.originalFilename,
          index,
        };
      });
  }
  return JSON.stringify({
    attachments: attachmentValue,
    knowledgeAtts: [],
    attachmentData: [],
  });
}

async function fillRowRelationRows(control, rowId, worksheetId) {
  let filledControl = control;
  await worksheetAjax
    .getRowRelationRows({
      shareId: window.shareState.shareId,
      controlId: control.controlId,
      rowId,
      worksheetId,
      pageIndex: 1,
      pageSize: 200,
      getWorksheet: true,
    })
    .then(res => {
      if (res.resultCode === 1) {
        let defSource;
        if (control.type === 34) {
          const subControls = ((res.template || {}).controls || []).filter(
            c => !_.includes(SYSTEM_FIELD_IDS, c.controlId),
          );
          const staticValue = (res.data || []).map(item => {
            let itemValue = {};
            subControls.forEach(c => {
              itemValue[c.controlId] =
                c.type === WIDGETS_TO_API_TYPE_ENUM.SIGNATURE
                  ? getSignatureValue(item[c.controlId])
                  : c.type === WIDGETS_TO_API_TYPE_ENUM.ATTACHMENT
                  ? formatAttachmentValue(item[c.controlId])
                  : item[c.controlId];
            });
            return itemValue;
          });
          defSource = [{ cid: '', rcid: '', isAsync: false, staticValue: JSON.stringify(staticValue) }];
        } else {
          defSource = res.data.map(item => {
            return { cid: '', rcid: '', isAsync: false, staticValue: JSON.stringify([JSON.stringify(item)]) };
          });
        }
        filledControl.advancedSetting = {
          ...control.advancedSetting,
          defsource: JSON.stringify(defSource),
        };
      }
    });
  return filledControl;
}

export async function getFormData(data, status) {
  const {
    shareId,
    appId,
    worksheetId,
    cacheDraft,
    cacheFieldData = {},
    weChatSetting = {},
    abilityExpand = {},
    writeScope,
  } = data;
  const controls = getVisibleControls(data);
  const isWeChatEnv = navigator.userAgent.toLowerCase().indexOf('micromessenger') !== -1;

  if (status === FILL_STATUS.NOT_IN_FILL_TIME) {
    return controls.map(c => {
      return { ...c, disabled: true };
    });
  }

  //自动填充填写者上次提交内容
  if (abilityExpand.autoFillField.isAutoFillField && (writeScope !== 1 || isWeChatEnv)) {
    let formData = controls;
    const queryParams = {
      appId,
      pageIndex: 1,
      pageSize: 50,
      keyWords: '',
      fastFilters: [],
      navGroupFilters: [],
      sortControls: [{ controlId: 'ctime', dataType: 2, isAsc: false }],
      notGetTotal: true,
      searchType: 1,
      status: 1,
    };
    const lastFillData = await publicWorksheetAjax.getLastFillData(queryParams);
    if (lastFillData.data && lastFillData.data[0]) {
      for (let i = 0; i < controls.length; i++) {
        let item = controls[i];
        const isNeedFill =
          _.includes(abilityExpand.autoFillField.autoFillFields, item.controlId) &&
          lastFillData.data[0][item.controlId];

        if (isNeedFill) {
          item = [29, 34].includes(item.type)
            ? //子表字段
              await fillRowRelationRows(item, lastFillData.data[0].rowid, worksheetId)
            : {
                ...item,
                value:
                  item.type === 14
                    ? formatAttachmentValue(lastFillData.data[0][item.controlId])
                    : lastFillData.data[0][item.controlId],
              };
        }

        formData[i] = item;
      }
    }
    if (weChatSetting.isCollectWxInfo) {
      formData = fillWxInfo(formData, weChatSetting);
    }

    return formData;
  }

  //自动填充本地缓存内容
  if (cacheFieldData.isEnable) {
    const cacheData = localStorage.getItem(`cacheFieldData_${shareId}`) || '[]';
    const cacheFormData = JSON.parse(cacheData) || [];
    let formData = controls.map(item => {
      if (_.includes(cacheFieldData.cacheField, item.controlId)) {
        const cacheField = cacheFormData.filter(c => c.controlId === item.controlId)[0] || {};
        return { ...item, value: cacheField.value };
      } else {
        return item;
      }
    });
    if (weChatSetting.isCollectWxInfo) {
      formData = fillWxInfo(formData, weChatSetting);
    }
    return formData;
  }

  //自动填充未提交缓存内容
  if (cacheDraft) {
    const cacheData = localStorage.getItem(`cacheDraft_${shareId}`) || '[]';
    let cacheFormData = JSON.parse(cacheData) || [];
    if (!!cacheFormData.length) {
      let formData = controls.map(item => {
        const cacheField = cacheFormData.filter(c => c.controlId === item.controlId)[0] || {};
        return { ...item, value: cacheField.value };
      });
      if (weChatSetting.isCollectWxInfo) {
        formData = fillWxInfo(formData, weChatSetting);
      }
      return formData;
    }
  }

  //自动填充微信收集者信息
  if (weChatSetting.isCollectWxInfo) {
    return fillWxInfo(controls, weChatSetting);
  }

  return controls;
}

export function getPublicWorksheet(params, cb = info => {}) {
  publicWorksheetAjax
    .getPublicWorksheet(params)
    .then(async data => {
      if (data.clientId) {
        sessionStorage.setItem('clientId', data.clientId);
      }

      const status = await getStatus(data, params.shareId);

      if (!data || data.visibleType !== 2) {
        cb({
          publicWorksheetInfo: {
            logoUrl: data.logo,
            name: data.name,
            themeIndex: data.themeColor,
            themeBgColor: getThemeBgColor(data.themeColor, data.themeBgColor),
            coverUrl: data.cover,
            projectName: data.projectName,
            worksheetId: data.worksheetId,
          },
          status,
        });
        return;
      }

      if (status === FILL_STATUS.NEED_LOGIN) {
        const cacheUserInfo = localStorage.getItem('wxUserInfo');
        const wxUserInfo = JSON.parse(cacheUserInfo || '{}');
        const url =
          wxUserInfo.unionId && wxUserInfo.state
            ? `/login?unionId=${wxUserInfo.unionId}&state=${wxUserInfo.state}&tpType=1&`
            : '/login?';

        // 外部用户已登录情况
        if (_.get(window, 'md.global.Account.isPortal')) {
          await loginApi.loginOut();
        }

        location.href = `${window.subPath || ''}${url}ReturnUrl=${encodeURIComponent(location.href)}`;
        return;
      }

      if (status === FILL_STATUS.NEED_WECHAT_AUTH) {
        const currentUrl = encodeURIComponent(location.href);
        const baseUrl = `${md.global.Config.WebUrl}weixinAuth`;
        const authUrl = `${data.returnUrl.replace(
          '&redirect_uri=custom',
          `&redirect_uri=${encodeURIComponent(`${baseUrl}?returnUrl=${currentUrl}`)}`,
        )}`;
        location.href = `${baseUrl}?authUrl=${encodeURIComponent(authUrl)}`;
        return;
      }

      data.shareAuthor && (window.shareAuthor = data.shareAuthor);
      worksheetAjax
        .getControlRules({
          worksheetId: data.worksheetId,
          type: 1, // 1字段显隐
        })
        .then(async rules => {
          cb({
            publicWorksheetInfo: {
              ...data,
              logoUrl: data.logo,
              themeIndex: data.themeColor,
              themeBgColor: getThemeBgColor(data.themeColor, data.themeBgColor),
              coverUrl: data.cover,
            },
            formData: await getFormData(data, status),
            rules,
            status,
          });
        });
    })
    .fail(err => {
      cb(false);
    });
}

function getInfoControl(formData, publicWorksheetInfo) {
  const info = getInfo();
  const { originalControls } = publicWorksheetInfo;
  const staticControlIds = [
    publicWorksheetInfo.browserControlId,
    publicWorksheetInfo.deviceControlId,
    publicWorksheetInfo.systemControlId,
    publicWorksheetInfo.extendSourceId,
    publicWorksheetInfo.ipControlId,
  ];
  const staticControls = originalControls.filter(control =>
    _.find(staticControlIds, scid => scid && scid === control.controlId),
  );
  return staticControls.map(item => {
    const indexOfId = staticControlIds.indexOf(item.controlId);
    return {
      ..._.pick(item, ['controlId', 'controlName', 'type']),
      value: info[['browser', 'device', 'system', 'source'][indexOfId]],
    };
  });
}

// 举报表单 自动填充
function fillReportSource(receiveControls, publicWorksheetInfo) {
  const { originalControls } = publicWorksheetInfo;
  const fromUrlControl = _.find(originalControls, oc => oc.controlName.indexOf('违规表单链接') > -1);
  if (!fromUrlControl) {
    return receiveControls;
  } else {
    let fromurl;
    try {
      fromurl = qs.parse(decodeURIComponent(location.search.slice(1))).from;
    } catch (err) {
      return receiveControls;
    }
    if (!fromurl) {
      return receiveControls;
    }
    return receiveControls
      .filter(control => control.controlId !== fromUrlControl.controlId)
      .concat({
        ...fromUrlControl,
        value: decodeURIComponent(fromurl),
      });
  }
}

function formatFileControls(controls) {
  return _.cloneDeep(controls).map(control => {
    if (control.type === 14 && control.value) {
      const parsed = JSON.parse(control.value);
      parsed.attachmentData = parsed.attachmentData.filter(item => {
        return item.accountId;
      });
      parsed.attachments = parsed.attachments.filter(item => {
        return item.key;
      });
      control.value = JSON.stringify(parsed);
    }
    return control;
  });
}

function getSignatureValue(value) {
  if (value === 'undefined' || value === '' || value === '[]' || value === '["",""]' || value === null) {
    return value;
  }
  try {
    return value.startsWith('http') ? JSON.stringify({ bucket: 4, key: new URL(value).pathname.slice(1) }) : value;
  } catch (err) {
    return;
  }
}

export function addWorksheetRow(
  { shareId, worksheetId, formData = [], params = {}, publicWorksheetInfo, triggerUniqueError = () => {} },
  cb = () => {},
) {
  const infoControl = getInfoControl(formData, publicWorksheetInfo);
  let receiveControls = formData
    .filter(c => !_.find(infoControl, ic => c.controlId === ic.controlId))
    .concat(infoControl)
    .filter(item => item.type !== 30 && item.type !== 31 && item.type !== 32);
  // 举报表单填充举报链接 写死id  仅公网有效
  if (shareId === 'a7f10198e9d84702b68ba35f73c94cac') {
    receiveControls = fillReportSource(receiveControls, publicWorksheetInfo);
  }
  if (browserIsMobile()) {
    receiveControls = formatFileControls(receiveControls);
  }
  publicWorksheetAjax
    .addRow({
      worksheetId,
      receiveControls: receiveControls.map(c => {
        if (c.type === WIDGETS_TO_API_TYPE_ENUM.SIGNATURE) {
          return {
            ...formatControlToServer(c, { needFullUpdate: true }),
            value: getSignatureValue(formatControlToServer(c, { needFullUpdate: true }).value),
          };
        } else {
          return formatControlToServer(c, { needFullUpdate: true });
        }
      }),
      ...params,
    })
    .then(data => {
      if (data) {
        if (data.resultCode === 1) {
          cb(null, data);
        } else {
          cb(true);
          switch (data.resultCode) {
            case 7:
              alert(_l('无权限'), 3);
              break;
            case 11:
              triggerUniqueError(data.badData);
              break;
            case 14:
              alert(_l('验证码错误'), 3);
              break;
            case 8:
            case 9:
            case 21:
              alert(_l('你访问的表单已停止数据收集！'), 2);
              break;
            case 15:
              alert(_l('手机验证码错误'), 2);
              break;
            case 16:
              alert(_l('手机验证码过期或失效'), 2);
              break;
            case 17:
              //链接失效
              location.reload();
              break;
            case 19:
              //密码过期，刷新页面
              location.reload();
              break;
            default:
              alert(_l('提交发生错误'), 3);
              break;
          }
        }
      }
    })
    .fail(error => {
      cb(error);
      if (error && error.errorCode === 4017) {
        alert(_l('应用附件上传流量不足，请联系表单发布者'), 3);
      }
    });
}
