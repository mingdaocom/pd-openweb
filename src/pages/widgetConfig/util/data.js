import React from 'react';
import { CAN_NOT_AS_TEXT_GROUP } from '../config';
import { DRAG_MODE, WHOLE_SIZE } from '../config/Drag';
import { navigateTo } from 'src/router/navigateTo';
import sheetAjax from 'src/api/worksheet';
import cx from 'classnames';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import update from 'immutability-helper';
import _, { includes, get, isEmpty, omit, findIndex, filter, find, head, last, flatten } from 'lodash';
import { canAsUniqueWidget, getAdvanceSetting, handleAdvancedSettingChange, isExceedMaxControlLimit } from './setting';
import { insertControlInSameLine, batchRemoveItems } from './drag';
import {
  getControlByControlId,
  adjustControlSize,
  putControlByOrder,
  getBoundRowByTab,
  fixedBottomWidgets,
  notInsetSectionTab,
  isTabSheetList,
  checkWidgetMaxNumErr,
} from '.';
import { getPathById, isHaveGap } from './widgets';
import { getFeatureStatus } from 'src/util';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { ControlTag } from '../styled';
import { Tooltip, Dialog, Support } from 'ming-ui';
import { v4 as uuidv4 } from 'uuid';
import { ALL_SYS } from '../config/widget';
import homeAppApi from 'src/api/homeApp';

// 获取动态默认值
export const getDynamicDefaultValue = data => {
  const value = _.get(data, ['advancedSetting', 'defsource']);
  try {
    const parsedValue = value && JSON.parse(value);
    return parsedValue;
  } catch (error) {
    console.log(error);
  }
};

export const getMsgByCode = ({ code, data, controls }) => {
  if (code === 1) {
    alert(_l('保存成功'));
    return '';
  }
  let errorText = _l('操作失败，请稍后重试');
  switch (code) {
    case 2:
      errorText = data === 20 ? _l('公式验证失败') : _l('输入验证信息失败');
      break;
    case 3:
      errorText = _l('指定参数的数据不存在');
      break;
    case 7:
      errorText = _l('权限不够');
      break;
    case 8:
      errorText = _l('请求超时');
      break;
    case 10:
      errorText = _l('数据异常，请勿多窗口编辑或者多人同时编辑，请刷新浏览器重试！');
      break;
    case 16:
      const currentItem = _.find(controls, c => c.alias === data);
      errorText = _l('%0别名重复', _.get(currentItem, 'controlName'));
      break;
    default:
      break;
  }
  if (code === 16) {
    alert({
      msg: (
        <span>
          {errorText}
          <Support
            type={3}
            href="https://help.mingdao.com/worksheet/field-property/#syestem-field-alias"
            text={<span className="Font14 Bold">{_l('查看')}</span>}
          />
        </span>
      ),
      type: 2,
    });
  } else {
    alert(errorText, 2);
  }
  return errorText;
};

export function handleExtremeValue(data) {
  const { advancedSetting = {}, type } = data;
  const { checkrange = '0', min = '', max = '' } = advancedSetting;
  const transferValue = value => (value ? value.toString() : '').replace(/,/g, '');
  const formateMin = parseFloat(transferValue(min));
  const formateMax = parseFloat(transferValue(max));
  // 如果最大最小值都没配 则取消勾选
  if (min === '' && max === '' && checkrange === '1') {
    return update(data, {
      advancedSetting: {
        $set: { ...advancedSetting, checkrange: '0', min: '', max: '' },
      },
    });
  }
  if (isNaN(formateMin) && isNaN(formateMax)) {
    return update(data, {
      advancedSetting: { $set: { ...advancedSetting, min: '', max: '' } },
    });
  }

  if (formateMax < formateMin) {
    return update(data, {
      advancedSetting: { $set: { ...advancedSetting, min: '', max: '' } },
    });
  }
  return data;
}
export function dealRelateSheetDefaultValue(data) {
  const dynamicValue = getDynamicDefaultValue(data);
  if (!dynamicValue) return data;
  const newValue = dynamicValue.map(value => {
    return update(value, {
      $apply: item => {
        const { staticValue } = item;
        if (!staticValue) return item;
        try {
          const parsedValue = JSON.parse(staticValue);
          return {
            ..._.omit(item, 'relateSheetName'),
            staticValue: JSON.stringify(
              parsedValue.map(v => {
                return _.get(safeParse(v), 'rowid') || v;
              }),
            ),
          };
        } catch (error) {
          return data;
        }
      },
    });
  });
  return update(data, {
    advancedSetting: {
      $apply: item => ({ ...item, defsource: JSON.stringify(newValue) }),
    },
  });
}

const use_ids = {
  26: 'accountId',
  27: 'departmentId',
  48: 'organizeId',
};

export function dealUserId(data, key = 'defsource') {
  const value = _.get(data, ['advancedSetting', key]) || '[]';
  let dataType = use_ids[data.type];
  try {
    const settings = value && JSON.parse(value);
    if (_.isEmpty(settings)) return data;
    const newValue = settings.map(setting =>
      update(setting, {
        $apply: item => {
          const { staticValue } = item;
          if (item.type && key === 'chooserange') {
            const chooseId = item.type === 1 ? 26 : item.type === 2 ? 27 : 48;
            dataType = use_ids[chooseId];
          }
          if (staticValue && typeof staticValue === 'string') {
            const accountId = safeParse(staticValue || '{}')[dataType];
            return { ...item, staticValue: accountId || staticValue };
          }
          if (_.get(staticValue, [dataType])) return { ...item, staticValue: staticValue[dataType] };
          return item;
        },
      }),
    );
    return update(data, {
      advancedSetting: {
        $apply: item => ({ ...item, [key]: JSON.stringify(newValue) }),
      },
    });
  } catch (error) {
    console.log(error);
  }
  return data;
}

