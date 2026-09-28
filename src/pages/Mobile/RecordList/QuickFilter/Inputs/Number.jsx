import React from 'react';
import { func, number, string } from 'prop-types';
import styled from 'styled-components';
import { Input } from 'ming-ui/antd-components';
import { formatNumberFromInput } from 'src/utils/domain/control/number';
import { FILTER_CONDITION_TYPE } from 'src/utils/domain/worksheet/filterConstants';

const InputCon = styled(Input).attrs({ variant: 'filled' })`
  width: 100%;
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
                onChange={event => {
                  const newValue = formatNumberFromInput(event.target.value);
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
                onChange={event => {
                  const newValue = formatNumberFromInput(event.target.value);
                  onChange({ maxValue: newValue.trim(), filterType: FILTER_CONDITION_TYPE.BETWEEN });
                }}
              />
            </div>
          </div>
        ) : (
          <InputCon
            placeholder={_l('请输入')}
            value={value}
            onChange={event => {
              const newValue = formatNumberFromInput(event.target.value);
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
