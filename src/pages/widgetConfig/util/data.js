import React from 'react';
import { CAN_NOT_AS_TEXT_GROUP } from '../config';
import { DRAG_MODE, WHOLE_SIZE } from '../config/Drag';
import { navigateTo } from 'src/router/navigateTo';
import sheetAjax from 'src/api/worksheet';
import cx from 'classnames';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import update from 'immutability-helper';
import _, { includes, get, isEmpty, omit, findIndex, filter, find, head, last } from 'lodash';
import { getAdvanceSetting, handleAdvancedSettingChange, isExceedMaxControlLimit } from './setting';
import { insertControlInSameLine } from './drag';
import { getControlByControlId, adjustControlSize } from '.';
import { getPathById, isHaveGap } from './widgets';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { ControlTag } from '../styled';
import { Tooltip } from 'ming-ui';

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

export const getMsgByCode = ({ code, data }) => {
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
    default:
      break;
  }
  alert(errorText, 2);
  return errorText;
};

export function handleExtremeValue(data) {
  const { advancedSetting = {}, type } = data;
  const { checkrange = '0', min = '', max = '' } = advancedSetting;
  const transferValue = value => value.replace(/,/g, '');
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
                if (v.indexOf('rowid') >= 0) {
                  return JSON.parse(v).rowid;
                }
                return v;
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
export function dealUserId(data, dataType) {
  const value = _.get(data, ['advancedSetting', 'defsource']) || '[]';
  try {
    const settings = value && JSON.parse(value);
    if (_.isEmpty(settings)) return data;
    const newValue = settings.map(setting =>
      update(setting, {
        $apply: item => {
          const { staticValue } = item;
          if (staticValue && typeof staticValue === 'string') {
            const accountId = safeParse(staticValue || '{}')[dataType];
            return { ...item, staticValue: accountId || staticValue };
          }
          if (staticValue[dataType]) return { ...item, staticValue: staticValue[dataType] };
          return item;
        },
      }),
    );
    return update(data, {
      advancedSetting: {
        $apply: item => ({ ...item, defsource: JSON.stringify(newValue) }),
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
  if (isRelate && !isEmpty(condition.dynamicSource)) {
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
      (type === 37 && !includes([15, 16], enumDefault2))
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
export function formatColumnToText(column, numberOnly, noMask) {
  return renderCellText(column, { noUnit: numberOnly, noSplit: numberOnly, noMask: noMask });
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
          storage.worksheets || [],
          item => item.groupId === data.groupId && item.worksheetId === data.worksheetId,
        ) || {}
      ).viewId || '';

    navigateTo(`/app/${data.appId}/${data.groupId}/${data.worksheetId}/${viewId}`);
  });
}

export const dealControlPos = controls => {
  const sortableControls = controls.reduce((p, c) => {
    return update(p, { $push: [[c]] });
  }, []);
  return _.flatten(sortableControls.map((item, row) => item.map((control, col) => ({ ...control, row, col }))));
};

export const formatControlsData = (controls = [], fromSub = false) => {
  return controls.map(data => {
    const { type } = data;

    // 子表控件递归处理其中的字段
    if (type === 34) {
      return { ...data, relationControls: formatControlsData(data.relationControls, true) };
    }

    // 数字控件处理极值
    if (_.includes([2, 6, 8, 10], type)) {
      return handleExtremeValue(data);
    }

    // 用户id替换
    if (type === 26) {
      return dealUserId(data, 'accountId');
    }

    // 部门id替换
    if (type === 27) {
      return dealUserId(data, 'departmentId');
    }

    // 组织角色id替换
    if (type === 48) {
      return dealUserId(data, 'organizeId');
    }

    if (type === 29) {
      // 处理关联表叠加筛选条件里的 成员 部门 地区 他表字段 这几个类型的字段 values 处理成 [id, id]
      // 子表里关联筛选，不清配置rcid
      if (!isEmpty(getAdvanceSetting(data, 'filters'))) {
        data = handleFilters(data, fromSub ? false : true);
      }
      if (!isEmpty(getAdvanceSetting(data, 'resultfilters'))) {
        data = handleFilters(data, true, 'resultfilters');
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

// 如果新增控件在可视区外则滚动至可视区内
const scrollToVisibleRange = (data, widgetProps) => {
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
  const { mode, path, location, rowIndex } = para;
  const featureType = getFeatureStatus(globalSheetInfo.projectId, data.featureId);
  if (_.includes([49, 50], data.type) && featureType === '2') {
    buriedUpgradeVersionDialog(globalSheetInfo.projectId, data.featureId);
    return;
  }

  if (isExceedMaxControlLimit(allControls, data.length)) {
    alert(_l('当前表存在的控件已达到最大值，无法添加继续添加新控件!'), 3);
    return;
  }

  // 如果当前控件列表为空 直接添加
  if (isEmpty(widgets)) {
    setWidgets(update(widgets, { $push: [data] }));
    setActiveWidget(newActiveData);
    return;
  }

  // 拖拽添加的情况
  if (mode) {
    // 拖到单独的行
    if (mode === DRAG_MODE.INSERT_NEW_LINE) {
      setWidgets(update(widgets, { $splice: [[rowIndex, 0, data]] }));
      setActiveWidget(data[0]);
      return;
    }
    // 拖到行的末尾
    if (mode === DRAG_MODE.INSERT_TO_ROW_END) {
      setWidgets(
        update(widgets, {
          [rowIndex]: {
            $apply: item => {
              const nextRow = item.concat(data);
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
    if (isEmpty(activeWidget) || allControls.findIndex(item => item.controlId === activeWidget.controlId) < 0) {
      currentRowIndex = newWidgets.length - 1;
    } else {
      currentRowIndex = head(
        getPathById(newWidgets, index ? _.get(data[index - 1], 'controlId') : activeWidget.controlId),
      );
    }

    // 如果当前激活控件所在行没有空位则另起下一行，否则放到当前行后面
    if (isHaveGap(newWidgets[currentRowIndex], item)) {
      newWidgets = update(newWidgets, { [currentRowIndex]: { $push: [item] } });
    } else {
      newWidgets = update(newWidgets, { $splice: [[currentRowIndex + 1, 0, [item]]] });
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