export function dealCascaderId(data) {
  const value = _.get(data, ['advancedSetting', 'topfilters']) || '[]';
  try {
    const settings = value && JSON.parse(value);
    if (_.isEmpty(settings)) return data;
    const newValue = settings.map(setting =>
      update(setting, {
        $apply: item => {
          return safeParse(item || '{}')['id'] || item;
        },
      }),
    );
    return update(data, {
      advancedSetting: {
        $apply: item => ({ ...item, topfilters: JSON.stringify(newValue) }),
      },
    });
  } catch (error) {
    console.log(error);
  }
  return data;
}

/**
 * 处理 成员 部门 地区 他表字段 级联 组织角色 这几个类型的字段 values 处理成 [id, id]
 */
export function handleCondition(condition, isRelate) {
  // 关联记录(动态值只能选择当前记录字段)特殊处理 rcid置空
  if (_.isBoolean(isRelate) && isRelate && !isEmpty(condition.dynamicSource)) {
    condition.dynamicSource.forEach(item => (item.rcid = ''));
  }
  if (_.includes([19, 23, 24, 26, 27, 29, 35, 48], condition.dataType) && condition.values) {
    return {
      ...condition,
      values: condition.values.map(value => {
        try {
          const da = JSON.parse(value);
          if (typeof da === 'object') {
            return da.id;
          } else {
            return value;
          }
        } catch (e) {
          return value;
        }
      }),
    };
  } else {
    return condition;
  }
}
/**
 * 处理关联表叠加筛选条件里的 成员 部门 地区 他表字段 级联 这几个类型的字段 values 处理成 [id, id]
 */
export function handleFilters(data, isRelate = false, filterKey) {
  const keyName = filterKey ? filterKey : 'filters';
  const filters = getAdvanceSetting(data, [keyName]);
  try {
    let filtersValue = [];
    if (filters.some(item => item.groupFilters)) {
      filtersValue = filters.map(f => {
        return {
          ...f,
          groupFilters: (f.groupFilters || []).map(i => handleCondition(i, isRelate)),
        };
      });
    } else {
      filtersValue = filters.map(i => handleCondition(i, isRelate));
    }

    return handleAdvancedSettingChange(data, { [keyName]: JSON.stringify(filtersValue) });
  } catch (err) {
    return data;
  }
}

const canSelectedControls = (controls, data) => {
  return controls.filter(item => item.controlId !== data.controlId && !includes(CAN_NOT_AS_TEXT_GROUP, item.type));
};

const isSingleRelateSheet = data => data.type === 29 && data.enumDefault === 1;

// 获取文本组合可选取的控件
export const getConcatenateControls = (controls, data) => {
  controls = canSelectedControls(controls, data);
  return controls.filter(item => {
    if (isSingleRelateSheet(item)) return true;
    let type = item.type;
    // 日期公式且配置为距离今天的天数不可选
    if (type === 38 && [3].includes(item.enumDefault)) return false;
    if (type === 30 || isSingleRelateSheet(item)) {
      const sourceControlType = get(item, ['sourceControl', 'type']);
      if (sourceControlType) type = sourceControlType;
    }
    // 关联记录和他表字段的sourceControl仍然是关联记录和他表字段的不能选
    return !includes([29, 30].concat(CAN_NOT_AS_TEXT_GROUP), type);
  });
};
// 获取数值公式可用控件
export const getFormulaControls = (controls, data) => {
  controls = canSelectedControls(controls, data);
  return controls.filter(item => {
    let type = item.type;
    let enumDefault2 = item.enumDefault2;
    let enumDefault = item.enumDefault;
    if (type === 30 || isSingleRelateSheet(item)) {
      const sourceControl = get(item, 'sourceControl') || {};

      if (includes([9, 10, 11], sourceControl.type)) return false;

      if (sourceControl.type) {
        type = sourceControl.type;
        enumDefault = sourceControl.enumDefault;
        enumDefault2 = sourceControl.enumDefault2;
      }
    }
    return (
      includes([6, 8, 28, 31, 46], type) ||
      // 赋分值选项
      (includes([9, 10, 11], type) && enumDefault === 1) ||
      (type === 38 && includes([1], enumDefault)) ||
      // 非日期汇总
      (type === 37 && !includes([15, 16], enumDefault2)) ||
      // 公式函数-数值
      (type === 53 && enumDefault2 === 6)
    );
  });
};

// 获取大写金额可用控件
export const getMoneyCnControls = (controls, data) => {
  controls = canSelectedControls(controls, data);
  return controls.filter(item => {
    let type = item.type;
    let enumDefault2 = item.enumDefault2;
    if (type === 30 || isSingleRelateSheet(item)) {
      const sourceControl = get(item, 'sourceControl') || {};
      if (sourceControl.type) {
        type = sourceControl.type;
        enumDefault2 = sourceControl.enumDefault2;
      }
    }
    return (
      includes([8, 31], type) ||
      // 非日期汇总
      (type === 37 && !includes([15, 16], enumDefault2))
    );
  });
};

