import React from 'react';
import { CAN_NOT_AS_TEXT_GROUP } from '../config';
import { navigateTo } from 'src/router/navigateTo';
import sheetAjax from 'src/api/worksheet';
import cx from 'classnames';
import { renderCellText } from 'src/pages/worksheet/components/CellControls';
import update from 'immutability-helper';
import { includes, get, isEmpty, omit, findIndex, filter } from 'lodash';
import { getAdvanceSetting, handleAdvancedSettingChange } from './setting';
import { getControlByControlId } from '.';
import { ControlTag } from '../styled';

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
  alert(errorText);
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
export function dealUserId(data) {
  const value = _.get(data, ['advancedSetting', 'defsource']) || '[]';
  try {
    const settings = value && JSON.parse(value);
    if (_.isEmpty(settings)) return data;
    const newValue = settings.map(setting =>
      update(setting, {
        $apply: item => {
          const { staticValue } = item;
          if (typeof staticValue === 'string' && staticValue) {
            const { accountId } = JSON.parse(staticValue);
            return { ...item, staticValue: accountId };
          }
          if (staticValue.accountId) return { ...item, staticValue: staticValue.accountId };
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
 * 处理关联表叠加筛选条件里的 成员 部门 地区 他表字段 级联 这几个类型的字段 values 处理成 [id, id]
 */
export function handleFilters(data) {
  const filters = getAdvanceSetting(data, 'filters');
  function handleCondition(condition) {
    if (_.includes([19, 23, 24, 26, 27, 29, 35], condition.dataType) && condition.values) {
      return {
        ...condition,
        values: condition.values.map(value => JSON.parse(value || '{}').id),
      };
    } else {
      return condition;
    }
  }
  try {
    const filtersValue = filters.map(handleCondition);
    return handleAdvancedSettingChange(data, { filters: JSON.stringify(filtersValue) });
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
      includes([6, 8, 28, 31], type) ||
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
export function formatColumnToText(column, numberOnly) {
  return renderCellText(column, { noUnit: numberOnly, noSplit: numberOnly });
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
  return <ControlTag className={cx({ invalid })}>{invalid ? _l('字段已删除') : control.controlName}</ControlTag>;
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

export const formatControlsData = (controls = []) => {
  return controls.map(data => {
    const { type } = data;

    // 子表控件递归处理其中的字段
    if (type === 34) {
      return { ...data, relationControls: formatControlsData(data.relationControls) };
    }

    // 数字控件处理极值
    if (_.includes([2, 6, 8, 10], type)) {
      return handleExtremeValue(data);
    }

    // 用户id替换
    if (type === 26) {
      return dealUserId(data);
    }

    if (type === 29) {
      // 处理关联表叠加筛选条件里的 成员 部门 地区 他表字段 这几个类型的字段 values 处理成 [id, id]
      if (!isEmpty(getAdvanceSetting(data, 'filters'))) {
        data = handleFilters(data);
      }
      // 关联表sid处理
      return omit(dealRelateSheetDefaultValue(data), 'relationControls', 'controls');
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
