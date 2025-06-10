import React from 'react';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Dialog } from 'ming-ui';
import fileAjax from 'src/api/file';
import sheetAjax from 'src/api/worksheet';
import { getFilter } from 'worksheet/common/WorkSheetFilter/util';
import { upgradeVersionDialog } from 'src/components/upgradeVersion';
import {
  ACTION_VALUE_ENUM,
  ADD_EVENT_ENUM,
  FILTER_VALUE_ENUM,
  SPLICE_TYPE_ENUM,
  VOICE_FILE_LIST,
} from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';
import { getDefaultCount } from 'src/pages/widgetConfig/widgetSetting/components/SearchWorksheet/SearchWorksheetDialog.jsx';
import { browserIsMobile } from 'src/utils/common';
import { isSheetDisplay } from '../../../pages/widgetConfig/util/index.js';
import { getParamsByConfigs } from '../widgets/Search/util.js';
import { handleUpdateApi } from '../widgets/Search/util.js';
import { FORM_ERROR_TYPE } from './config.js';
import { replaceStr } from './formUtils';
import {
  calcDefaultValueFunction,
  checkValueAvailable,
  formatSearchResultValue,
  getCurrentValue,
  getDynamicValue,
} from './formUtils.js';
import { formatControlToServer, isPublicLink } from './utils.js';

// 显隐、只读编辑等处理
const dealDataPermission = props => {
  const { actionItems = [], actions = [], actionType, formData = [] } = props;

  function setEventPermission(item) {
    // eventPermissions给默认值111，计算会覆盖字段原始只读(x用来区分是否由事件导致变更过)
    let eventPermissions = item.eventPermissions || 'xxx';
    switch (actionType) {
      case ACTION_VALUE_ENUM.READONLY:
        eventPermissions = replaceStr(eventPermissions, 1, '0');
        break;
      case ACTION_VALUE_ENUM.EDIT:
        eventPermissions = replaceStr(eventPermissions, 1, '1');
        break;
      case ACTION_VALUE_ENUM.SHOW:
        eventPermissions = replaceStr(eventPermissions, 0, '1');
        break;
      case ACTION_VALUE_ENUM.HIDE:
        eventPermissions = replaceStr(eventPermissions, 0, '0');
        break;
    }
    item.eventPermissions = eventPermissions.replace(/x/g, (a, b) => {
      return (item.fieldPermission || '111')[b];
    });
  }

  // 只读所有字段
  if (actionType === ACTION_VALUE_ENUM.READONLY && _.some(actions, a => a.isAll)) {
    formData.forEach(item => setEventPermission(item));
  } else {
    formData.forEach(item => {
      actionItems.map(i => {
        const { controlId, childControlIds = [] } = i || {};
        if (controlId === _.get(item, 'controlId')) {
          if (_.isEmpty(childControlIds)) {
            setEventPermission(item);
          } else {
            childControlIds.map(childId => {
              const childControl = _.find(_.get(item, 'relationControls') || [], re => re.controlId === childId);
              if (childControl) {
                setEventPermission(childControl);
              }
            });
          }
        }
      });
    });
  }

  return formData;
};

// 获取默认值
const getDynamicData = ({ formData, embedData, masterData }, control) => {
  const defaultType = _.get(control, 'advancedSetting.defaulttype');
  // 函数
  if (defaultType === '1') {
    const defaultFunc = _.get(control, 'advancedSetting.defaultfunc');
    if (_.isEmpty(defaultFunc)) {
      return isSheetDisplay(control) ? '[]' : '';
    }
    return calcDefaultValueFunction({ fnControl: control, formData, forceSyncRun: true });
  } else {
    const defSource = _.get(control, 'advancedSetting.defsource');
    const parsed = safeParse(defSource, 'array');
    // 没值或配置清空相当于清空
    if (_.isEmpty(parsed) || _.get(parsed, '0.cid') === 'empty') {
      return isSheetDisplay(control) || control.type === 34 ? '[]' : '';
    }
    return getDynamicValue(formData, control, masterData, embedData);
  }
};

// 能配查询多条的是否赋值的控件
const canSearchMore = currentControl => {
  return !_.includes([29, 34], currentControl.type) || (currentControl.type === 29 && currentControl.enumDefault === 1);
};

