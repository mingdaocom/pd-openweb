import React from 'react';
import _ from 'lodash';
import { func, number, string } from 'prop-types';
import styled from 'styled-components';
import { Input, Space } from 'ming-ui/antd-components';
import { formatNumberFromInput } from 'src/utils/domain/control/number';
import { FILTER_CONDITION_TYPE } from 'src/utils/domain/worksheet/filterConstants';

const Con = styled.div`
  display: flex;
  align-items: center;
  height: 32px;
  line-height: 32px;
  border-radius: 4px;
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
        <Space.Compact block>
          <Input
            className="flex"
            placeholder={_l('最小值')}
            value={minValue}
            onChange={event => {
              const newValue = formatNumberFromInput(event.target.value);
              update({ minValue: newValue.trim() }, FILTER_CONDITION_TYPE.BETWEEN);
            }}
            onKeyDown={e => e.keyCode === 13 && onEnterDown()}
          />
          <Input
            className="flex"
            placeholder={_l('最大值')}
            value={maxValue}
            onChange={event => {
              const newValue = formatNumberFromInput(event.target.value);
              update({ maxValue: newValue.trim() }, FILTER_CONDITION_TYPE.BETWEEN);
            }}
            onKeyDown={e => e.keyCode === 13 && onEnterDown()}
          />
        </Space.Compact>
      ) : (
        <Input
          className="w100"
          placeholder={_l('请输入')}
          value={value ?? ''}
          onChange={event => {
            const newValue = formatNumberFromInput(event.target.value);
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
