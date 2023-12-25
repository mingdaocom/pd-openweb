import React, { Fragment, useState } from 'react';
import { Checkbox, ClickAway } from 'ming-ui';
import { Tooltip } from 'antd';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../../util/setting';
import PointerConfig from '../../PointerConfig';
import styled from 'styled-components';
import cx from 'classnames';
import _ from 'lodash';

const WeekdayWrap = styled.ul`
   {
    position: absolute;
    top: 30px;
    z-index: 1;
    width: 170px;
    padding: 7px 0;
    border-radius: 3px;
    background-color: #fff;
    cursor: pointer;
    box-shadow: 0 3px 12px rgb(0, 0, 0, 0.16);
    li {
      line-height: 24px;
      padding: 6px 12px;
      min-height: 36px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      &:hover,
      &.active {
        background-color: #e6f4ff;
        .icon-done {
          color: #2196f3;
        }
      }
    }
  }
`;

const pointerStr = '2345';
const weekdayStr = '123';
const WEEKDAY_TYPE = [
  { text: _l('周一'), value: '1' },
  { text: _l('周二'), value: '2' },
  { text: _l('周三'), value: '3' },
  { text: _l('周四'), value: '4' },
  { text: _l('周五'), value: '5' },
  { text: _l('周六'), value: '6' },
  { text: _l('周日'), value: '7' },
];

export default function WeekdaySetting({ data, onChange }) {
  const { unit, enumDefault } = data;
  const { weekday = '', autocarry = '0', hideneg = '0' } = getAdvanceSetting(data);
  const [visible, setVisible] = useState(false);
  const weekdayArr = weekday.split('');

  const handleChange = value => {
    onChange(handleAdvancedSettingChange(data, { weekday: value }));
  };

  const formatWeekdayToText = () => {
    let weekdayText = [];
    let isContinue = true;
    weekdayArr.map((item, index) => {
      if (index !== weekdayArr.length - 1 && Number(item) + 1 !== Number(weekdayArr[index + 1])) {
        isContinue = false;
      }
      const text = _.get(
        _.find(WEEKDAY_TYPE, we => we.value === item),
        'text',
      );
      text && weekdayText.push(text);
    });
    return isContinue && weekdayText.length > 1
      ? _l('%0至%1', weekdayText[0], weekdayText[weekdayText.length - 1])
      : weekdayText.join('、');
  };

  const renderPanel = () => {
    return (
      <ClickAway
        onClickAway={() => {
          setVisible(false);
          if (weekdayArr.length === 7) {
            handleChange('');
          }
        }}
      >
        <WeekdayWrap>
          {WEEKDAY_TYPE.map(({ text, value }) => {
            const isSelect = _.includes(weekdayArr, value);
            return (
              <li
                className={cx({ active: isSelect })}
                onClick={() => {
                  const newVal = isSelect ? weekdayArr.filter(i => i !== value) : weekdayArr.concat([value]);
                  handleChange(_.sortBy(newVal).join(''));
                }}
              >
                {text}
                {isSelect ? <span className="icon-done"></span> : null}
              </li>
            );
          })}
        </WeekdayWrap>
      </ClickAway>
    );
  };

  return (
    <Fragment>
      {!_.includes(['5'], unit) && (
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={autocarry === '1'}
            onClick={checked => {
              onChange(
                handleAdvancedSettingChange(data, {
                  autocarry: checked ? '0' : '1',
                  ...(!checked ? { prefix: '', suffix: '' } : {}),
                }),
              );
            }}
          >
            <span style={{ marginRight: '6px' }}>{_l('自动进位')}</span>
            <Tooltip
              popupPlacement="bottom"
              title={
                <span>{_l('超过12个月/24小时/60分钟的部分，分别进位为年/天/小时。如 90分钟 呈现为 1小时30分钟')}</span>
              }
            >
              <i className="icon-help Gray_bd Font16 pointer"></i>
            </Tooltip>
          </Checkbox>
        </div>
      )}
      {enumDefault === 3 && (
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={hideneg === '1'}
            onClick={checked => {
              onChange(handleAdvancedSettingChange(data, { hideneg: checked ? '0' : '1' }));
            }}
          >
            <span style={{ marginRight: '6px' }}>{_l('不显示负值')}</span>
            <Tooltip popupPlacement="bottom" title={<span>{_l('勾选后，当计算结果为负数时，则显示为空')}</span>}>
              <i className="icon-help Gray_bd Font16 pointer"></i>
            </Tooltip>
          </Checkbox>
        </div>
      )}
      <PointerConfig
        data={data}
        onChange={value => {
          if (value.advancedSetting) {
            onChange(value);
          } else {
            let newVal = value || {};
            if (!Number(value.dot)) {
              newVal.dotformat = '0';
            }
            onChange({ ...handleAdvancedSettingChange(data, newVal), ...value });
          }
        }}
      />
      {enumDefault === 1 && weekdayStr.indexOf(unit) > -1 && (
        <div className="flexRow mTop8">
          <Checkbox
            text={_l('仅计算工作日')}
            size="small"
            checked={!!weekday}
            onClick={checked => handleChange(!checked ? '12345' : '')}
          />
          {!!weekday && (
            <div className="Relative">
              <span className="Hand ThemeColor3 ThemeHoverColor2 mLeft8" onClick={() => setVisible(true)}>
                {formatWeekdayToText()}
              </span>
              {visible && renderPanel()}
            </div>
          )}
        </div>
      )}
    </Fragment>
  );
}
