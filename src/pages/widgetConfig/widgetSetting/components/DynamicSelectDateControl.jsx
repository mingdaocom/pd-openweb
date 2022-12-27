import React, { useState, useRef, Fragment } from 'react';
import { DatePicker, TagTextarea } from 'ming-ui';
import { includes, get, find } from 'lodash';
import styled from 'styled-components';
import { useSetState } from 'react-use';
import cx from 'classnames';
import 'moment/locale/zh-cn';
import { ControlTag } from '../../styled';
import { SYSTEM_DATE_CONTROL } from '../../config/widget';
import SelectControl from './SelectControl';
import { filterOnlyShowField } from 'src/pages/widgetConfig/util';
import moment from 'moment';

const DateInfoWrap = styled.div`
  display: flex;
  border: 1px solid #ccc;
  border-radius: 4px;
  .contentWrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 12px;
    flex: 1;
    height: 36px;
  }
  .clearValue {
    font-size: 18px;
    color: #757575;
    padding: 0 6px;
    cursor: pointer;
  }
  .dateInfo {
    &.isSelectPlainTime {
      width: 100%;
    }
  }
  .selectedDate {
    height: 36px;
    line-height: 36px;
  }
  .selectControl {
    width: 36px;
    text-align: center;
    line-height: 34px;
    font-size: 22px;
    border-left: 1px solid #ccc;
    color: #9e9e9e;
    cursor: pointer;
    &:hover {
      color: #2196f3;
    }
  }
`;

export default function DynamicSelectDateControl({ value, onChange, allControls, disableTimeControl = false }) {
  const [{ dateControlVisible }, setVisible] = useSetState({
    dateControlVisible: false,
  });
  const availableControls = allControls.concat(SYSTEM_DATE_CONTROL);
  const types = disableTimeControl ? [15, 16] : [15, 16, 46];
  const filteredControls = _.filter(
    availableControls,
    item =>
      includes(types, item.type) ||
      // 汇总日期
      includes(types, item.enumDefault2) ||
      // 关联记录和他表字段为日期
      (includes([29, 30], item.type) && includes(types, item.sourceControlType)),
  );

  const isSelectPlainTime = !value || /(\/|:)/.test(value);

  const originControl = find(filteredControls, item => item.controlId === value);
  const controlName = get(originControl, 'controlName');
  const invalidError = originControl && originControl.type === 30 && (originControl.strDefault || '')[0] === '1';

  return (
    <Fragment>
      <DateInfoWrap>
        <div className="contentWrap">
          <div className={cx('dateInfo', { isSelectPlainTime })}>
            <Fragment>
              {isSelectPlainTime ? (
                <DatePicker
                  timePicker
                  offset={{ left: -14, top: 1 }}
                  selectedValue={value ? moment(value) : moment()}
                  defaultVisible={false}
                  onSelect={newDate => {
                    const newValue = newDate.format('YYYY-MM-DD HH:mm');
                    onChange(newValue);
                  }}
                  onOk={newDate => {
                    const newValue = newDate.format('YYYY-MM-DD HH:mm');
                    onChange(newValue);
                  }}
                  onClear={() => {
                    onChange('');
                  }}
                >
                  <div className="selectedDate">{value && moment(value).format('YYYY-MM-DD HH:mm')}</div>
                </DatePicker>
              ) : (
                <ControlTag className={cx({ invalid: !controlName || invalidError })}>
                  {controlName ? (invalidError ? _l('%0(无效类型)', controlName) : controlName) : _l('已删除')}
                </ControlTag>
              )}
            </Fragment>
          </div>
          {value && (
            <div className="clearValue" onClick={() => onChange('')}>
              <i className="icon-close"></i>
            </div>
          )}
        </div>
        <div className="selectControl" onClick={() => setVisible({ dateControlVisible: true })}>
          <i className="icon-workflow_other"></i>
        </div>
      </DateInfoWrap>

      {dateControlVisible && (
        <SelectControl
          searchable={false}
          className={'isolate'}
          list={filterOnlyShowField(filteredControls)}
          onClickAway={() => setVisible({ dateControlVisible: false })}
          onClick={item => {
            onChange(`$${item.controlId}$`);
            setVisible({ dateControlVisible: false });
          }}
        />
      )}
    </Fragment>
  );
}
