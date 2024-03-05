import { isEmpty } from 'lodash';
import { getAdvanceSetting } from 'src/util';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import { RENDER_RECORD_NECESSARY_ATTR, filterAndFormatterControls, getRecordAttachments } from '../util';
import { CAN_AS_BOARD_OPTION } from './config';
import { getRecordColorConfig } from 'worksheet/util';
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
  const { abstract = '' } = getAdvanceSetting(view);
  const titleControl = _.find(controls, item => item.attribute === 1);
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
            abstractValue: abstract
              ? renderCellText({
                  ...(controls.find(it => it.controlId === abstract) || {}),
                  value: parsedRow[abstract],
                })
              : '',
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
  if (type === 26) {
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
