import React, { Fragment } from 'react';
import _ from 'lodash';
import { Checkbox, Tooltip } from 'ming-ui/antd-components';
import { NOT_NEED_SET_READONLY_CONTROL } from 'src/utils/domain/control/config';
import { updateConfig } from 'src/utils/domain/control/editorSetting';
import AutoIcon from '../../components/Icon';

export default ({ from, data, onChange }) => {
  let { fieldPermission = '111', type } = data || {};
  fieldPermission = fieldPermission || '111';
  const [visible, editable, canAdd] = fieldPermission.split('');
  return (
    <Fragment>
      {((type === 43 && editable === '0') || !_.includes(NOT_NEED_SET_READONLY_CONTROL, type)) && (
        <div className="labelWrap">
          <Checkbox
            className="customWidgetCheckbox"
            checked={editable === '0'}
            onChange={event =>
              onChange({
                fieldPermission: updateConfig({
                  config: fieldPermission,
                  value: +!event.target.checked,
                  index: 1,
                }),
              })
            }
            size="small"
          >
            <span style={{ marginRight: '4px' }}>{_l('只读')}</span>
            <Tooltip
              placement="bottom"
              title={
                type === 52
                  ? _l('设为只读后，标签页内所有字段均为只读。但仍可在自定义按钮和工作流中编辑')
                  : _l('设为只读的字段将不允许被用户直接编辑。但仍可以在自定义按钮和工作流中填写或更新')
              }
            >
              <AutoIcon icon="help" />
            </Tooltip>
          </Checkbox>
        </div>
      )}
      <div className="labelWrap">
        <Checkbox
          className="customWidgetCheckbox"
          checked={visible === '0'}
          onChange={event =>
            onChange({
              fieldPermission: updateConfig({
                config: fieldPermission,
                value: +!event.target.checked,
                index: 0,
              }),
            })
          }
          size="small"
        >
          <span style={{ marginRight: '4px' }}>{_l('隐藏')}</span>
          <Tooltip
            placement="bottom"
            title={_l('设为隐藏的字段将不会对用户直接显示。但仍可以在自定义按钮和工作流中调用')}
          >
            <AutoIcon icon="help" />
          </Tooltip>
        </Checkbox>
      </div>

      {from !== 'subList' && (
        <div className="labelWrap">
          <Checkbox
            className="customWidgetCheckbox"
            checked={canAdd === '0'}
            onChange={event =>
              onChange({
                fieldPermission: updateConfig({
                  config: fieldPermission,
                  value: +!event.target.checked,
                  index: 2,
                }),
              })
            }
            size="small"
          >
            <span style={{ marginRight: '4px' }}>{_l('新增记录时隐藏')}</span>
            <Tooltip
              placement="bottom"
              title={_l(
                '通常用于隐藏一些不需要在新增记录时显示的字段。如：用于新订单的后续处理的字段，可以在新增记录时隐藏。',
              )}
            >
              <AutoIcon icon="help" />
            </Tooltip>
          </Checkbox>
        </div>
      )}
    </Fragment>
  );
};