// 获取查询工作表数据
const getSearchWorksheetData = async props => {
  const { formData, recordId, queryConfig = {}, control } = props;
  const { items = [], templates = [], sourceId, moreSort, controlId, id } = queryConfig;
  const currentControl = control || _.find(formData, da => da.controlId === controlId);
  const controls = _.get(templates[0] || {}, 'controls') || [];
  let queryCount = getDefaultCount(currentControl, queryConfig.queryCount);
  if (templates.length > 0 && controls.length > 0) {
    const filterControls = getFilter({
      control: {
        ...currentControl,
        advancedSetting: { filters: JSON.stringify(items) },
        recordId,
        relationControls: controls,
      },
      formData,
      ignoreEmptyRule: true,
    });
    let params = {
      filterControls: filterControls === false ? [] : filterControls,
      pageIndex: 1,
      searchType: 1,
      status: 1,
      getType: 7,
      worksheetId: sourceId,
      pageSize: isSheetDisplay(currentControl) || currentControl.type === 34 ? queryCount : 1,
      id,
      getAllControls: true,
      sortControls: moreSort,
      ...(_.get(window, 'shareState.shareId') ? { relationWorksheetId: queryConfig.worksheetId } : {}),
    };
    if (window.isPublicWorksheet) {
      params.formId = window.publicWorksheetShareId;
    }

    const resultData = await sheetAjax.getFilterRowsByQueryDefault(params);

    if (_.get(resultData, 'resultCode') === 1) {
      let result = resultData.data || [];
      // 查询多条时不赋值
      if (canSearchMore(currentControl) && resultData.count > 1 && (queryConfig || {}).moreType === 1) {
        result = false;
      }
      return result;
    } else {
      return false;
    }
  }
  return false;
};

const getSubListData = async props => {
  const listResult = await sheetAjax.getRowRelationRows({
    ...props,
    pageIndex: 1,
  });
  return listResult.resultCode === 1 ? listResult.data : [];
};

const getRelateSearchResult = (control, searchResult, isMix) => {
  let newValue = [];
  if (isMix) {
    newValue = _.isEmpty(searchResult)
      ? []
      : (searchResult || []).map(itemResult => {
          return {
            isNew: true,
            isWorksheetQueryFill: _.get(control.advancedSetting || {}, 'showtype') === '1',
            sourcevalue: itemResult.sourcevalue,
            row: JSON.parse(itemResult.sourcevalue),
            type: 8,
            sid: itemResult.rowid || itemResult.sid,
            name: itemResult.name,
          };
        });
  } else {
    const titleControl = _.find(_.get(control, 'relationControls'), i => i.attribute === 1);
    newValue = (searchResult || []).map(itemResult => {
      const nameValue = titleControl ? itemResult[titleControl.controlId] : undefined;
      return {
        isNew: true,
        isWorksheetQueryFill: _.get(control.advancedSetting || {}, 'showtype') === '1',
        sourcevalue: JSON.stringify(itemResult),
        row: itemResult,
        type: 8,
        sid: itemResult.rowid,
        name: getCurrentValue(titleControl, nameValue, { type: 2 }),
      };
    });
  }

  if (_.isEmpty(newValue) && _.includes([29], control.type)) {
    if (browserIsMobile()) return JSON.stringify(newValue);
    return 'deleteRowIds: all';
  } else {
    return JSON.stringify(newValue);
  }
};

