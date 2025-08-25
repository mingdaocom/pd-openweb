import React, { Fragment, useEffect } from 'react';
import _ from 'lodash';
import { Dropdown, RadioGroup } from 'ming-ui';
import { SettingItem } from '../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';
import { DateHour12, ShowFormat } from '../components/WidgetHighSetting/ControlSetting/DateConfig';

const DISPLAY_OPTIONS = [
  {
    text: _l('日期'),
    value: 15,
  },
  {
    text: _l('日期时间'),
    value: 16,
  },
];

const DATE_DISPLAY_OPTION = [
  {
    value: '5',
    text: _l('年'),
  },
  { value: '4', text: _l('年-月') },
  { value: '3', text: _l('年-月-日') },
];

const DATE_TIME_DISPLAY_OPTION = [
  {
    value: '2',
    text: _l('时'),
  },
  { value: '1', text: _l('时:分') },
  { value: '6', text: _l('时:分:秒') },
];

export default function Text(props) {
  const { data, onChange } = props;
  const { type, enumDefault2 } = data;
  const { showtype } = getAdvanceSetting(data);
  const isDate = type === 15 || (type === 53 && enumDefault2 === 15);

  useEffect(() => {
    // 年、年-月类型隐藏星期、时段、分钟间隔
    if (_.includes(['4', '5'], showtype)) {
      onChange(handleAdvancedSettingChange(data, { allowweek: '', allowtime: '', timeinterval: '' }));
    }
  }, [showtype]);

  const renderContent = () => {
    if (isDate) {
      return (
        <Fragment>
          <SettingItem>
            <Dropdown
              border
              data={DATE_DISPLAY_OPTION}
              value={showtype}
              onChange={value => onChange(handleAdvancedSettingChange(data, { showtype: value }))}
            />
          </SettingItem>
          <ShowFormat {...props} />
        </Fragment>
      );
    }

    return (
      <Fragment>
        <ShowFormat {...props} />
        <SettingItem>
          <div className="settingItemTitle">{_l('时间格式')}</div>
          <Dropdown
            border
            data={DATE_TIME_DISPLAY_OPTION}
            value={showtype}
            onChange={value => onChange(handleAdvancedSettingChange(data, { showtype: value }))}
          />
        </SettingItem>
        <DateHour12 {...props} />
      </Fragment>
    );
  };

  return (
    <Fragment>
      {type !== 53 && (
        <SettingItem>
          <div className="settingItemTitle">{_l('类型')}</div>
          <RadioGroup
            size="middle"
            checkedValue={data.type}
            data={DISPLAY_OPTIONS}
            onChange={value =>
              onChange({ ...handleAdvancedSettingChange(data, { showtype: value === 15 ? '3' : '1' }), type: value })
            }
          />
        </SettingItem>
      )}
      {renderContent()}
    </Fragment>
  );
}
