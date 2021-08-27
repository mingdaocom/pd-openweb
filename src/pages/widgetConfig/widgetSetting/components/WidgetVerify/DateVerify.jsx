import React, { Fragment, useState, useEffect } from 'react';
import cx from 'classnames';
import { Checkbox } from 'ming-ui';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import update from 'immutability-helper';
import { Dropdown } from 'antd';
import { keys, includes, isEmpty, findIndex } from 'lodash';
import { DropdownContent, DropdownPlaceholder } from '../../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';

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
  const { allowweek = '', allowtime = '' } = getAdvanceSetting(data);
  const [{ weekVisible, startTimeVisible, endTimeVisible }, setVisible] = useSetState({
    weekVisible: false,
    startTimeVisible: false,
    endTimeVisible: false,
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
  return (
    <Fragment>
      <div className="labelWrap">
        <Checkbox
          size="small"
          checked={allowweek}
          onClick={checked => onChange(handleAdvancedSettingChange(data, { allowweek: checked ? '' : '1234567' }))}>
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
                    }>
                    {WEEKDAYS[key]}
                  </Checkbox>
                </div>
              ))}
            </WeekWrap>
          }>
          <DropdownPlaceholder className={cx({ active: weekVisible })} style={{ marginBottom: '12px' }} color="#333">
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
      {type === 16 && (
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
            <div className="timeFieldWrap">
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
                          className={cx('item', { disabled })}
                          onClick={() => {
                            if (disabled) return;
                            setVisible({ startTimeVisible: false });
                            onChange(handleAdvancedSettingChange(data, { allowtime: `${v}-${nextVal}` }));
                          }}>
                          {v}
                        </div>
                      );
                    })}
                  </WeekWrap>
                }>
                <DropdownPlaceholder className={cx('flex', { active: startTimeVisible })} color="#333">
                  {allowtime.split('-')[0]}
                </DropdownPlaceholder>
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
                          className={cx('item', { disabled })}
                          onClick={() => {
                            if (disabled) return;
                            setVisible({ endTimeVisible: false });
                            onChange(handleAdvancedSettingChange(data, { allowtime: ` ${preVal}-${v}` }));
                          }}>
                          {v}
                        </div>
                      );
                    })}
                  </WeekWrap>
                }>
                <DropdownPlaceholder className={cx('flex', { active: endTimeVisible })} color="#333">
                  {allowtime.split('-')[1]}
                </DropdownPlaceholder>
              </Dropdown>
            </div>
          )}
        </Fragment>
      )}
    </Fragment>
  );
}