// 获取控件的文本呈现值
export function formatColumnToText(column, numberOnly, noMask, options = {}) {
  return renderCellText(column, {
    noUnit: numberOnly,
    noSplit: numberOnly,
    noMask: noMask,
    doNotHandleTimeZone: options.doNotHandleTimeZone,
  });
}

// 通过id 获取控件的值
export function getControlValue(id, allControls, worksheetData) {
  return getControlTextValue(id, allControls, worksheetData, true);
}

// 通过id 获取控件的文本值
export function getControlTextValue(id, allControls, worksheetData, numberOnly) {
  const control = getControlByControlId(allControls, id);
  if (!control || _.isEmpty(worksheetData)) {
    return '';
  }

  const { type, controlId } = control;
  if (_.includes([6, 8], type)) {
    return worksheetData[controlId];
  }
  if (controlId) {
    return (
      formatColumnToText(
        _.assign({}, control, {
          value: worksheetData[controlId],
        }),
        numberOnly,
      ) || ''
    );
  } else {
    return '';
  }
}

/**
 * createWorksheetColumnTag 工作表创建字段标签
 * @param  {string} id 字段 controlId
 * @param  {object} options 配置
 * @return {element} 返回一个dom元素
 */
export function createWorksheetColumnTag(id, options) {
  const { allControls, worksheetData, errorCallback, mode, isLast } = options;
  const control = getControlByControlId(allControls, id);
  const node = document.createElement('div');
  // const value = getControlTextValue(id, allControls, worksheetData, true) || _l('空');
  node.classList.add('columnTag');
  if (!control) {
    node.classList.add('deleted');
    if (_.isFunction(errorCallback)) {
      errorCallback(1);
    }
  }
  if (mode === 3 && !isLast) {
    node.classList.add('onlytag');
  }
  node.innerHTML = !isEmpty(control)
    ? `
    <div class="columnName">${control.controlName}</div>
  `
    : `
    <div class="columnName">${_l('该字段已删除')}</div>
  `;
  return node;
}

export function genControlTag(allControls, id) {
  const control = getControlByControlId(allControls, id);
  const invalid = isEmpty(control);
  const invalidError = control && control.type === 30 && (control.strDefault || '')[0] === '1';
  return (
    <Tooltip text={<span>{_l('ID: %0', id)}</span>} popupPlacement="bottom" disable={!invalid}>
      <ControlTag className={cx({ invalid: invalid || invalidError, Hand: invalid })}>
        {invalid ? _l('字段已删除') : invalidError ? _l('%0(无效类型)', control.controlName) : control.controlName}
      </ControlTag>
    </Tooltip>
  );
}

export function navigateToApp(worksheetId) {
  sheetAjax.getWorksheetInfo({ worksheetId }).then(data => {
    const storage = JSON.parse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${data.appId}`));
    const viewId =
      (
        _.find(
          _.get(storage, 'worksheets') || [],
          item => item.groupId === data.groupId && item.worksheetId === data.worksheetId,
        ) || {}
      ).viewId || '';

    navigateTo(`/app/${data.appId}/${data.groupId}/${data.worksheetId}/${viewId}`);
  });
}

export const navigateToView = (worksheetId, viewId) => {
  homeAppApi.getAppSimpleInfo({ worksheetId }).then(data => {
    const { appId, appSectionId } = data;
    window.open(`/app/${appId}/${appSectionId}/${worksheetId}/${viewId}`);
  });
};

export const navigateToAppItem = worksheetId => {
  homeAppApi.getAppSimpleInfo({ worksheetId }).then(data => {
    const { appId, appSectionId } = data;
    const storage = JSON.parse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${appId}`)) || {};
    const cacheViewId = (
      (storage.worksheets || []).filter(w => w.groupId === appSectionId && w.worksheetId === worksheetId)[0] || {}
    ).viewId;
    if (cacheViewId) {
      navigateTo(`/app/${appId}/${appSectionId}/${worksheetId}/${cacheViewId}`);
    } else {
      navigateTo(`/app/${appId}/${appSectionId}/${worksheetId}`);
    }
  });
};

export const dealControlPos = controls => {
  const sortableControls = controls.reduce((p, c) => {
    return update(p, { $push: [[c]] });
  }, []);
  return _.flatten(sortableControls.map((item, row) => item.map((control, col) => ({ ...control, row, col }))));
};

// 自定义事件保存时处理执行动作内默认值
const dealCusTomEventActions = (actionItems = [], controls = []) => {
  return (actionItems || []).map(item => {
    // 函数、查询不处理，动态值处理
    if (_.includes(['1', '2'], item.type)) return item;
    const currentControl = _.find(controls, c => c.controlId === item.controlId);
    // 默认值处理，成员、部门等取id
    if (currentControl && item.value) {
      // 用户id替换
      if (_.includes([26, 27, 48], currentControl.type)) {
        const dealData = dealUserId({ ...currentControl, advancedSetting: { defsource: item.value } });
        return { ...item, value: _.get(dealData, 'advancedSetting.defsource') };
      }

      if (_.includes([29, 35, 51], currentControl.type)) {
        const dealReData = dealRelateSheetDefaultValue({
          ...currentControl,
          advancedSetting: { defsource: item.value },
        });
        return { ...item, value: _.get(dealReData, 'advancedSetting.defsource') };
      }

      return item;
    } else {
      return item;
    }
  });
};

