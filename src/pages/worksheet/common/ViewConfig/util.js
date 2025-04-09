import update from 'immutability-helper';
import { filterOnlyShowField, getIconByType } from 'src/pages/widgetConfig/util';
import { handleCondition } from 'src/pages/widgetConfig/util/data';
import { getSortData } from 'src/pages/worksheet/util';

export const updateViewAdvancedSetting = (view, obj) => {
  const { navfilters } = obj;
  const { advancedSetting = {} } = view;
  const { navshow } = advancedSetting;
  if (!!navfilters || !['2', '3'].includes(navshow)) {
    return updateAdvancedSetting(view, obj);
  }
  return formatAdvancedSettingByNavfilters(view, obj);
};

export const updateAdvancedSetting = (view, obj) => {
  const { advancedSetting = {} } = view;
  return update(advancedSetting, { $apply: item => ({ ...item, ...obj }) });
};

//格式化advancedSetting的navfilters
export const formatAdvancedSettingByNavfilters = (view, newValue = {}) => {
  const { navfilters } = newValue;
  const { advancedSetting = {} } = view;
  const { navshow } = advancedSetting;
  if (!!navfilters || !['2', '3'].includes(navshow)) {
    return updateAdvancedSetting(view, newValue);
  } else {
    //显示制定项，人员部门等字段处理
    return updateAdvancedSetting(view, {
      ...newValue,
      navfilters:
        navshow === '3'
          ? JSON.stringify(safeParse(_.get(advancedSetting, 'navfilters')).map(handleCondition))
          : JSON.stringify(
              safeParse(_.get(advancedSetting, 'navfilters')).map(info => {
                let id = info;
                let data = null;
                try {
                  data = JSON.parse(info);
                  id = data.id || data;
                } catch (error) {
                  id = info;
                }
                return id + '';
              }),
            ),
    });
  }
};

//格式化带有Navfilters的配置数据
export const formatObjWithNavfilters = o => {
  if (!!_.get(o, 'advancedSetting.navfilters')) {
    return {
      ...o,
      advancedSetting: formatAdvancedSettingByNavfilters(o),
    };
  } else {
    return o;
  }
};

export const getCanDisplayControls = (worksheetControls, disableTypes) => {
  return worksheetControls.filter(
    c => !!c.controlName && !_.includes(disableTypes || [22, 10010, 43, 45, 47, 49, 51, 52], c.type),
  );
};

export const isSameType = (list, control) => {
  return list.includes(control.type) || (list.includes(control.sourceControlType) && control.type === 30);
};

export const getCanSelectColumnsForSort = (controlId = '', columns = [], sortConditions = []) => {
  const sortConditionControls = sortConditions
    .map(c => _.find(columns, column => column.controlId === c.controlId))
    .filter(_.identity);
  return filterOnlyShowField(columns)
    .filter(o => {
      if (o.controlId === controlId) return true;
      //排除签名字段 扫码 接口查询按钮 查询记录 或 已选中且非当前id
      if ([42, 47, 49, 51, 52, 54].includes(o.type) || _.find(sortConditions, sc => sc.controlId === o.controlId))
        return false;
      // 人员，部门，关联，组织角色，附件，级联选择此类支持多选的数组格式，都只能选择一个排序 选项strDefault=index除外
      const list = [26, 27, 29, 48, 35, 14];
      const optionTypes = [9, 10, 11];
      const isExist = !!sortConditionControls.find(
        o =>
          (list.includes(o.type === 30 ? o.sourceControlType : o.type) ||
            (optionTypes.includes(o.type === 30 ? o.sourceControlType : o.type) && o.strDefault !== 'index')) &&
          controlId !== o.controlId,
      );
      // 存在数组类类型 都只能选择一个排序 选项strDefault=index除外
      if (isExist) {
        const type = o.type === 30 ? o.sourceControlType : o.type;
        return optionTypes.includes(type) && o.strDefault === 'index'
          ? true
          : ![...list, ...optionTypes].includes(type);
      }
      return true;
    })
    .map(c => ({
      text: c.controlName,
      value: c.controlId,
      itemContentStyle: { padding: '0 0 0 30px' },
      iconName: getIconByType(c.type),
    }));
};

export const getSortTypes = (controlId, columns) => {
  const control = _.find(columns, c => c.controlId === controlId) || {};
  return getSortData(control.type, control);
};

export const sortControls = columns => {
  return columns.sort((a, b) => {
    if (a.row === b.row) {
      return a.col - b.col;
    }
    return a.row - b.row;
  });
};
