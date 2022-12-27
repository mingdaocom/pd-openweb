import React from 'react';
import { Input } from 'ming-ui';
import cx from 'classnames';
import styled from 'styled-components';
import { func, number, string } from 'prop-types';
import { formatNumberFromInput } from 'src/util';
import { FILTER_CONDITION_TYPE } from 'worksheet/common/WorkSheetFilter/enum';
import _ from 'lodash';

const Con = styled.div`
  display: flex;
  align-items: center;
  height: 32px;
  line-height: 32px;
  border-radius: 4px;
`;

const InputCon = styled(Input)`
  width: 100%;
  font-size: 13px !important;
  height: 32px !important;
  border: 1px solid #dddddd !important;
  box-sizing: border-box !important;
  &:hover:not(:focus) {
    border-color: #ccc !important;
  }
  &:focus {
    border-color: #2196f3 !important;
  }
  &::placeholder {
    color: #bdbdbd;
  }
`;

const RangeInputCon = styled.div`
  display: flex;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  &:hover:not(:focus) {
    border-color: #ccc !important;
  }
  &:focus {
    border-color: #2196f3 !important;
  }
  &::placeholder {
    color: #bdbdbd;
  }
`;

const RangeInput = styled.div`
  flex: 1;
  input {
    border: none !important;
  }
`;

const Splitter = styled.div`
  margin: 0 2px;
`;

export default function Number(props) {
  const { value, minValue = '', maxValue = '', filterType, onChange = () => {}, onEnterDown = () => {} } = props;
  function update(changes, type) {
    if (_.isUndefined(filterType)) {
      changes.filterType = type;
    }
    onChange(changes);
  }
  return (
    <Con>
      {filterType === FILTER_CONDITION_TYPE.BETWEEN ? (
        <RangeInputCon>
          <RangeInput>
            <InputCon
              placeholder={_l('最小值')}
              value={minValue}
              valueFilter={formatNumberFromInput}
              onChange={newValue => {
                update({ minValue: newValue.trim() }, FILTER_CONDITION_TYPE.BETWEEN);
              }}
              onKeyDown={e => e.keyCode === 13 && onEnterDown()}
            />
          </RangeInput>
          <Splitter>-</Splitter>
          <RangeInput>
            <InputCon
              placeholder={_l('最大值')}
              value={maxValue}
              valueFilter={formatNumberFromInput}
              onChange={newValue => {
                update({ maxValue: newValue.trim() }, FILTER_CONDITION_TYPE.BETWEEN);
              }}
              onKeyDown={e => e.keyCode === 13 && onEnterDown()}
            />
          </RangeInput>
        </RangeInputCon>
      ) : (
        <InputCon
          placeholder={_l('请输入')}
          value={value}
          valueFilter={formatNumberFromInput}
          onChange={newValue => {
            update({ value: newValue.trim() }, FILTER_CONDITION_TYPE.EQ);
          }}
          onKeyDown={e => e.keyCode === 13 && onEnterDown()}
        />
      )}
    </Con>
  );
}

Number.propTypes = {
  filterType: number,
  minValue: string,
  maxValue: string,
  value: string,
  onChange: func,
};
