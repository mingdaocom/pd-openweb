import React, { Fragment } from 'react';
import { Checkbox } from 'ming-ui';
import { Tooltip } from 'antd';
import { SettingItem } from '../../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../util/setting';
import TelConfig from './TelConfig';
import UserConfig from './UserConfig';
import DateConfig from './DateConfig';
import TimeConfig from './TimeConfig';
import ScoreConfig from './ScoreConfig';
import DropConfig from './DropConfig';
import _ from 'lodash';

const TYPE_TO_COMP = {
  3: TelConfig,
  15: DateConfig,
  16: DateConfig,
  26: UserConfig,
  28: ScoreConfig,
  46: TimeConfig,
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
  const { data, onChange } = props;
  const { type, enumDefault, advancedSetting = {}, strDefault } = data;
  const { showxy, showtype, analysislink, uselast } = getAdvanceSetting(data);

  const getConfig = () => {
    if (type === 2 || type === 32) {
      return (
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={analysislink === '1'}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { analysislink: checked ? '0' : '1' }))}
          >
            <span>{_l('解析链接')}</span>
          </Checkbox>
        </div>
      );
    }
    if (_.includes([9, 10, 11], type)) {
      return <DropConfig {...props} />;
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
              disabled={(strDefault || '00')[0] === '1'}
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
            onClick={checked => onChange(handleAdvancedSettingChange(data, { [key]: +!checked }))}
          >
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
    if (type === 42) {
      return (
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={uselast === '1'}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { uselast: String(+!checked) }))}
          >
            <span>{_l('允许使用上次的签名')}</span>
          </Checkbox>
        </div>
      );
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
