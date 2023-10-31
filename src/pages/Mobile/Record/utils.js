import { NORMAL_SYSTEM_FIELDS_SORT, WORKFLOW_SYSTEM_FIELDS_SORT } from 'src/pages/worksheet/common/ViewConfig/util';
import { isRelateRecordTableControl } from 'worksheet/util';
import { updateRulesData } from 'src/components/newCustomFields/tools/filterFn';
import { controlState } from 'src/components/newCustomFields/tools/utils';

// 普通字段添加标签
export const commonControlsAddTab = (controls = [], extra) => {
  const { rules = [], from, showDetailTab } = extra;
  const temp = updateRulesData({ rules, data: controls }).filter(
    item => !item.hidden && controlState(item, from).visible,
  ); // 过滤不显示字段

  const hasTab = _.find(temp, item => isRelateRecordTableControl(item) || item.type === 52);

  // 若无标签页、关联多条则无详情tab
  if (!hasTab && !showDetailTab) return controls;

  let data = [
    {
      controlId: 'detail',
      controlName: _l('详情'),
      type: 52,
      sectionId: '',
    },
  ].concat(controls);

  return data.map(item => {
    if (
      !item.sectionId &&
      !_.includes([...NORMAL_SYSTEM_FIELDS_SORT, ...WORKFLOW_SYSTEM_FIELDS_SORT], item.controlId) &&
      !_.includes([52], item.type) &&
      !isRelateRecordTableControl(item)
    ) {
      return { ...item, sectionId: 'detail' };
    }
    return item;
  });
};
