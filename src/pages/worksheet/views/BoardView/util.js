import { isEmpty } from 'lodash';
import _ from 'lodash';
import { canSetGroup } from 'worksheet/common/ViewConfig/components/GroupSet/util';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { getTitleControlForCard } from 'src/pages/worksheet/views/util.js';
import { getRecordColorConfig } from 'src/utils/record';
import {
  filterAndFormatterControls,
  getRecordAttachments,
  isDisabledCreate,
  RENDER_RECORD_NECESSARY_ATTR,
} from '../util';
import { CAN_AS_BOARD_OPTION } from './config';

// 处理从后端获取的看板数据
export const dealBoardViewData = props => {
  const { view, controls } = props;
  let { data } = props;
  if (!data || isEmpty(data)) return [];
  data = data.sort((a, b) => a.sort - b.sort);
  const { displayControls, viewControl, coverCid } = view;
  if (!controls || !controls.length) return [];
  const selectControl = filterAndFormatterControls({
    controls: controls,
    filter: item => item.controlId === viewControl,
    formatter: v => v,
  });
  const titleControl = getTitleControlForCard(view, controls);
  if (selectControl.length) {
    const control = selectControl[0];
    const res = data.map(item => {
      const { type, key } = item;
      let extraPara = {};
      // 单选
      if (_.includes(CAN_AS_BOARD_OPTION, type)) {
        const option = _.find(_.get(control, ['options']), v => v.key === key);
        extraPara = { ..._.pick(option, ['color', 'value']), ..._.pick(control, ['enumDefault', 'enumDefault2']) };
      }
      // 等级
      if (_.includes([28], type)) {
        extraPara = { ..._.pick(control, ['enumDefault']) };
      }

      const itemData = ((_.get(item, 'rows') || []).filter(v => !!v) || []).map(row => {
        try {
          const parsedRow = JSON.parse(row);
          const arr = [];
          const { rowid: rowId, allowedit: allowEdit, allowdelete: allowDelete } = parsedRow;

          if (titleControl) {
            // 标题字段
            arr.push({
              ..._.pick(titleControl, RENDER_RECORD_NECESSARY_ATTR),
              value: parsedRow[titleControl.controlId],
            });
          }

          // 配置的显示字段
          displayControls.forEach(id => {
            const currentControl = _.find(controls, ({ controlId }) => controlId === id);
            if (currentControl) {
              const value = parsedRow[id];
              arr.push({ ..._.pick(currentControl, RENDER_RECORD_NECESSARY_ATTR), value });
            }
          });
          return {
            fields: arr,
            rawRow: row,
            recordColorConfig: getRecordColorConfig(view),
            rowId,
            allowEdit,
            allowDelete,
            ...getRecordAttachments(parsedRow[coverCid]),
            coverData: { ...(controls.find(it => it.controlId === coverCid) || {}), value: item[coverCid] },
            formData: controls.map(o => {
              return { ...o, value: parsedRow[o.controlId] };
            }),
          };
        } catch (error) {
          console.log(error);
          return {};
        }
      });

      return {
        ...item,
        ...extraPara,
        ..._.pick(control, ['required', 'fieldPermission']),
        name: key === '-1' ? view.advancedSetting.emptyname || _l('未指定') : item.name,
        // 未分类
        noGroup: key === '-1',
        data: itemData,
      };
    });
    return res;
  }
};

export const getTargetName = (value, controls = {}, { type }) => {
  if (_.includes([26, 27, 48], type)) {
    return value;
  } else if ([9, 11].includes(type)) {
    const findItem = _.find(controls.options || [], i => i.key === JSON.parse(value || [])[0]);
    return findItem.value;
  } else if (type === 29) {
    return JSON.parse(value || {}).name;
  } else if (type === 28) {
    return _l('%0 级', value);
  }
};

export const isShowAddRecord = (worksheetInfo, list, viewControl, sheetSwitchPermit) => {
  const { allowAdd } = worksheetInfo;
  const { key, required, fieldPermission = '' } = list;
  if (isDisabledCreate(sheetSwitchPermit)) return false;
  // 以创建者为看板 无法添加创建者为其他成员的记录
  if (viewControl === 'caid' && list.key !== _.get(md, ['global', 'Account', 'accountId'])) return false;
  if (!allowAdd || fieldPermission[1] === '0') return false;
  if (required && key === '-1') return false;
  return true;
};

