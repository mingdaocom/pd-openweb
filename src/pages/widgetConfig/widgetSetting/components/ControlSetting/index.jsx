import React, { Fragment } from 'react';
import { Checkbox } from 'ming-ui';
import { Tooltip } from 'antd';
import { SettingItem } from '../../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../util/setting';
import TelConfig from './TelConfig';
import UserConfig from './UserConfig';
import DateConfig from './DateConfig';

const TYPE_TO_COMP = {
  3: TelConfig,
  15: DateConfig,
  16: DateConfig,
  26: UserConfig,
};

const CASCADER_CONFIG = [
  {
    text: _l('必须选择到最后一级'),
    key: 'anylevel',
  },
  {
    text: _l('选择结果显示层级路径'),
    tip: _l('勾选后，将呈现选项路径。例：上海市/徐汇区/漕河泾'),
    key: 'allpath',
  },
  // {
  //   text: _l('允许查看记录'),
  //   key: 'allowlink',
  // },
];

export default function WidgetConfig(props) {
  const { from, data, onChange } = props;
  const { type, enumDefault, advancedSetting = {} } = data;
  const { allowadd, showxy, showtype, checktype } = getAdvanceSetting(data);

  const getConfig = () => {
    if (type === 6) {
      return (
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={enumDefault !== 1}
            onClick={checked => onChange({ enumDefault: checked ? 1 : 0 })}
            text={_l('显示千分位')}
          />
        </div>
      );
    }
    if (type === 11 || (type === 10 && checktype === '1')) {
      return (
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={allowadd === '1'}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { allowadd: checked ? '0' : '1' }))}>
            <span>{_l('允许用户增加选项')}</span>
            <Tooltip placement={'bottom'} title={_l('勾选后，用户填写时可输入不在备选项中的内容，并添加至选项列表')}>
              <i className="icon-help tipsIcon Gray_9e Font16 pointer"></i>
            </Tooltip>
          </Checkbox>
        </div>
      );
    }
    if (type === 40) {
      return (
        <Fragment>
          <div className="labelWrap">
            <Checkbox
              checked={Boolean(enumDefault)}
              size={'small'}
              text={_l('显示地图')}
              onClick={checked => onChange({ enumDefault: +!checked })}
            />
          </div>
          <div className="labelWrap">
            <Checkbox
              checked={showxy === '1'}
              size={'small'}
              text={_l('显示经纬度')}
              onClick={checked => {
                onChange(handleAdvancedSettingChange(data, { showxy: checked ? '0' : '1' }));
              }}
            />
          </div>
        </Fragment>
      );
    }
    if (type === 35) {
      return (String(showtype) === '4' ? CASCADER_CONFIG.slice(1) : CASCADER_CONFIG).map(({ text, tip, key }) => (
        <div key={key} className="labelWrap">
          <Checkbox
            size="small"
            checked={String(advancedSetting[key]) === '1'}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { [key]: +!checked }))}>
            <span>{text}</span>
            {tip && (
              <Tooltip placement="topLeft" title={tip} arrowPointAtCenter>
                <i className="icon-help Gray_bd Font15"></i>
              </Tooltip>
            )}
          </Checkbox>
        </div>
      ));
    }

    const Comp = TYPE_TO_COMP[type];
    return <Comp {...props} />;
  };
  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('设置')}</div>
      {getConfig()}
    </SettingItem>
  );
}
