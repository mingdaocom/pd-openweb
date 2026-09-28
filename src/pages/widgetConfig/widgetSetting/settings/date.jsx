import React, { Fragment, useEffect } from 'react';
import _ from 'lodash';
import { Checkbox, Radio, Select } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { getTimeZoneText } from 'src/utils/domain/control/date';
import { SettingItem } from '../../styled';
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
    label: _l('年'),
  },
  { value: '4', label: _l('年-月') },
  { value: '3', label: _l('年-月-日') },
];

const DATE_TIME_DISPLAY_OPTION = [
  {
    value: '2',
    label: _l('时'),
  },
  { value: '1', label: _l('时:分') },
  { value: '6', label: _l('时:分:秒') },
];

const getTimeZoneDisplay = timeZoneText => {
  return [
    { value: '0', label: _l('跟随当前用户的个人时区') },
    { value: '1', label: _l('跟随应用时区%0', timeZoneText) },
  ];
};

export default function Text(props) {
  const { data, globalSheetInfo = {}, onChange } = props;
  const { type, enumDefault2 } = data;
  const { showtype, timezonetype = '0', showtimezone = '0' } = getAdvanceSetting(data);
  const isDate = type === 15 || (type === 53 && enumDefault2 === 15);
  const timeZoneText = `（${getTimeZoneText({ advancedSetting: { ...data.advancedSetting, showtimezone: '1' } }, globalSheetInfo.appId)}）`;
  const appTimeZoneText = `（${getTimeZoneText({ advancedSetting: { ...data.advancedSetting, showtimezone: '1', timezonetype: '1' } }, globalSheetInfo.appId)}）`;

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
            <Select
              className="w100"
              options={DATE_DISPLAY_OPTION}
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
          <Select
            className="w100"
            options={DATE_TIME_DISPLAY_OPTION}
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
          <Radio.Group
            size="middle"
            value={data.type}
            options={(DISPLAY_OPTIONS || []).map(({ text, ...option }) => ({ ...option, label: text }))}
            onChange={event => {
              const value = event.target.value;

              return onChange({
                ...handleAdvancedSettingChange(
                  data,
                  value === 15
                    ? {
                        showtype: '3',
                        showtimezone: '0',
                      }
                    : {
                        showtype: '1',
                      },
                ),
                type: value,
              });
            }}
          />
        </SettingItem>
      )}
      {renderContent()}
      {type === 16 && (
        <Fragment>
          <SettingItem>
            <div className="settingItemTitle">{_l('时区')}</div>
            <Select
              className="w100"
              value={timezonetype}
              options={getTimeZoneDisplay(appTimeZoneText)}
              onChange={value => onChange(handleAdvancedSettingChange(data, { timezonetype: value }))}
            />
          </SettingItem>
          <div className="labelWrap mTop12">
            <Checkbox
              checked={showtimezone === '1'}
              onChange={event =>
                onChange(
                  handleAdvancedSettingChange(data, {
                    showtimezone: !event.target.checked ? '0' : '1',
                  }),
                )
              }
              size="small"
            >
              {_l('显示时区标识%0', timeZoneText)}
            </Checkbox>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
}
