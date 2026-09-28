import update from 'immutability-helper';
import _, { filter, findIndex, isEmpty, omit } from 'lodash';
import { getAdvanceSetting, handleAdvancedSettingChange } from './advancedSetting';
import { handleFilters } from './conditions';
import { dealCusTomEventActions } from './customEvent';
import { dealCascaderId, dealRelateSheetDefaultValue, dealUserId, handleExtremeValue } from './defaultValue';
import { canAsUniqueWidget } from './style';

/**
 * 将汇总、他表字段和公式等复合控件规范化为其实际筛选值类型。
 * 返回新对象，不修改传入控件。
 */
export function redefineComplexControl(control) {
  if (control.type === 37) {
    return { ...control, ...{ type: control.enumDefault2 || 6, originType: control.type } };
  }

  if (control.type === 30) {
    let controlType = control.sourceControlType;

    if (_.includes([37, 53], controlType)) {
      controlType = control.enumDefault2;
    }

    if (controlType === 31) {
      controlType = 6;
    }

    if (controlType === 32) {
      controlType = 2;
    }

    if (controlType === 38) {
      controlType = 6;
    }

    return {
      ...control,
      ...{
        type: controlType,
        originType: control.type,
        ...(_.includes([9, 10, 11], controlType) ? { options: _.get(control, 'sourceControl.options') } : {}),
      },
    };
  }

  if (control.type === 31) {
    return { ...control, ...{ type: 6, originType: control.type } };
  }

  if (control.type === 32) {
    return { ...control, ...{ type: 2, originType: control.type } };
  }

  if (control.type === 38) {
    return {
      ...control,
      ...{
        type:
          control.enumDefault === 2 ? (_.includes(['8', '9'], control.unit) ? 46 : control.unit === '3' ? 15 : 16) : 6,
        originType: control.type,
      },
    };
  }

  if (control.type === 50) {
    return { ...control, ...{ type: 2, originType: control.type } };
  }

  if (control.type === 53) {
    return { ...control, ...{ type: control.enumDefault2, originType: control.type } };
  }

  return { ...control };
}

/** 保存前规范化字段默认值、筛选、公式、事件和子表配置。 */
export const formatControlsData = (controls = [], fromSub = false) => {
  return controls.map(item => {
    const { type } = item;
    let data = { ...item };

    const isRelate = fromSub ? false : true;

    // 有一批老数据影响了默认值功能，清空掉
    if (_.get(data, 'default') === '[]') {
      data.default = '';
    }

    if (
      ((type === 10 && getAdvanceSetting(data, 'checktype') !== 1) ||
        (_.includes([9, 11], type) && getAdvanceSetting(data, 'showtype') !== 0)) &&
      data.hint
    ) {
      data.hint = '';
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

      // 游离子表赋值row,保证转换成真实子表时有顺序
      const newRelationControls =
        getAdvanceSetting(data, 'detailworksheettype') === 2
          ? _.sortBy(data.relationControls, r => {
              const controlssorts = getAdvanceSetting(data, 'controlssorts');
              return findIndex(controlssorts, c => c === r.controlId);
            }).map((item, index) => {
              return {
                ...item,
                row: index + 1,
              };
            })
          : data.relationControls;

      return {
        ...data,
        advancedSetting: { ...data.advancedSetting, uniquecontrols: JSON.stringify(uniqueControls) },
        relationControls: formatControlsData(newRelationControls, true),
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
