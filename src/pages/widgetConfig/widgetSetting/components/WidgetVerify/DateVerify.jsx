import React, { Fragment, useState, useEffect } from 'react';
import cx from 'classnames';
import { Checkbox } from 'ming-ui';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import update from 'immutability-helper';
import { Dropdown, Input } from 'antd';
import { keys, includes, isEmpty, findIndex } from 'lodash';
import { DropdownContent, DropdownPlaceholder } from '../../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import { compareWithTime } from 'src/components/newCustomFields/tools/utils';

const WeekWrap = styled(DropdownContent)`
  max-height: 280px;
  overflow: auto;
  .weekItem {
    line-height: 36px;
    padding: 0 16px;
    cursor: pointer;
    &:hover {
      background-color: #f5f5f5;
    }
  }
`;

const TIME_FIELD = [
  '00:00',
  '01:00',
  '02:00',
  '03:00',
  '04:00',
  '05:00',
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
  '24:00',
];
const WEEKDAYS = {
  1: _l('周一'),
  2: _l('周二'),
  3: _l('周三'),
  4: _l('周四'),
  5: _l('周五'),
  6: _l('周六'),
  7: _l('周日'),
};

export default function DateVerify({ data, onChange }) {
  const { type } = data;
  const { allowweek = '', allowtime = '', showtype } = getAdvanceSetting(data);
  const needHide = _.includes(['4', '5'], showtype);
  const [originStart, originEnd] = allowtime.split('-');
  const [{ weekVisible, startTimeVisible, endTimeVisible }, setVisible] = useSetState({
    weekVisible: false,
    startTimeVisible: false,
    endTimeVisible: false,
  });
  const [{ startTime, endTime }, setTime] = useSetState({
    startTime: originStart,
    endTime: originEnd,
  });
  const handleWeekChange = key => {
    const weeks = allowweek.split('');
    if (isEmpty(weeks)) {
      return key;
    }
    const index = findIndex(weeks, item => item === key);
    if (index > -1) {
      return update(weeks, { $splice: [[index, 1]] }).join('');
    }
    const idx = findIndex(weeks, item => +item > +key);
    return update(weeks, { $splice: [[idx, 0, key]] }).join('');
  };
  const handleTimeChange = (e, key) => {
    let value = e.target.value.trim();
    const reg = /^\D*(?:\d{0,2}(?:\:\d{0,2})?)$/;
    if (value === '' || reg.test(value)) {
      setTime({ [key]: value });
    }
  };
  const handleTimeBlur = (e, key) => {
    const value = e.target.value.trim();
    const formatValue = value
      .split(':')
      .map(c => c.padStart(2, 0))
      .join(':');
    let [startVal, endVal] = allowtime.split('-');
    if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(formatValue)) {
      if (key === 'startTime' && compareWithTime(formatValue, endVal, 'isBefore')) {
        startVal = formatValue;
      }
      if (key === 'endTime' && compareWithTime(startVal, formatValue, 'isBefore')) {
        endVal = formatValue;
      }
    }
    setTime({ startTime: startVal, endTime: endVal });
    onChange(handleAdvancedSettingChange(data, { allowtime: `${startVal}-${endVal}` }));
  };
  useEffect(() => {
    setTime({
      startTime: originStart,
      endTime: originEnd,
    });
  }, [allowtime]);
  useEffect(() => {
    if (type === 15) {
      onChange(handleAdvancedSettingChange(data, { allowtime: '' }));
    }
  }, [type]);
  return (
    <Fragment>
      {type !== 46 && !needHide && (
        <Fragment>
          <div className="labelWrap">
            <Checkbox
              size="small"
              checked={allowweek}
              onClick={checked => onChange(handleAdvancedSettingChange(data, { allowweek: checked ? '' : '1234567' }))}
            >
              <span>{_l('允许选择的星期')}</span>
            </Checkbox>
          </div>
          {allowweek && (
            <Dropdown
              trigger={['click']}
              visible={weekVisible}
              onVisibleChange={visible => setVisible({ weekVisible: visible })}
              overlay={
                <WeekWrap onClick={e => e.stopPropagation()}>
                  {keys(WEEKDAYS).map((key, index) => (
                    <div key={key} className="weekItem">
                      <Checkbox
                        checked={includes(allowweek, key)}
                        onClick={checked =>
                          onChange(
                            handleAdvancedSettingChange(data, {
                              allowweek: handleWeekChange(key),
                            }),
                          )
                        }
                      >
                        {WEEKDAYS[key]}
                      </Checkbox>
                    </div>
                  ))}
                </WeekWrap>
              }
            >
              <DropdownPlaceholder
                className={cx({ active: weekVisible })}
                style={{ marginBottom: '12px' }}
                color="#333"
              >
                {allowweek.length === 7
                  ? _l('每天')
                  : allowweek
                      .split('')
                      .map(key => WEEKDAYS[key])
                      .join('     ')}
                <i className="icon-arrow-down-border Font16 Gray_9e"></i>
              </DropdownPlaceholder>
            </Dropdown>
          )}
        </Fragment>
      )}
      {_.includes([16], type) && (
        <Fragment>
          <div className="labelWrap">
            <Checkbox
              size="small"
              checked={allowtime}
              onClick={checked =>
                onChange(handleAdvancedSettingChange(data, { allowtime: checked ? '' : '00:00-24:00' }))
              }
              text={_l('允许选择的时段')}
            />
          </div>
          {allowtime && (
            <div className="timeFieldWrap flexRow">
              <Dropdown
                visible={startTimeVisible}
                onVisibleChange={v => setVisible({ startTimeVisible: v })}
                trigger="click"
                overlay={
                  <WeekWrap>
                    {TIME_FIELD.map(v => {
                      const nextVal = allowtime.split('-')[1];
                      const disabled = parseFloat(v) >= parseFloat(nextVal);
                      return (
                        <div
                          key={v}
                          className={cx('item', { disabled })}
                          onClick={e => {
                            e.preventDefault();
                            if (disabled) return;
                            setVisible({ startTimeVisible: false });
                            onChange(handleAdvancedSettingChange(data, { allowtime: `${v}-${nextVal}` }));
                          }}
                        >
                          {v}
                        </div>
                      );
                    })}
                  </WeekWrap>
                }
              >
                <Input
                  className="mTop12 allowTimeSelect1"
                  onFocus={() => {
                    document.getElementsByClassName('allowTimeSelect1')[0].select();
                  }}
                  value={startTime}
                  onChange={e => handleTimeChange(e, 'startTime')}
                  onBlur={e => handleTimeBlur(e, 'startTime')}
                />
              </Dropdown>
              <span>-</span>
              <Dropdown
                trigger="click"
                visible={endTimeVisible}
                onVisibleChange={v => setVisible({ endTimeVisible: v })}
                overlay={
                  <WeekWrap>
                    {TIME_FIELD.map(v => {
                      const preVal = allowtime.split('-')[0];
                      const disabled = parseFloat(v) <= parseFloat(preVal);
                      return (
                        <div
                          key={v}
                          className={cx('item', { disabled })}
                          onClick={e => {
                            e.preventDefault();
                            if (disabled) return;
                            setVisible({ endTimeVisible: false });
                            onChange(handleAdvancedSettingChange(data, { allowtime: ` ${preVal}-${v}` }));
                          }}
                        >
                          {v}
                        </div>
                      );
                    })}
                  </WeekWrap>
                }
              >
                <Input
                  className="mTop12 allowTimeSelect2"
                  value={endTime}
                  onFocus={() => {
                    document.getElementsByClassName('allowTimeSelect2')[0].select();
                  }}
                  onChange={e => handleTimeChange(e, 'endTime')}
                  onBlur={e => handleTimeBlur(e, 'endTime')}
                />
              </Dropdown>
            </div>
          )}
        </Fragment>
      )}
    </Fragment>
  );
}