// 查询工作表赋值
const handleUpdateSearchResult = async props => {
  const { handleChange, queryConfig = {}, searchResult = [], formData = [], isMix, control } = props;
  const { configs = [], templates = {} } = queryConfig;
  const controls = _.get(templates[0] || {}, 'controls') || [];

  if (control && _.includes([29, 35], control.type)) {
    const newVal = getRelateSearchResult(control, searchResult);
    handleChange(newVal, control.controlId, false);
    return true;
  }
  try {
    await Promise.all(
      configs.map(async item => {
        const { pid, cid, subCid } = item;
        const currentControl = control || _.find(formData, i => i.controlId === cid);
        if (!pid && currentControl) {
          // 关联记录赋值
          if (_.includes([29, 35], currentControl.type)) {
            const newVal = getRelateSearchResult(
              currentControl,
              safeParse(_.get(searchResult[0], [cid]) || '[]'),
              isMix,
            );
            handleChange(newVal, currentControl.controlId, false);
            // 子表赋值
          } else if (currentControl.type === 34) {
            const subMapConfigs = isMix
              ? configs.filter(i => i.cid === currentControl.controlId || i.pid === currentControl.controlId)
              : configs;
            const subResult = isMix
              ? await getSubListData({
                  rowId: _.get(searchResult, '0.rowid'),
                  worksheetId: _.get(searchResult, '0.wsid'),
                  controlId: subCid,
                  pageSize: (searchResult[0] || {}).subCid,
                })
              : searchResult;

            const newValue = [];
            if (subResult.length) {
              subResult.forEach(item => {
                let row = {};
                subMapConfigs.map(({ cid = '', subCid = '' }) => {
                  const subItemControl = _.find(currentControl.relationControls || [], re => re.controlId === cid);
                  if (subItemControl) {
                    if (subCid === 'rowid') {
                      row[cid] =
                        subItemControl.type === 29
                          ? JSON.stringify([
                              {
                                sourcevalue: JSON.stringify(item),
                                row: item,
                                type: 8,
                                sid: item.rowid,
                              },
                            ])
                          : item.rowid;
                    } else {
                      row[cid] = formatSearchResultValue({
                        targetControl: _.find(controls, s => s.controlId === subCid),
                        currentControl: subItemControl,
                        controls,
                        searchResult: item[subCid] || '',
                      });
                    }
                  }
                });
                //映射明细所有字段值不为空
                if (_.some(Object.values(row), i => !_.isUndefined(i))) {
                  newValue.push({
                    ...row,
                    rowid: `temprowid-${uuidv4()}`,
                    allowedit: true,
                    addTime: new Date().getTime(),
                  });
                }
              });
            }
            handleChange(
              {
                action: 'clearAndSet',
                isDefault: true,
                rows: newValue,
                fireWhenLoaded: true,
              },
              currentControl.controlId,
              false,
            );
          } else {
            const itemVal = formatSearchResultValue({
              targetControl: _.find(controls, c => c.controlId === subCid),
              currentControl: currentControl,
              controls,
              searchResult: (searchResult[0] || {})[subCid],
            });
            handleChange(itemVal, currentControl.controlId, false);
          }
        }
      }),
    );
    return true;
  } catch (error) {
    return true;
  }
};

// 获取查询工作表结果
const getSearchWorksheetResult = async props => {
  const { advancedSetting = {}, searchConfig = [], formData, recordId } = props;
  const { id } = safeParse(advancedSetting.dynamicsrc || '{}');
  const currentSearchConfig = _.find(searchConfig, s => s.id === id) || {};
  const { items = [], templates = [], sourceId, moreSort, resultType, controlId } = currentSearchConfig;
  const controls = _.get(templates[0] || {}, 'controls') || [];
  if (templates.length > 0 && controls.length > 0) {
    const filterControls = getFilter({
      control: {
        ..._.find(formData, da => da.controlId === controlId),
        advancedSetting: { filters: JSON.stringify(items) },
        recordId,
        relationControls: controls,
      },
      formData,
      ignoreEmptyRule: true,
    });
    let params = {
      filterControls: filterControls === false ? [] : filterControls,
      pageIndex: 1,
      searchType: 1,
      status: 1,
      getType: 7,
      worksheetId: sourceId,
      pageSize: 10,
      id,
      getAllControls: true,
      sortControls: moreSort,
      ...(_.get(window, 'shareState.shareId') ? { relationWorksheetId: currentSearchConfig.worksheetId } : {}),
    };
    if (window.isPublicWorksheet) {
      params.formId = window.publicWorksheetShareId;
    }

    const resultData = await sheetAjax.getFilterRowsByQueryDefault(params);

    if (_.get(resultData, 'resultCode') === 1) {
      const dataCount = resultData.count || 0;
      let searchConfigResult = false;
      // 一条
      if (resultType === 1) {
        searchConfigResult = dataCount === 1;
      } else if (resultType === 2) {
        searchConfigResult = dataCount > 1;
      } else if (resultType === 3) {
        searchConfigResult = !dataCount;
      } else {
        searchConfigResult = !!dataCount;
      }
      return searchConfigResult;
    } else {
      return false;
    }
  }
  return false;
};

// 创建记录
const createRecord = async props => {
  const { actionItems = [], advancedSetting = {}, projectId } = props;

  const receiveControls = [];

  const sheetData = await sheetAjax.getWorksheetInfo({ worksheetId: advancedSetting.sheetId, getTemplate: true });

  const controls = _.get(sheetData, 'template.controls') || [];

  actionItems.map(item => {
    const control = _.find(controls, f => f.controlId === item.controlId);
    if (control) {
      const formatControl = formatControlToServer(
        { ...control, value: getDynamicData(props, { ...control, advancedSetting: { defsource: item.value } }) },
        { isNewRecord: true },
      );
      receiveControls.push(formatControl);
    }
  });

  let para = {
    projectId,
    appId: advancedSetting.appId,
    worksheetId: advancedSetting.sheetId,
    rowStatus: 1,
    pushUniqueId: md.global.Config.pushUniqueId,
    receiveControls: receiveControls,
  };
  sheetAjax.addWorksheetRow(para).then(res => {
    if (res.resultCode === 1) {
      alert(_l('创建成功'));
    }
  });
};

