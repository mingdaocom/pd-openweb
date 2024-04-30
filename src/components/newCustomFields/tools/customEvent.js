import React from 'react';
import sheetAjax from 'src/api/worksheet';
import { checkValueAvailable, updateDataPermission } from './filterFn';
import { getDynamicValue } from './DataFormat.js';
import { getParamsByConfigs } from '../widgets/Search/util.js';
import { upgradeVersionDialog } from 'src/util';
import { Dialog } from 'ming-ui';
import { handleUpdateApi } from '../widgets/Search/util.js';
import { formatControlToServer } from './utils.js';
import { FORM_ERROR_TYPE } from './config.js';
import {
  FILTER_VALUE_ENUM,
  ACTION_VALUE_ENUM,
  SPLICE_TYPE_ENUM,
} from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';
import execValueFunction from 'src/pages/widgetConfig/widgetSetting/components/FunctionEditorDialog/Func/exec';

// 显隐、只读编辑等处理
const dealDataPermission = props => {
  const { actionItems = [], actionType, formData = [], checkRuleValidator } = props;

  formData.forEach(item => {
    // 有锁定
    if (actionType === ACTION_VALUE_ENUM.READONLY && _.some(actionItems, a => a.isAll)) {
      item.disabled = true;
    } else {
      actionItems.map(i => {
        const { controlId, childControlIds = [] } = i || {};
        const type = Number(actionType);
        if (controlId === _.get(item, 'controlId')) {
          if (_.isEmpty(childControlIds)) {
            updateDataPermission({
              attrs: [type],
              it: item,
              checkRuleValidator,
            });
          } else {
            childControlIds.map(childId => {
              const childControl = _.find(_.get(item, 'relationControls') || [], re => re.controlId === childId);
              if (childControl) {
                updateDataPermission({
                  attrs: [type],
                  it: childControl,
                  checkRuleValidator,
                  item,
                });
              }
            });
          }
        }
      });
    }
    // item.defaultState = {
    //   ...row.defaultState,
    //   ..._.pick(row, ['fieldPermission', 'showControls']),
    // };
  });

  return formData;
};

// 获取默认值
const getDynamicData = ({ formData, embedData, masterData }, control) => {
  return getDynamicValue(formData, control, masterData, embedData);
};

