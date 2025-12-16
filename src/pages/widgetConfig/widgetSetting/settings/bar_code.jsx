import React, { Fragment, useEffect, useState } from 'react';
import { Input } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Dropdown, RadioGroup } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import WidgetDropdown from '../../components/Dropdown';
import { SettingItem } from '../../styled';
import { getIconByType, parseDataSource } from '../../util';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';

const CODE_DISPLAY_OPTION = [
  {
    value: 1,
    text: _l('条形码'),
  },
  { value: 2, text: _l('二维码') },
];

// 游离子表不支持内部访问链接
const CODE_DATA_OPTION = [
  {
    value: 1,
    text: _l('记录内部访问链接'),
  },
  { value: 3, text: _l('字段值') },
];

const CODE_FAULTRATE_OPTION = ['7%', '15%', '25%', '30%'];

const CAN_AS_DATA_SOURCE_CONTROL = [2, 3, 4, 5, 7, 32, 33];

export default function BarCode({ data, onChange, allControls, from, subListData }) {
  const { enumDefault, enumDefault2, dataSource, controlId } = data;
  const { width, faultrate } = getAdvanceSetting(data);
  const [tempWidth, setTempWidth] = useState(width);

  useEffect(() => {
    setTempWidth(width);
  }, [controlId]);

  const filterControls = allControls
    .filter(
      item =>
        _.includes(CAN_AS_DATA_SOURCE_CONTROL, item.type) ||
        (item.type === 30 && _.includes(CAN_AS_DATA_SOURCE_CONTROL, item.sourceControlType)),
    )
    .map(item => ({ value: item.controlId, text: item.controlName, icon: getIconByType(item.type) }));

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('类型')}</div>
        <RadioGroup
          size="middle"
          checkedValue={enumDefault}
          data={CODE_DISPLAY_OPTION}
          onChange={value => {
            if (value === 1) {
              onChange({ enumDefault: value, enumDefault2: 0, dataSource: '' });
            } else {
              onChange({
                ...handleAdvancedSettingChange(data, { faultrate: '30%' }),
                enumDefault: value,
                enumDefault2: 0,
                dataSource: '',
              });
            }
          }}
        />
        <div className="Gray_9e mTop10">
          {enumDefault === 1
            ? _l('编码方式：code128，仅支持数字、字母、符号，最大包含128个字符')
            : _l('编码方式：QR-code，可支持汉字，最大包含150个字')}
        </div>
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('数据源')}</div>
        {enumDefault === 2 && (
          <Dropdown
            border
            data={
              from === 'subList' && _.get(subListData, 'advancedSetting.detailworksheettype') === '2'
                ? CODE_DATA_OPTION.filter(c => c.value !== 1)
                : CODE_DATA_OPTION
            }
            value={enumDefault2 || undefined}
            onChange={value => onChange({ enumDefault2: value, dataSource: value === 1 ? '' : dataSource })}
          />
        )}
        {(enumDefault === 1 || (enumDefault === 2 && enumDefault2 === 3)) && (
          <WidgetDropdown
            border
            searchable
            data={[{ value: 'rowid', text: _l('记录ID'), icon: 'text_bold2' }].concat(filterControls)}
            value={parseDataSource(dataSource)}
            placeholder={_l('请选择字段')}
            renderDisplay={value => {
              const originControl = filterControls.find(item => item.value === value);
              const controlName = value === 'rowid' ? _l('记录ID') : _.get(originControl, 'text');
              return (
                <div className={cx('text', { Red: !controlName })}>{!controlName ? _l('字段已删除') : controlName}</div>
              );
            }}
            onChange={value => onChange({ dataSource: `$${value}$` })}
          />
        )}
      </SettingItem>
      {enumDefault === 2 && (
        <SettingItem>
          <div className="settingItemTitle">
            {_l('容错率')}
            <Tooltip
              placement="bottom"
              title={
                <span>
                  {_l(
                    '容错率是指二维码被遮挡多少后，仍可以扫描出来的能力。容错率越高，二维码越容易被扫描，二维码图片也越复杂。',
                  )}
                </span>
              }
            >
              <i className="icon-help Gray_9e Font16 pointer"></i>
            </Tooltip>
          </div>
          <Dropdown
            border
            data={CODE_FAULTRATE_OPTION.map(i => ({ value: i, text: i }))}
            value={faultrate}
            onChange={value => onChange(handleAdvancedSettingChange(data, { faultrate: value }))}
          />
        </SettingItem>
      )}
      <SettingItem>
        <div className="settingItemTitle">{_l('最大宽')}</div>
        <div className="labelWrap flexCenter">
          <Input
            value={tempWidth}
            style={{ width: 100, marginRight: '10px' }}
            onChange={e => {
              const value = e.target.value.trim();
              setTempWidth(value.replace(/[^\d]/g, ''));
            }}
            onBlur={e => {
              let value = e.target.value.trim();
              if (!value) {
                value = width || 160;
              }
              setTempWidth(value);
              onChange(handleAdvancedSettingChange(data, { width: value }));
            }}
          />
          <span>px</span>
        </div>
      </SettingItem>
    </Fragment>
  );
}