// api查询
const handleSearchApi = async props => {
  const {
    advancedSetting = {},
    dataSource,
    formData,
    projectId,
    worksheetId,
    appId,
    controlId,
    recordId,
    actionType,
  } = props;
  const requestMap = safeParse(advancedSetting.requestmap || '[]');
  const apiFormData = formData.concat([{ controlId: 'rowid', value: recordId }]);
  const paramsData = getParamsByConfigs(recordId, requestMap, apiFormData);

  let params = {
    data: !requestMap.length || _.isEmpty(paramsData) ? '' : paramsData,
    projectId,
    controlId,
    workSheetId: worksheetId,
    apkId: appId,
    apiTemplateId: dataSource,
    apiEventId: advancedSetting.apiEventId,
    authId: advancedSetting.authaccount,
    actionType,
  };

  if (window.isPublicWorksheet) {
    params.formId = window.publicWorksheetShareId;
  }

  const apiData = await sheetAjax.excuteApiQuery(params);

  if (apiData.code === 20008) {
    upgradeVersionDialog({
      projectId,
      okText: _l('立即充值'),
      hint: _l('余额不足，请联系管理员充值'),
      explainText: <div></div>,
      onOk: () => {
        location.href = `/admin/valueaddservice/${projectId}`;
      },
    });
    return;
  }

  if (apiData.message) {
    alert(apiData.message, 3);
    return;
  }
  return apiData.apiQueryData || {};
};

// 判断筛选条件
const checkFiltersAvailable = async props => {
  const { filters = [], recordId, formData } = props;
  let result = [];

  const currentSpliceType = _.get(filters, [0, 'spliceType']);

  for (const f of filters) {
    const { valueType, filterItems = [], advancedSetting = {}, dataSource } = f;

    switch (valueType) {
      // 字段值
      case FILTER_VALUE_ENUM.CONTROL_VALUE:
        const { isAvailable } = checkValueAvailable({ filters: filterItems }, formData, recordId);
        result.push(isAvailable);
        break;
      // 查询工作表
      case FILTER_VALUE_ENUM.SEARCH_WORKSHEET:
        const res = await getSearchWorksheetResult({ ...props, advancedSetting });
        result.push(res);
        break;
      // api查询
      // case FILTER_VALUE_ENUM.API:
      //   // apiRes, 为判断提供数据源;
      //   const apiRes = await handleSearchApi({ ...props, advancedSetting, dataSource });
      //   const apiResult = checkValueAvailable({ filters: filterItems }, formData, recordId);
      //   result.push(apiResult.isAvailable);
      //   break;
      // 自定义函数
      case FILTER_VALUE_ENUM.CUSTOM_FUN:
        const funResult = calcDefaultValueFunction({
          fnControl: { ...props, advancedSetting },
          formData,
          forceSyncRun: true,
        });
        result.push(funResult);
        break;
    }
  }

  if (currentSpliceType === SPLICE_TYPE_ENUM.AND) {
    return _.every(result, r => !!r);
  }

  return _.some(result, r => !!r);
};

