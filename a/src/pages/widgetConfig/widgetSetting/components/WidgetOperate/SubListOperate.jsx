import React, { Fragment, useEffect, useState } from 'react';
import { Checkbox, Dropdown } from 'ming-ui';
import { Tooltip } from 'antd';
import { SettingItem } from '../../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';

const DEFAULT_SETTING_OPTIONS = [
  { text: _l('可新增明细'), id: 'allowadd' },
  { text: _l('可编辑已有明细'), id: 'allowedit' },
  { text: _l('可删除已有明细'), id: 'allowcancel' },
];

export default function SubListOperate(props) {
  const { data, onChange } = props;
  const { advancedSetting = {}, relationControls = [], controlId } = data;
  const { allowadd, allowsingle, allowexport = '1' } = advancedSetting;
  const batchcids = getAdvanceSetting(data, 'batchcids') || [];
  const [visible, setVisible] = useState(batchcids.length > 0);

  const worksheetControls = relationControls
    .filter(item => item.type === 29)
    .map(({ controlId: value, controlName: text }) => ({ value, text }));

  useEffect(() => {
    setVisible(batchcids.length > 0);
  }, [controlId]);

  useEffect(() => {
    // 兼容老数据
    if (_.isUndefined(allowsingle) && !batchcids.length) {
      onChange(handleAdvancedSettingChange(data, { allowsingle: '1' }));
    }
  }, [allowsingle]);

  return (
    <Fragment>
      {DEFAULT_SETTING_OPTIONS.map(item => {
        return (
          <div className="labelWrap">
            <Checkbox
              size="small"
              text={item.text}
              checked={advancedSetting[item.id] === '1'}
              onClick={checked =>
                onChange(
                  handleAdvancedSettingChange(data, {
                    [item.id]: checked ? '0' : '1',
                  }),
                )
              }
            />
          </div>
        );
      })}
      <div className="labelWrap">
        <Checkbox
          size="small"
          checked={allowexport === '1'}
          text={_l('允许导出')}
          onClick={checked => {
            onChange(
              handleAdvancedSettingChange(data, {
                allowexport: checked ? '0' : '1',
              }),
            );
          }}
        />
      </div>
      {allowadd === '1' && (
        <SettingItem>
          <div className="settingItemTitle">{_l('新增方式')}</div>
          <div className="labelWrap">
            <Checkbox
              size="small"
              checked={allowsingle === '1'}
              text={_l('单行添加')}
              onClick={checked => {
                if (checked && !batchcids.length) return;
                onChange(
                  handleAdvancedSettingChange(data, {
                    allowsingle: checked ? '0' : '1',
                  }),
                );
              }}
            />
          </div>
          <div className="labelWrap">
            <Checkbox
              size="small"
              checked={visible}
              text={_l('批量选择添加')}
              onClick={checked => {
                if (checked && allowsingle !== '1') return;
                setVisible(!checked);
                if (checked) {
                  onChange(
                    handleAdvancedSettingChange(data, {
                      batchcids: JSON.stringify([]),
                    }),
                  );
                }
              }}
            >
              <Tooltip
                placement={'bottom'}
                title={_l(
                  '如：在添加订单明细时需要先选择关联的产品。此时您可以设置为从产品字段添加明细。设置后，您可以直接一次选择多个产品，并为每个产品都添加一行订单明细',
                )}
              >
                <i className="icon-help Gray_bd Font16 pointer"></i>
              </Tooltip>
            </Checkbox>
          </div>
          {visible && (
            <Dropdown
              border
              style={{ marginTop: '10px' }}
              trigger={['click']}
              placeholder={_l('选择子表中的关联记录字段')}
              noneContent={_l('没有可选字段')}
              value={batchcids[0] || undefined}
              data={worksheetControls}
              onChange={value => {
                onChange(
                  handleAdvancedSettingChange(data, {
                    batchcids: JSON.stringify([value]),
                  }),
                );
              }}
            />
          )}
        </SettingItem>
      )}
    </Fragment>
  );
}
