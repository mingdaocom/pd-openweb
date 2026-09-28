import React, { Fragment, useState } from 'react';
import _ from 'lodash';
import { Input, Radio, Select, Tooltip } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { getIconByType, parseDataSource } from 'src/utils/domain/control/metadata';
import { SettingItem } from '../../styled';

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
    label: _l('记录内部访问链接'),
  },
  { value: 3, label: _l('字段值') },
];

const CODE_FAULTRATE_OPTIONS = ['7%', '15%', '25%', '30%'].map(value => ({ value, label: value }));

const CAN_AS_DATA_SOURCE_CONTROL = [2, 3, 4, 5, 7, 32, 33];

function BarCodeContent({ data, onChange, allControls, from, subListData }) {
  const { enumDefault, enumDefault2, dataSource } = data;
  const { width, faultrate } = getAdvanceSetting(data);
  const [tempWidth, setTempWidth] = useState(width);

  const filterControls = allControls
    .filter(
      item =>
        _.includes(CAN_AS_DATA_SOURCE_CONTROL, item.type) ||
        (item.type === 30 && _.includes(CAN_AS_DATA_SOURCE_CONTROL, item.sourceControlType)),
    )
    .map(item => ({ value: item.controlId, label: item.controlName, icon: getIconByType(item.type) }));
  const dataSourceValue = parseDataSource(dataSource);
  const dataSourceOptions = [{ value: 'rowid', label: _l('记录ID'), icon: 'text_bold2' }, ...filterControls];
  const dataSourceDeleted = dataSourceValue && !dataSourceOptions.some(item => item.value === dataSourceValue);

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('类型')}</div>
        <Radio.Group
          size="middle"
          value={enumDefault}
          options={(CODE_DISPLAY_OPTION || []).map(({ text, ...option }) => ({ ...option, label: text }))}
          onChange={event => {
            const value = event.target.value;

            if (value === 1) {
              onChange({
                enumDefault: value,
                enumDefault2: 0,
                dataSource: '',
              });
            } else {
              onChange({
                ...handleAdvancedSettingChange(data, {
                  faultrate: '30%',
                }),
                enumDefault: value,
                enumDefault2: 0,
                dataSource: '',
              });
            }
          }}
        />
        <div className="textTertiary mTop10">
          {enumDefault === 1
            ? _l('编码方式：code128，仅支持数字、字母、符号，最大包含128个字符')
            : _l('编码方式：QR-code，可支持汉字，最大包含250个字')}
        </div>
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('数据源')}</div>
        {enumDefault === 2 && (
          <Select
            className="w100"
            options={
              from === 'subList' && _.get(subListData, 'advancedSetting.detailworksheettype') === '2'
                ? CODE_DATA_OPTION.filter(c => c.value !== 1)
                : CODE_DATA_OPTION
            }
            value={enumDefault2 || undefined}
            onChange={value => onChange({ enumDefault2: value, dataSource: value === 1 ? '' : dataSource })}
          />
        )}
        {(enumDefault === 1 || (enumDefault === 2 && enumDefault2 === 3)) && (
          <Select
            className="w100 mTop10"
            showPopupSearch
            optionFilterProp="label"
            options={dataSourceOptions}
            value={dataSourceValue || undefined}
            placeholder={_l('请选择字段')}
            status={dataSourceDeleted ? 'error' : undefined}
            labelRender={({ label }) =>
              dataSourceDeleted ? <span className="textError">{_l('字段已删除')}</span> : label
            }
            optionRender={({ data: item }) => (
              <div className="flexRow alignItemsCenter">
                <i className={`icon-${item.icon} Font16 textTertiary mRight8`} />
                <span className="overflow_ellipsis">{item.label}</span>
              </div>
            )}
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
              <i className="icon-help textTertiary Font16 pointer"></i>
            </Tooltip>
          </div>
          <Select
            className="w100"
            options={CODE_FAULTRATE_OPTIONS}
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

export default function BarCode(props) {
  return <BarCodeContent key={props.data.controlId} {...props} />;
}
