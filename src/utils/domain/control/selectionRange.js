import _ from 'lodash';
import { WIDGET_VALUE_ID } from 'src/utils/domain/control/value';

/**
 * 将人员、部门和组织控件的静态或字段引用范围归并为选择器可用的 ID 集合。
 */
export const dealUserRange = (control = {}, data = [], masterData = {}) => {
  const parsedChooseRange = safeParse(_.get(control, 'advancedSetting.chooserange'), 'array');
  const chooseRange = Array.isArray(parsedChooseRange) ? parsedChooseRange : [];
  if (!chooseRange.length) return false;

  const ranges = {};

  const getRangeKey = item => {
    const rangeTypes = {
      appointedAccountIds: [1, 26],
      appointedDepartmentIds: [2, 27],
      appointedOrganizeIds: [3, 48],
    };
    return Object.keys(rangeTypes).find(key => _.includes(rangeTypes[key], item.type)) || '';
  };

  chooseRange.forEach(item => {
    if (item.type === 4) {
      if (item.rcid && item.rcid !== masterData.worksheetId) {
        const parentControl = _.find(data, controlItem => controlItem.controlId === item.rcid) || {};
        const parsedRelationValues = safeParse(parentControl.value || '[]', 'array');
        const relationValue = Array.isArray(parsedRelationValues) ? parsedRelationValues[0] : undefined;
        const sourceValues = relationValue && safeParse(relationValue.sourcevalue);
        const sourceValue = _.get(sourceValues, item.cid);
        const sourceControl = _.find(
          parentControl.relationControls || [],
          controlItem => controlItem.controlId === item.cid,
        );
        const parsedSourceValue = sourceValue && safeParse(sourceValue);

        if (sourceControl && _.isArray(parsedSourceValue)) {
          const currentControl = {
            ...sourceControl,
            type: sourceControl.type === 30 ? sourceControl.sourceControlType : sourceControl.type,
          };
          const rangeKey = getRangeKey(currentControl);
          ranges[rangeKey] = _.uniq(
            (ranges[rangeKey] || []).concat(
              parsedSourceValue.map(value => value[WIDGET_VALUE_ID[currentControl.type]]),
            ),
          );
        }
      } else {
        const sourceControl =
          _.find(data, controlItem => controlItem.controlId === item.cid) ||
          _.find(masterData.formData || [], controlItem => controlItem.controlId === item.cid);

        if (sourceControl) {
          const currentControl = {
            ...sourceControl,
            type: sourceControl.type === 30 ? sourceControl.sourceControlType : sourceControl.type,
          };
          const rangeKey = getRangeKey(currentControl);
          const parsedCurrentValue = safeParse(currentControl.value, 'array');
          const selectedIds = (Array.isArray(parsedCurrentValue) ? parsedCurrentValue : [])
            .map(value => value[WIDGET_VALUE_ID[currentControl.type]])
            .filter(Boolean);

          if (rangeKey && selectedIds.length) {
            ranges[rangeKey] = _.uniq((ranges[rangeKey] || []).concat(selectedIds));
          }
        }
      }
    } else {
      const rangeKey = getRangeKey(item);
      const userInfo = safeParse(item.staticValue || '{}');
      const valueType = item.type === 1 ? 26 : item.type === 2 ? 27 : 48;
      const selectedValue = _.get(userInfo, [WIDGET_VALUE_ID[valueType]]);

      if (selectedValue) {
        ranges[rangeKey] = _.uniq((ranges[rangeKey] || []).concat(selectedValue));
      }
    }
  });

  return ranges;
};
