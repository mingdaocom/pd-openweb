import React from 'react';
import { func, number, string } from 'prop-types';
import styled from 'styled-components';
import { Input } from 'ming-ui';
import { FILTER_CONDITION_TYPE } from 'worksheet/common/WorkSheetFilter/enum';
import { formatNumberFromInput } from 'src/utils/control';

const InputCon = styled(Input)`
  width: 100%;
  border: none !important;
  background-color: #f5f5f5;
`;

export default function Number(props) {
  const { value, minValue = '', maxValue = '', filterType, onChange = () => {}, control } = props;
  return (
    <div className="controlWrapper">
      <div className="Font14 bold mBottom15 controlName">{control.controlName}</div>
      <div>
        {filterType === FILTER_CONDITION_TYPE.BETWEEN ? (
          <div className="flexRow">
            <div className="flex">
              <InputCon
                className="centerAlign"
                placeholder={_l('最小值')}
                value={minValue}
                valueFilter={formatNumberFromInput}
                onChange={newValue => {
                  onChange({ minValue: newValue.trim(), filterType: FILTER_CONDITION_TYPE.BETWEEN });
                }}
              />
            </div>
            <div className="flexRow valignWrapper mLeft7 mRight7">-</div>
            <div className="flex">
              <InputCon
                className="centerAlign"
                placeholder={_l('最大值')}
                value={maxValue}
                valueFilter={formatNumberFromInput}
                onChange={newValue => {
                  onChange({ maxValue: newValue.trim(), filterType: FILTER_CONDITION_TYPE.BETWEEN });
                }}
              />
            </div>
          </div>
        ) : (
          <InputCon
            placeholder={_l('请输入')}
            value={value}
            valueFilter={formatNumberFromInput}
            onChange={newValue => {
              onChange({ value: newValue.trim(), filterType: FILTER_CONDITION_TYPE.EQ });
            }}
          />
        )}
      </div>
    </div>
  );
}

Number.propTypes = {
  filterType: number,
  minValue: string,
  maxValue: string,
  value: string,
  onChange: func,
};