// 表单保存前校验
export const checkWidgetErrorBeforeSave = (controls = [], originControls = []) => {
  let errorMsg = '';
  let errorNum = 3;
  for (const data of controls) {
    // 自定义事件校验
    const customEvent = getAdvanceSetting(data, 'custom_event') || [];
    if (customEvent.length > 0) {
      const customActionItems = customEvent.map(({ eventActions = [] } = {}) => {
        return _.reduce(
          eventActions,
          (total, cur) => {
            const actionItems = (cur.actions || [])
              .filter(a => _.includes(['5', '12'], a.actionType))
              .map(a => a.actionItems);
            return total.concat(...actionItems);
          },
          [],
        );
      });

      if (_.some(_.flatten(customActionItems), a => !_.find(controls, c => c.controlId === a.controlId))) {
        errorMsg = _l(`%0字段事件配置异常`, data.controlName);
        errorNum = 2;
        break;
      }
    }

    // 选项校验
    if (_.includes([9, 10, 11], data.type) && !data.dataSource) {
      const noDelOptions = (data.options || []).filter(o => !o.isDeleted);
      const uniqOptions = _.uniqBy(noDelOptions, 'value');
      const originOptions =
        _.get(
          _.find(originControls, o => o.controlId === data.controlId),
          'options',
        ) || [];
      const hasChanged = !_.isEqual(
        (data.options || []).map(d => d.value),
        originOptions.map(o => o.value),
      );
      if (noDelOptions.length !== uniqOptions.length && hasChanged) {
        errorMsg = _l('选项字段存在重复选项');
        break;
      }
    }

    // 自定义字段--引用配置校验
    const reference = getAdvanceSetting(data, 'reference') || [];
    if (!_.isEmpty(reference)) {
      if (reference.some(r => !r.name)) {
        errorMsg = _l('变量名不允许为空');
        break;
      }
      if (_.uniqBy(reference, 'name').length !== reference.length) {
        errorMsg = _l('变量名不允许重复');
        break;
      }
    }
  }

  if (errorMsg) {
    alert(errorMsg, errorNum);
    return true;
  }
  return false;
};

// 重置等处理
export const checkWidgetBeforeSave = (controls = [], originControls = [], globalInfo = {}, deep = 0) => {
  controls.map(data => {
    // 自动编号重置
    if (data.type === 33 && !data.controlId.includes('-')) {
      checkAutoIdReset(data, originControls, globalInfo);
    }

    // 游离子表自动编号重置
    if (data.type === 34 && getAdvanceSetting(data, 'detailworksheettype') === 2 && deep === 0) {
      deep = 1;
      const oriControls = _.get(
        _.find(originControls, o => o.controlId === data.controlId),
        'relationControls',
      );
      checkWidgetBeforeSave(data.relationControls, oriControls, {
        appId: globalInfo.appId,
        worksheetId: data.dataSource,
      });
    }
  });
};

const checkAutoIdReset = (data = {}, originControls = [], globalInfo = {}) => {
  const increase = getAdvanceSetting(data, 'increase') || [];
  const originAutoId = _.find(originControls, o => o.controlId === data.controlId);
  const originIncrease = getAdvanceSetting(originAutoId, 'increase') || [];
  const startValueChange =
    _.get(_.find(increase, { type: 1 }), 'start') !== _.get(_.find(originIncrease, { type: 1 }), 'start');
  if (startValueChange && window.auto_id_reset[data.controlId]) {
    sheetAjax.resetControlIncrease({
      ..._.pick(globalInfo, ['appId', 'worksheetId']),
      controlId: data.controlId,
      initNum: 0,
    });
  }
};