export const getFirstGroupDefaultValue = (list, boardData) => {
  let value = list.key;
  if (_.includes([26, 27, 48], list.type)) {
    const { name = '' } = boardData.find(item => item.key === list.key) || {};
    if (name) {
      const user = JSON.parse(name);
      value = JSON.stringify(Array.isArray(user) ? user : [user]);
    } else {
      value = '[]';
    }
  }

  if (list.type === 29) {
    value = JSON.stringify([{ sid: list.key, name: list.name }]);
  }
  if (_.includes([9, 10, 11], list.type)) {
    value = JSON.stringify([value]);
  }
  if (list.key === '-1') {
    value = '';
  }
  return value;
};

// 二级分组默认值
export const getSecondGroupDefaultValue = (control, opt) => {
  const { type, controlId } = control;
  let value = opt.key;
  // 拥有者单独处理
  if (controlId === 'ownerid') {
    value = opt.accountId || opt.key;
  } else if (_.includes([26, 27, 48], type)) {
    if (opt.combination) {
      value = JSON.stringify([safeParse(opt.combination)]);
    } else {
      value = '[]';
    }
  }

  if (type === 29) {
    value = JSON.stringify([{ sid: opt.key, name: opt.name }]);
  }
  if (_.includes([9, 10, 11], type)) {
    value = JSON.stringify([value]);
  }
  if (opt.key === '-1') {
    value = '';
  }
  return value;
};

// 记录排序
export const viewSortRecord = (obj, view, props, selectControl, secondGroupControl) => {
  const { rowId, value, firstGroupChange, secondGroupChange, secondGroupValue } = obj;
  const defaultValue = [];
  const firstGroupControl = selectControl();
  if (firstGroupChange) {
    defaultValue.push({ ..._.pick(firstGroupControl, ['controlId', 'type', 'controlName', 'dot']), value });
  }
  if (secondGroupChange && secondGroupControl) {
    defaultValue.push({
      ..._.pick(secondGroupControl, ['controlId', 'type', 'controlName', 'dot']),
      value: secondGroupValue,
    });
  }
  if (!defaultValue.length) {
    console.error('排序数据异常');
  }
  const para = {
    rowId,
    ..._.pick(props, ['appId', 'worksheetId', 'viewId', 'projectId']),
    newOldControl: defaultValue,
  };
  // if (Reflect.has(obj, 'rawRow')) {
  //   const originData = JSON.parse(rawRow) || {};
  //   worksheetAjax.updateWorksheetRow(para).then(res => {
  //     if (!isEmpty(res.data)) {
  //       // 后端更新后返回的权限不准 使用获取时候的权限
  //       const originAuth = _.pick(originData, ['allowedit', 'allowdelete']);
  //       props.updateMultiSelectBoard({
  //         rowId,
  //         item: { ...res.data, ...originAuth },
  //         prevValue: originData[viewControl],
  //         currentValue: value,
  //       });
  //     } else {
  //       alert(_l('拖拽更新失败!'), 2);
  //     }
  //   });
  //   return;
  // }
  props.sortBoardRecord({
    firstGroupControlId: firstGroupControl.controlId,
    secondGroupControlId: secondGroupControl ? secondGroupControl.controlId : null,
    ...obj,
    ...para,
  });
};

// 判断是否有二级分组字段（防止之前配了，但是字段被删除）
export const hasSecondGroupControl = (groupsetting, controls) => {
  if (groupsetting) {
    const controlId = (safeParse(groupsetting)[0] || {}).controlId;
    return _.findIndex(controls, item => item.controlId === controlId) > -1;
  }
  return false;
};

export const getViewSelectFields = (controls, worksheetInfo, view) => {
  return filterAndFormatterControls({
    controls,
    filter: o => canSetGroup(o, worksheetInfo.worksheetId, view),
    formatter: ({ controlName, controlId, type }) => ({
      text: controlName,
      value: controlId,
      icon: getIconByType(type, false),
    }),
  });
};

export const canEditForGroupControl = props => {
  const { allowAdd = false, control = {} } = props;
  if (_.get(window, 'shareState.shareId') || control?.type === 30) return false;
  const { fieldPermission = '111', controlPermissions = '111' } = control;
  return allowAdd && (fieldPermission || '111')[1] === '1' && (controlPermissions || '111')[1] === '1';
};