// 成立则执行一下动作
const triggerCustomActions = async props => {
  const {
    actions = [],
    formData,
    recordId,
    worksheetId,
    searchConfig = [],
    setRenderData = () => {},
    handleChange = () => {},
    setErrorItems = () => {},
    handleActiveTab = () => {},
  } = props;
  let completeActionsCount = 0;

  for (const a of actions) {
    const { actionType, actionItems = [], message = '', advancedSetting = {}, dataSource } = a;

    switch (actionType) {
      // 显示、隐藏
      case ACTION_VALUE_ENUM.SHOW:
      case ACTION_VALUE_ENUM.HIDE:
      // 可编辑、只读
      case ACTION_VALUE_ENUM.EDIT:
      case ACTION_VALUE_ENUM.READONLY:
        const newRenderData = dealDataPermission({ ...props, actionItems, actionType });
        setRenderData(newRenderData);
        completeActionsCount += 1;
        break;
      // 错误提示
      case ACTION_VALUE_ENUM.ERROR:
        const errorInfos = [];
        actionItems.map((item, index) => {
          const errorControl = _.find(formData, f => f.controlId === item.controlId);
          if (errorControl) {
            const errorMessage = getDynamicData(props, { ...errorControl, advancedSetting: { defsource: item.value } });
            errorInfos.push({
              controlId: item.controlId,
              errorMessage,
              errorType: FORM_ERROR_TYPE.OTHER_ERROR,
              showError: true,
            });
          }
          if (index === actionItems.length - 1) completeActionsCount += 1;
        });
        setErrorItems(errorInfos);
        break;
      // 设置字段值
      case ACTION_VALUE_ENUM.SET_VALUE:
        try {
          await Promise.all(
            actionItems.map(async item => {
              const control = _.find(formData, f => f.controlId === item.controlId);
              if (control) {
                // 已有记录关联列表不变更
                const canNotSet =
                  control.type === 29 && _.includes(['2', '6'], _.get(control, 'advancedSetting.showtype')) && recordId;
                // 查询工作表单独更新
                if (item.type === '2') {
                  const queryId = _.get(safeParse(item.value || '{}'), 'id');
                  const queryConfig = _.find(searchConfig, q => q.id === queryId);
                  const searchResult = await getSearchWorksheetData({ ...props, queryConfig, control });
                  if (!(searchResult === false || canNotSet || props.disabled)) {
                    handleUpdateSearchResult({ ...props, searchResult, queryConfig, control });
                  }
                } else {
                  let value = getDynamicData(props, {
                    ...control,
                    advancedSetting: {
                      // 当前人员需要
                      ..._.omit(control.advancedSetting || {}, ['defaultfunc', 'defsource']),
                      [item.type === '1' ? 'defaultfunc' : 'defsource']: item.value,
                      defaulttype: item.type,
                    },
                  });
                  if (value !== control.value && !canNotSet) {
                    if (control.type === 29) {
                      try {
                        const records = safeParse(value || '[]');
                        if (_.isEmpty(records)) {
                          value = 'deleteRowIds: all';
                        } else {
                          value = JSON.stringify(
                            records.map(record => ({
                              ...record,
                              count: records.length,
                            })),
                          );
                        }
                      } catch (err) {
                        console.log(err);
                      }
                    }
                    if (control.type === 34) {
                      try {
                        const records = safeParse(value || '[]');
                        value = {
                          action: 'clearAndSet',
                          isDefault: true,
                          rows: records,
                          fireWhenLoaded: true,
                        };
                      } catch (err) {
                        console.log(err);
                      }
                    }
                    handleChange(value, item.controlId, control, false);
                  }
                }
              }
            }),
          );
          completeActionsCount += 1;
        } catch (error) {
          completeActionsCount += 1;
        }
        break;
      // 刷新字段值
      case ACTION_VALUE_ENUM.REFRESH_VALUE:
        try {
          if (recordId && _.get(md, 'global.Account.accountId')) {
            await Promise.all(
              actionItems.map(async item => {
                const control = _.find(formData, f => f.controlId === item.controlId);
                if (control) {
                  const refreshResult = await sheetAjax.refreshSummary({
                    worksheetId,
                    rowId: recordId,
                    controlId: item.controlId,
                  });
                  handleChange(refreshResult, item.controlId, control, false);
                }
              }),
            );
          }

          completeActionsCount += 1;
        } catch (error) {
          completeActionsCount += 1;
        }
        break;
      // 调用api、事件封装流程
      case ACTION_VALUE_ENUM.OPERATION_FLOW:
      case ACTION_VALUE_ENUM.API:
        const apiRes = await handleSearchApi({ ...props, advancedSetting, dataSource, actionType });
        handleUpdateApi(
          {
            ...props,
            advancedSetting,
            onChange: (value, cid) => {
              handleChange(
                value,
                cid,
                _.find(formData, f => f.controlId === cid),
                false,
              );
            },
          },
          apiRes,
          true,
        );
        completeActionsCount += 1;
        break;
      // 提示消息
      case ACTION_VALUE_ENUM.MESSAGE:
        const messageInfo = getDynamicData(props, {
          type: 2,
          advancedSetting: { defsource: message },
        });
        const splitMessage = String(messageInfo).substr(0, 50);
        if (splitMessage) {
          alert(splitMessage, Number(advancedSetting.alerttype), undefined, undefined, undefined, { marginTop: 32 });
        }
        completeActionsCount += 1;
        break;
      // 播放声音
      case ACTION_VALUE_ENUM.VOICE:
        const { fileKey, voicefiles } = advancedSetting;
        const voiceFiles = VOICE_FILE_LIST.concat(safeParse(voicefiles, 'array'));
        const curFile = _.find(voiceFiles, v => v.fileKey === fileKey);
        if (fileKey && curFile) {
          let audioSrc = _.get(curFile, 'filePath');
          // 上传的mp3置换url
          if (!Number(fileKey)) {
            audioSrc = await fileAjax.getChatFileUrl({ serverName: curFile.filePath, key: fileKey });
          }
          if (!window.customEventAudioPlayer) {
            const audio = document.createElement('audio');
            window.customEventAudioPlayer = audio;
          }
          window.customEventAudioPlayer.src = audioSrc;
          window.customEventAudioPlayer.play();
          completeActionsCount += 1;
        } else {
          completeActionsCount += 1;
        }
        break;
      // 打开链接
      case ACTION_VALUE_ENUM.LINK:
        const linkInfo = getDynamicData(props, {
          type: 2,
          advancedSetting: { defsource: message },
        });
        if (advancedSetting.opentype === '2') {
          if (/^https?:\/\/.+$/.test(linkInfo)) {
            Dialog.confirm({
              width: 640,
              title: null,
              noFooter: true,
              closable: true,
              children: (
                <iframe
                  width={640}
                  height={600}
                  frameborder="0"
                  allowtransparency="true"
                  webkitallowfullscreen="true"
                  mozallowfullscreen="true"
                  allowfullscreen="true"
                  src={linkInfo}
                />
              ),
            });
          }
        } else {
          window.open(linkInfo);
        }
        break;
      // 创建记录
      case ACTION_VALUE_ENUM.CREATE:
        createRecord({ ...props, actionItems, advancedSetting });
        break;
      case ACTION_VALUE_ENUM.ACTIVATE_TAB:
        const id = _.get(actionItems, '0.controlId');
        handleActiveTab(id);
        completeActionsCount += 1;
        break;
      case ACTION_VALUE_ENUM.SEARCH_WORKSHEET:
        const queryId = _.get(safeParse(advancedSetting.dynamicsrc || '{}'), 'id');
        const queryConfig = _.find(searchConfig, q => q.id === queryId);
        const searchResult = await getSearchWorksheetData({ ...props, queryConfig });
        if (searchResult !== false) {
          const isComplete = await handleUpdateSearchResult({ ...props, searchResult, queryConfig, isMix: true });
          if (isComplete) completeActionsCount += 1;
        } else {
          completeActionsCount += 1;
        }
        break;
    }
  }

  return completeActionsCount;
};