export const formatControlsData = (controls = [], fromSub = false) => {
  return controls.map(item => {
    const { type } = item;
    let data = { ...item };

    const isRelate = fromSub ? false : true;

    // 有一批老数据影响了默认值功能，清空掉
    if (_.get(data, 'default') === '[]') {
      data.default = '';
    }

    const chooseRange = getAdvanceSetting(data, 'chooserange') || [];
    if (chooseRange.length) {
      data = dealUserId(data, 'chooserange');
    }

    // 限定输入格式
    const filterRegex = getAdvanceSetting(data, 'filterregex') || [];
    if (filterRegex.length) {
      const newFilterRegex = filterRegex.map(f => {
        if (f.filters) {
          const dealFilters = handleFilters({ advancedSetting: { filters: JSON.stringify(f.filters) } }, isRelate);
          const newFilters = _.get(dealFilters, 'advancedSetting.filters');
          return { ...f, filters: _.isEmpty(newFilters) ? '' : JSON.parse(newFilters) };
        }
        return f;
      });
      data = handleAdvancedSettingChange(data, { filterregex: JSON.stringify(newFilterRegex) });
    }

    // 自定义事件筛选处理
    const customEvent = getAdvanceSetting(data, 'custom_event') || [];
    if (!isEmpty(customEvent)) {
      const newCustomEvent = customEvent.map(c => {
        return {
          ...c,
          eventActions: (c.eventActions || []).map(e => {
            return {
              ...e,
              filters: (e.filters || []).map(f => {
                const newFilterItems = handleFilters(
                  { advancedSetting: { filterItems: JSON.stringify(f.filterItems) } },
                  isRelate,
                  'filterItems',
                );
                return { ...f, filterItems: getAdvanceSetting(newFilterItems, 'filterItems') };
              }),
              actions: (e.actions || []).map(a => {
                // 只有设置值、创建等动作能配默认值
                return _.includes(['5', '12'], a.actionType)
                  ? { ...a, actionItems: dealCusTomEventActions(a.actionItems, controls) }
                  : a;
              }),
            };
          }),
        };
      });
      data = handleAdvancedSettingChange(data, { custom_event: JSON.stringify(newCustomEvent) });
    }

    // 子表控件递归处理其中的字段
    if (type === 34) {
      let uniqueControls = getAdvanceSetting(data, 'uniquecontrols') || [];
      // 检查一遍本记录不重复字段是否都符合要求，不符合清空
      if (!fromSub && uniqueControls.length > 0) {
        const globalUniqueControls = (data.relationControls || []).filter(i => i.unique).map(i => i.controlId);
        uniqueControls = uniqueControls.filter(u => {
          const curItem = _.find(data.relationControls || [], c => c.controlId === u);
          return (
            !!curItem &&
            canAsUniqueWidget(curItem) &&
            !_.includes(globalUniqueControls, u) &&
            _.includes(data.showControls || [], u)
          );
        });
      }
      return {
        ...data,
        advancedSetting: { ...data.advancedSetting, uniquecontrols: JSON.stringify(uniqueControls) },
        relationControls: formatControlsData(data.relationControls, true),
      };
    }

    // 子表里面字段校验全局不允许重复
    if (fromSub && !canAsUniqueWidget(data) && _.get(data, 'unique')) {
      data.unique = false;
    }

    // 数字控件处理极值
    if (_.includes([2, 6, 8, 10], type)) {
      return handleExtremeValue(data);
    }

    // 用户id替换
    if (type === 26) {
      return dealUserId(data);
    }

    // 部门id替换
    if (type === 27) {
      return dealUserId(data);
    }

    // 组织角色id替换
    if (type === 48) {
      return dealUserId(data);
    }

    // 关联记录、级联、查询记录
    if (_.includes([29, 35, 51], type)) {
      // 处理关联表叠加筛选条件里的 成员 部门 地区 他表字段 这几个类型的字段 values 处理成 [id, id]
      // 子表里关联筛选，不清配置rcid
      if (!isEmpty(getAdvanceSetting(data, 'filters'))) {
        data = handleFilters(data, isRelate);
      }
      if (!isEmpty(getAdvanceSetting(data, 'resultfilters'))) {
        data = handleFilters(data, true, 'resultfilters');
      }
      if (getAdvanceSetting(data, 'topshow') === 3 && !isEmpty(getAdvanceSetting(data, 'topfilters'))) {
        data = handleFilters(data, isRelate, 'topfilters');
      }
      if (getAdvanceSetting(data, 'topshow') === 2 && !isEmpty(getAdvanceSetting(data, 'topfilters'))) {
        data = dealCascaderId(data);
      }
      // 查询聚合表指定字段处理showtype
      if (type === 51 && (data.enumDefault === 1 || getAdvanceSetting(data, 'querytype') === 1)) {
        data = {
          ...handleAdvancedSettingChange(data, {
            ...(data.enumDefault === 1 ? { showtype: data.showControls.length > 1 ? '1' : '3' } : {}),
            allowlink: '0',
            allowedit: '0',
          }),
          enumDefault2: 1,
        };
      }
      // 关联表sid处理
      return fromSub
        ? omit(dealRelateSheetDefaultValue(data), 'relationControls', 'controls', 'sourceControl')
        : omit(dealRelateSheetDefaultValue(data), 'relationControls', 'controls');
    }
    // 汇总 筛选values 处理成 [id, id]
    if (type === 37) {
      if (!isEmpty(getAdvanceSetting(data, 'filters'))) {
        data = handleFilters(data);
      }
      return data;
    }

    // 处理公式大写金额他表字段数据
    if (_.includes([20, 31, 32], type)) {
      let dataSource = data.dataSource || '';
      if (type === 20 || type === 31) {
        dataSource = dataSource
          .replace(/c*SUM/gi, 'cSUM')
          .replace(/c*MIN/gi, 'cMIN')
          .replace(/c*MAX/gi, 'cMAX')
          .replace(/c*PRODUCT/gi, 'cPRODUCT')
          .replace(/c*COUNTA/gi, 'cCOUNTA')
          .replace(/c*ABS/gi, 'cABS')
          .replace(/c*INT/gi, 'cINT')
          .replace(/c*MOD/gi, 'cMOD')
          .replace(/c*ROUNDUP/gi, 'cROUNDUP')
          .replace(/c*ROUNDDOWN/gi, 'cROUNDDOWN')
          .replace(/c*ROUND\(/gi, 'cROUND(');
      }
      if (type === 20) {
        dataSource = dataSource.replace(/c*AVG/gi, 'cAVG');
      }
      if (type === 31) {
        dataSource = dataSource.replace(/c*AVERAGE/gi, 'cAVG');
      }
      return update(data, { dataSource: { $set: dataSource } });
    }

    /**
     * 自动编号控件 将start的默认值空字符串 转为 0
     * 删除无效的规则 控件为空 或空字符串
     * */
    if (type === 33) {
      let increase = getAdvanceSetting(data, 'increase') || [];
      increase = filter(increase, item => {
        if ([2, 3].includes(item.type)) return item.controlId;
        return true;
      });
      const index = findIndex(increase, item => item.type === 1);
      if (index < 0) return data;
      const configItem = increase[index];
      if (configItem.start) return data;
      // 未配置初始值时设为1
      const nextIncrease = update(increase, { [index]: { $apply: item => ({ ...item, start: 1 }) } });
      return handleAdvancedSettingChange(data, { increase: JSON.stringify(nextIncrease) });
    }
    return data;
  });
};

// 处理查询输入参数层级关系
export const dealRequestControls = (controls, needChild) => {
  if (!(controls && controls.length)) return [];
  let newControls = [];

  // 查询过滤无效数据(附件不支持)
  const filterControls = controls
    .filter(i => !_.includes([10000003, 10000006], i.type))
    .filter(i => {
      const hasFind = _.find(controls, o => i.dataSource === o.controlId);
      return i.dataSource ? hasFind && hasFind.type !== 10000007 : true;
    })
    .map(item => {
      const childControl = _.find(controls, o => o.dataSource === item.controlId);
      if (item.type === 10000007 && childControl) {
        return { ...item, originType: childControl.type };
      }
      return item;
    });

  if (needChild) {
    filterControls.forEach(item => {
      if (item.dataSource) {
        const parentIndex = findIndex(newControls, i => i.controlId === item.dataSource);
        if (parentIndex > -1) {
          const parentControl = newControls[parentIndex];
          newControls[parentIndex] = { ...parentControl, child: (parentControl.child || []).concat(item) };
        } else {
          newControls.push({ ...find(controls, i => i.controlId === item.dataSource), child: [item] });
        }
      } else {
        newControls.push(item);
      }
    });
  }

  return needChild ? newControls : filterControls;
};

// 处理自定义事件--查询api成立条件filters里控件type
export const getFilterControls = (controls = []) => {
  const result = [];
  if (_.isEmpty(controls)) return result;
  controls.forEach(c => {
    if (!c.dataSource) {
      // 普通数组按原字段多选类型来
      if (c.type === 10000007) {
        const originType = _.get(
          _.find(controls, o => o.dataSource === c.controlId),
          'type',
        );
        result.push({ ...c, type: originType, enumDefault: !_.includes([6, 16], originType) ? 1 : 0 });
      } else if (c.type === 10000008) {
        // 只有为空、不为空，按子表来
        result.push({ ...c, type: 34 });
      } else {
        result.push(c);
      }
    }
  });
  return result;
};

// 如果新增控件在可视区外则滚动至可视区内
export const scrollToVisibleRange = (data, widgetProps) => {
  const { activeWidget } = widgetProps;
  const $contentWrap = document.getElementById('widgetDisplayWrap');
  const $activeWidget = document.getElementById(`widget-${(activeWidget || {}).controlId}`);
  if (!$contentWrap || !$activeWidget) return;
  const rect = $activeWidget.getBoundingClientRect();
  // 如果在可视区外
  if (rect.top < 0 || rect.top > $contentWrap.offsetHeight) {
    const $scrollWrap = $contentWrap.querySelector('.nano-content');
    if ($scrollWrap) {
      setTimeout(() => {
        const $widget = document.getElementById(`widget-${data.controlId}`);
        if (!$widget) return;
        const { top, height } = $widget.getBoundingClientRect();
        $scrollWrap.scrollTop = $scrollWrap.scrollTop + top - height;
      }, 0);
    }
  }
};

// 批量添加
export const handleAddWidgets = (data, para = {}, widgetProps, callback) => {
  const { widgets, activeWidget, allControls, setWidgets, setActiveWidget, globalSheetInfo = {} } = widgetProps;
  const { mode, path, location, displayItemType, rowIndex, activePath } = para;
  data = data.map(item => (item.type === 90000 ? { ...item, type: 24 } : item));
  const tempData = head(data);
  const featureType = getFeatureStatus(globalSheetInfo.projectId, tempData.featureId);
  if (_.includes([49, 50], tempData.type) && featureType === '2') {
    buriedUpgradeVersionDialog(globalSheetInfo.projectId, tempData.featureId);
    return;
  }

  if (isExceedMaxControlLimit(allControls, data.length)) {
    alert(_l('当前表存在的控件已达到最大值，无法添加继续添加新控件!'), 3);
    return;
  }

  // 拖拽添加的情况
  if (mode) {
    // 标签页表格拖拽到普通控件中，更改showtype
    if (isTabSheetList(data) && displayItemType === 'common') {
      data = handleAdvancedSettingChange(data, { showtype: '5' });
    }
    // 拖到单独的行
    if (mode === DRAG_MODE.INSERT_NEW_LINE) {
      setWidgets(update(widgets, { $splice: [[rowIndex, 0, data]] }));
      setActiveWidget(data[0]);

      // 标签页拖拽添加，置顶配置同步更新
      if (_.isFunction(callback)) {
        callback();
      }
      return;
    }
    // 拖到行的末尾
    if (mode === DRAG_MODE.INSERT_TO_ROW_END) {
      setWidgets(
        update(widgets, {
          [rowIndex]: {
            $apply: item => {
              const nextRow = (item || []).concat(data);
              return nextRow.map(value => ({ ...value, size: WHOLE_SIZE / nextRow.length }));
            },
          },
        }),
      );
      setActiveWidget(adjustControlSize(widgets[rowIndex], data[0]));
      return;
    }

    if (mode === DRAG_MODE.INSERT_TO_COL) {
      setWidgets(insertControlInSameLine({ widgets, location, dropPath: path, srcItem: data[0] }));
      setActiveWidget(adjustControlSize(widgets[path[0]], data[0]));
      return;
    }
  }

  let newWidgets = widgets;

  data.map((item, index) => {
    let currentRowIndex = 0;

    // 没有激活控件或者激活的控件不存在 则直接添加在最后一行
    // 普通控件，分界位置，非普通表单最后
    if (isEmpty(activeWidget) || allControls.findIndex(item => item.controlId === activeWidget.controlId) < 0) {
      currentRowIndex = fixedBottomWidgets(item) ? newWidgets.length - 1 : getBoundRowByTab(widgets) - 1;
    } else {
      // 批量数据添加时，以前一个已添加控件作为激活控件
      let tempActiveWidget = index ? data[index - 1] : activeWidget;
      currentRowIndex = head(getPathById(newWidgets, get(tempActiveWidget, 'controlId')));

      // 批量拖拽移动，path区分,不走以下逻辑
      if (_.isEmpty(activePath)) {
        // 如果激活控件是标签页控件
        if (tempActiveWidget.type === 52) {
          // 不支持的控件,已标签页显示的在底下，其他放入分界位置
          if (notInsetSectionTab(item)) {
            currentRowIndex = fixedBottomWidgets(item) ? currentRowIndex : getBoundRowByTab(widgets) - 1;
          } else {
            const childrenList = getChildWidgetsBySection(allControls, tempActiveWidget.controlId);
            currentRowIndex = currentRowIndex + childrenList.length;
          }
        } else {
          // 当前激活控件非特殊控件，但是添加控件是特殊控件，直接添加末尾
          if (!fixedBottomWidgets(activeWidget) && fixedBottomWidgets(item)) {
            currentRowIndex = newWidgets.length - 1;
          }
          // 当前激活控件特殊控件，但是添加控件是非特殊控件，直接添加在分界线
          if (fixedBottomWidgets(activeWidget) && !fixedBottomWidgets(item)) {
            currentRowIndex = getBoundRowByTab(widgets) - 1;
          }
        }
      }
    }

    // 兼容currentRowIndex为负、全是普通控件的情况,当前控件列表为空时，添加到第一个
    // 不为空添加到最后一个
    if (currentRowIndex < 0) {
      currentRowIndex = newWidgets.length > 0 ? newWidgets.length - 1 : 0;
    }

    // 如果当前激活控件所在行没有空位则另起下一行，否则放到当前行后面
    if (isHaveGap(newWidgets[currentRowIndex], item)) {
      // 表单为空，直接添加
      newWidgets = update(newWidgets, { [_.isEmpty(newWidgets) ? 0 : currentRowIndex]: { $push: [item] } });
    } else {
      newWidgets = update(newWidgets, {
        $splice: [[currentRowIndex + 1, 0, [item]]],
      });
    }

    if (index === data.length - 1) {
      setWidgets(newWidgets);
      setActiveWidget(item);
      setTimeout(() => {
        scrollToVisibleRange(item, { ...widgetProps, activeWidget: item });
      }, 50);
    }
  });

  if (_.isFunction(callback)) {
    callback();
  }
};

// 批量移动
export const handleMoveWidgets = (data, widgetProps) => {
  const { widgets, activeWidget, allControls, setWidgets, setActiveWidget } = widgetProps;

  if (isExceedMaxControlLimit(allControls, data.length)) {
    alert(_l('当前表存在的控件已达到最大值，无法添加继续添加新控件!'), 3);
    return;
  }

  let newWidgets = widgets;

  let currentRowIndex = head(getPathById(newWidgets, activeWidget.controlId));
  const childrenList = getChildWidgetsBySection(allControls, activeWidget.controlId);
  currentRowIndex = currentRowIndex + childrenList.length;

  data.map((item, index) => {
    // 如果当前激活控件所在行没有空位则另起下一行，否则放到当前行后面
    if (isHaveGap(newWidgets[currentRowIndex], item)) {
      newWidgets = update(newWidgets, { [currentRowIndex]: { $push: [item] } });
    } else {
      currentRowIndex = currentRowIndex + 1;
      newWidgets = update(newWidgets, { $splice: [[currentRowIndex, 0, [item]]] });
    }

    if (index === data.length - 1) {
      setWidgets(newWidgets);
      setActiveWidget(item);
      setTimeout(() => {
        scrollToVisibleRange(item, { ...widgetProps, activeWidget: item });
      }, 50);
    }
  });
};

export const dealCopyWidgetId = (data = {}) => {
  const newData = {
    ...data,
    attribute: 0,
    controlId: uuidv4(),
    alias: '',
    controlName: _l('%0-复制', data.controlName),
  };

  let ids = {};
  if (
    data.type === 34 &&
    (_.get(data, 'advancedSetting.detailworksheettype') === '2' ||
      _.get(window.subListSheetConfig[data.controlId], 'mode') === 'new')
  ) {
    const relationControls = (newData.relationControls || []).map(item => {
      if (_.includes(ALL_SYS, item.controlId)) return item;
      const newItem = {
        ...item,
        controlId: uuidv4(),
        advancedSetting: { ...item.advancedSetting, dynamicsrc: '', defaulttype: '' },
      };
      ids[item.controlId] = newItem.controlId;
      return newItem;
    });

    let newWidget = JSON.stringify({ ...newData, dataSource: uuidv4(), relationControls });
    Object.keys(ids).forEach(id => {
      newWidget = newWidget.replaceAll(id, ids[id]);
    });
    newWidget = safeParse(newWidget);
    window.subListSheetConfig[newData.controlId] = {
      ...window.subListSheetConfig[data.controlId],
      sheetInfo: newWidget,
    };
    return newWidget;
  }
  if (data.type === 34 && window.subListSheetConfig[data.controlId]) {
    window.subListSheetConfig[newData.controlId] = {
      ...window.subListSheetConfig[data.controlId],
    };
  }
  return newData;
};

// 获取当前分段控件子布局控件
export const getChildWidgetsBySection = (controls = [], id) => {
  const childControls = controls.filter(i => i.sectionId === id);
  return putControlByOrder(childControls);
};

// 批量复制控件数据处理
export const batchCopyWidgets = (props, selectWidgets = []) => {
  const { widgets, allControls, queryConfigs, setActiveWidget, setWidgets } = props;

  for (var i = 0; i < selectWidgets.length; i++) {
    const err = checkWidgetMaxNumErr(selectWidgets[i], [...allControls, ...selectWidgets.slice(0, i)]);
    if (err) {
      alert(err, 3);
      return;
    }
  }

  const copyWidgets = [];
  let childCount = 0;
  let newWidgets = widgets;
  let sectionIds = {};
  let newQueries = [];
  let newActiveWidget = {};

  selectWidgets.map(item => {
    copyWidgets.push(item);
    if (item.type === 52 && get(item, 'relationControls.length')) {
      copyWidgets.push(...item.relationControls);
    }
  });

  const orderCopyWidgets = putControlByOrder(copyWidgets);

  orderCopyWidgets.forEach(row => {
    const currentRow = head(getPathById(newWidgets, get(last(row), 'controlId')));
    const dealRow = row.map(data => {
      let dealItem = dealCopyWidgetId(data);
      // 替换分段内字段sectionId
      if (sectionIds[dealItem.sectionId]) {
        dealItem.sectionId = sectionIds[dealItem.sectionId];
      } else {
        // 没有sectionId,清空childCount,防止插入位置不对
        childCount = 0;
      }
      // 工作表查询配置复制
      const currentQuery = find(queryConfigs, queryItem => queryItem.controlId === data.controlId);
      if (currentQuery) {
        dealItem = handleAdvancedSettingChange(dealItem, { dynamicsrc: '', defaulttype: '' });
      }
      // currentQuery && newQueries.push({ ...currentQuery, id: `${uuidv4()}`, controlId: dealItem.controlId });

      if (data.type === 52) {
        // 缓存sectionId
        sectionIds[data.controlId] = dealItem.controlId;
        childCount = get(data, 'relationControls.length');
      }

      return dealItem;
    });
    newActiveWidget = last(dealRow);
    newWidgets = update(newWidgets, {
      $splice: [[currentRow + childCount + 1, 0, dealRow]],
    });
  });

  if (isExceedMaxControlLimit(flatten(newWidgets))) return;

  setActiveWidget(newActiveWidget);
  setWidgets(newWidgets);
  return;
};

// 批量设置属性
export const batchResetWidgets = (props, selectWidgets = [], fieldPermission) => {
  let { widgets, setWidgets } = props;
  selectWidgets.forEach(item => {
    const [row, col] = getPathById(widgets, item.controlId);
    widgets = update(widgets, { [row]: { [col]: { $set: item } } });
  });

  setWidgets(widgets);
};

// 删除标签页
export const deleteSection = ({ widgets = [], data }, props) => {
  const { setActiveWidget, setWidgets } = props;
  Dialog.confirm({
    title: _l('删除标签？'),
    description: _l('标签页内字段将移动到外部，不会被删除'),
    okText: _l('删除'),
    buttonType: 'danger',
    onOk: () => {
      // 先删除原来控件
      const deleteWidgets = [data, ...data.relationControls];
      let batchDeleteWidgets = batchRemoveItems(widgets, deleteWidgets);
      const addWidgets = (data.relationControls || []).map(i => ({ ...i, sectionId: '' }));
      const activeWidget = last(addWidgets);
      // 将内部字段移到外部，拼到普通字段后
      if (addWidgets.length) {
        const boundRow = getBoundRowByTab(batchDeleteWidgets);
        batchDeleteWidgets.splice(
          boundRow > -1 ? boundRow : batchCopyWidgets.length,
          0,
          ...putControlByOrder(addWidgets),
        );
      }
      setWidgets(batchDeleteWidgets);
      if (activeWidget) {
        setActiveWidget(activeWidget);
        setTimeout(() => {
          scrollToVisibleRange(activeWidget, { ...props, activeWidget });
        }, 50);
      } else {
        setActiveWidget({});
      }
      return;
    },
  });
};

// shift连选处理
export const batchShiftWidgets = props => {
  const { batchActive = [], data, widgets = [], setBatchActive } = props;
  const startWidget = last(batchActive);
  if (startWidget && data) {
    const [startRow, startCol] = getPathById(widgets, startWidget.controlId);
    const [endRow, endCol] = getPathById(widgets, data.controlId);
    const newBatchWidgets = [];
    for (var i = 0; i < widgets.length; i++) {
      const row = widgets[i];
      for (var j = 0; j < row.length; j++) {
        if (
          (i === Math.min(startRow, endRow) && j >= (startRow > endRow ? endCol : startCol)) ||
          (i === Math.max(startRow, endRow) && j <= (startRow > endRow ? startCol : endCol))
        ) {
          newBatchWidgets.push(widgets[i][j]);
        } else if (i > Math.min(startRow, endRow) && i < Math.max(startRow, endRow)) {
          newBatchWidgets.push(...row);
        }
      }
    }

    const filterBatchWidgets = _.uniq(newBatchWidgets.filter(i => i.type !== 52).filter(_.identity));

    if (filterBatchWidgets.length > 0) {
      setBatchActive(filterBatchWidgets);
    }
  }
};
