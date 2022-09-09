import React from 'react';
import { Checkbox } from 'ming-ui';
import { Tooltip } from 'antd';
import Icon from 'src/components/Icon';
import { NOT_NEED_SET_READONLY_CONTROL } from '../../config';
import { updateConfig } from '../../util/setting';
import { SettingItem } from '../../styled';

export default ({ from, data, info, onChange }) => {
  let { fieldPermission = '111', type } = data || {};
  fieldPermission = fieldPermission || '111';
  const [visible, editable, canAdd] = fieldPermission.split('');
  return (
    <SettingItem className="withSplitLine">
      <div className="settingItemTitle">
        <span>{_l('字段属性')}</span>
      </div>
      {((type === 43 && editable === '0') || !_.includes(NOT_NEED_SET_READONLY_CONTROL, type)) && (
        <div className="labelWrap">
          <Checkbox
            className="customWidgetCheckbox"
            size="small"
            checked={editable === '0'}
            onClick={checked =>
              onChange({
                fieldPermission: updateConfig({
                  config: fieldPermission,
                  value: +checked,
                  index: 1,
                }),
              })
            }
          >
            <span style={{ marginRight: '4px' }}>{_l('只读')}</span>
            <Tooltip
              placement="bottom"
              title={_l('设为只读的字段将不允许被用户直接编辑。但仍可以在自定义按钮和工作流中填写或更新')}
            >
              <Icon icon="help" />
            </Tooltip>
          </Checkbox>
        </div>
      )}
      <div className="labelWrap">
        <Checkbox
          className="customWidgetCheckbox"
          size="small"
          checked={visible === '0'}
          onClick={checked =>
            onChange({
              fieldPermission: updateConfig({
                config: fieldPermission,
                value: +checked,
                index: 0,
              }),
            })
          }
        >
          <span style={{ marginRight: '4px' }}>{_l('隐藏')}</span>
          <Tooltip
            placement="bottom"
            title={_l('设为隐藏的字段将不会对用户直接显示。但仍可以在自定义按钮和工作流中调用')}
          >
            <Icon icon="help" />
          </Tooltip>
        </Checkbox>
      </div>

      {from !== 'subList' && (
        <div className="labelWrap">
          <Checkbox
            className="customWidgetCheckbox"
            size="small"
            checked={canAdd === '0'}
            onClick={checked =>
              onChange({
                fieldPermission: updateConfig({
                  config: fieldPermission,
                  value: +checked,
                  index: 2,
                }),
              })
            }
          >
            <span style={{ marginRight: '4px' }}>{_l('新增记录时隐藏')}</span>
            <Tooltip
              placement="bottom"
              title={_l(
                '通常用于隐藏一些不需要在新增记录时显示的字段。如：用于新订单的后续处理的字段，可以在新增记录时隐藏。',
              )}
            >
              <Icon icon="help" />
            </Tooltip>
          </Checkbox>
        </div>
      )}
    </SettingItem>
  );
};