/**
 * 执行自定义事件
 * triggerType: 当前触发执行的事件类型
 */
export const dealCustomEvent = props => {
  const { triggerType, renderData = [], checkEventComplete } = props;
  const customEvent = safeParse(_.get(props, 'advancedSetting.custom_event'), 'array');

  // 以下情况不生效
  if (
    _.get(window, 'shareState.isPublicRecord') ||
    _.get(window, 'shareState.isPublicView') ||
    _.get(window, 'shareState.isPublicPage') ||
    _.get(window, 'shareState.isPublicQuery') ||
    _.get(window, 'shareState.isPublicPrint')
  )
    return;

  // 避免提交、保存等操作组件卸载事件触发隐藏事件
  if (
    triggerType === ADD_EVENT_ENUM.HIDE &&
    _.get(
      _.find(renderData, r => r.controlId === props.controlId),
      'fieldPermission.[0]',
    ) === '1'
  ) {
    return;
  }

  const isBlurEvent = _.includes([ADD_EVENT_ENUM.BLUR, ADD_EVENT_ENUM.CHANGE], triggerType);

  customEvent.forEach(async item => {
    const { eventType, eventActions = [], eventId } = item;
    if (eventType === triggerType) {
      // 失焦事件才检查事件是否完成，事件开始执行
      isBlurEvent && checkEventComplete({ [eventId]: true });

      for (const e of eventActions) {
        const { filters = [], actions = [] } = e;

        const filterResult = await checkFiltersAvailable({ ...props, filters });
        if (_.isEmpty(filters) || filterResult) {
          const completeActionsCount = await triggerCustomActions({ ...props, actions });
          // 执行完成
          if (completeActionsCount === actions.length && isBlurEvent) {
            checkEventComplete({ [eventId]: false });
          }
          return;
        }
      }
      // 没有事件执行
      isBlurEvent && checkEventComplete({ [eventId]: false });
    }
  });
};