// 获取查询工作表结果
const getSearchWorksheetResult = async props => {
  const { advancedSetting = {}, searchConfig = [], formData, recordId } = props;
  const { id } = safeParse(advancedSetting.dynamicsrc || '{}');
  const currentSearchConfig = _.find(searchConfig, s => s.id === id) || {};
  const { items = [], templates = [], sourceId, moreSort, resultType } = currentSearchConfig;
  const controls = _.get(templates[0] || {}, 'controls') || [];
  if (templates.length > 0 && controls.length > 0) {
    let params = {
      filterControls: formatFiltersValue(items, formData, recordId),
      pageIndex: 1,
      searchType: 1,
      status: 1,
      getType: 7,
      worksheetId: sourceId,
      pageSize: 10,
      id,
      getAllControls: true,
      sortControls: moreSort,
    };
    if (window.isPublicWorksheet) {
      params.formId = window.publicWorksheetShareId;
    }

    const resultData = await sheetAjax.getFilterRowsByQueryDefault(params);

    if (_.get(resultData, 'resultCode') === 1) {
      const dataCount = (resultData.data || []).length;
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
};

// 创建记录
const createRecord = props => {
  const { actionItems = [], advancedSetting = {}, formData = [], projectId } = props;

  const receiveControls = [];
  actionItems.map(item => {
    const control = _.find(formData, f => f.controlId === item.controlId);
    if (control) {
      const formatControl = formatControlToServer(
        { ...item, value: getDynamicData(props, { ...control, advancedSetting: { defsource: item.value } }) },
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
  sheetAjax.AddWorksheetRow(para).then(res => {
    if (res.resultCode === 1) {
      alert(_l('创建成功'));
    }
  });
};

// api查询
const handleSearchApi = async props => {
  const { advancedSetting = {}, dataSource, formData, projectId, worksheetId, appId, controlId } = props;
  const requestMap = safeParse(advancedSetting.requestmap || '[]');
  const paramsData = getParamsByConfigs(requestMap, formData);

  let params = {
    data: !requestMap.length || _.isEmpty(paramsData) ? '' : paramsData,
    projectId,
    controlId,
    workSheetId: worksheetId,
    apkId: appId,
    apiTemplateId: dataSource,
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
const checkFiltersAvailable = props => {
  const { filters = [], recordId, formData } = props;
  let result = true;

  filters.forEach((f, index) => {
    const { valueType, filterItems = [], advancedSetting = {}, dataSource } = f;

    const getCheckResult = curResult => {
      if (!index) {
        result = curResult;
        return result;
      }
      return f.spliceType === SPLICE_TYPE_ENUM.OR ? result || curResult : result && curResult;
    };

    switch (valueType) {
      // 字段值
      case FILTER_VALUE_ENUM.CONTROL_VALUE:
        const { isAvailable } = checkValueAvailable({ filters: filterItems }, formData, recordId);
        result = getCheckResult(isAvailable);
        return;
      // 查询工作表
      case FILTER_VALUE_ENUM.SEARCH_WORKSHEET:
        const searchConfigResult = getSearchWorksheetResult({ ...props, advancedSetting });
        result = getCheckResult(searchConfigResult);
        return;
      // api查询
      case FILTER_VALUE_ENUM.API:
        handleSearchApi({ ...props, advancedSetting, dataSource }).then(res => {
          // apiQueryData转成apiData,为判断提供数据源
          const apiResult = checkValueAvailable({ filters: filterItems }, formData, recordId);
          result = getCheckResult(apiResult.isAvailable);
        });
        return;
      // 自定义函数
      case FILTER_VALUE_ENUM.CUSTOM_FUN:
        const funResult = execValueFunction({ ...props, advancedSetting }, formData);
        result = getCheckResult(funResult);
        return;
    }
  });

  return result;
};

// 成立则执行一下动作
const triggerCustomActions = props => {
  const {
    actions = [],
    formData,
    recordId,
    worksheetId,
    setRenderData = () => {},
    handleChange = () => {},
    setErrorItems = () => {},
  } = props;

  actions.forEach(a => {
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
        return;
      // 错误提示
      case ACTION_VALUE_ENUM.ERROR:
        const errorInfos = [];
        actionItems.map(item => {
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
        });
        setErrorItems(errorInfos);
        return;
      // 设置字段值
      case ACTION_VALUE_ENUM.SET_VALUE:
        actionItems.forEach(item => {
          const control = _.find(formData, f => f.controlId === item.controlId);
          if (control) {
            const value = getDynamicData(props, {
              ...control,
              advancedSetting: { defsource: item.value },
            });
            handleChange(value, item.controlId, control, false);
          }
        });
        return;
      // 刷新字段值
      case ACTION_VALUE_ENUM.REFRESH_VALUE:
        if (!recordId) return;
        actionItems.forEach(item => {
          const control = _.find(formData, f => f.controlId === item.controlId);
          if (control) {
            sheetAjax.refreshSummary({ worksheetId, rowId: recordId, controlId: item.controlId }).then(res => {
              handleChange(res, item.controlId, control, false);
            });
          }
        });
        return;
      // 调用api
      case ACTION_VALUE_ENUM.API:
        handleSearchApi({ ...props, advancedSetting, dataSource }).then(res => {
          handleUpdateApi({ ...props, onChange: handleChange }, res, true);
        });
        return;
      // 提示消息
      case ACTION_VALUE_ENUM.MESSAGE:
        const messageInfo = getDynamicData(props, {
          type: 2,
          advancedSetting: { defsource: message },
        });
        alert(messageInfo, Number(advancedSetting.alerttype));
        return;
      // 播放声音
      case ACTION_VALUE_ENUM.VOICE:
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
        return;
      // 创建记录
      case ACTION_VALUE_ENUM.CREATE:
        createRecord({ ...props, actionItems, advancedSetting });
        return;
    }
  });
};

/**
 * 执行自定义事件
 * triggerType: 当前触发执行的事件类型
 */
export const dealCustomEvent = props => {
  const { triggerType } = props;
  const customEvent = safeParse(_.get(props, 'advancedSetting.custom_event'), 'array');

  customEvent.forEach(item => {
    const { eventType, eventActions = [] } = item;
    if (eventType === triggerType) {
      for (const e of eventActions) {
        const { filters = [], actions = [] } = e;

        if (checkFiltersAvailable({ ...props, filters })) {
          triggerCustomActions({ ...props, actions });
          return;
        }
      }
    }
  });
};
