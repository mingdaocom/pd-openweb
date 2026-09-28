import React from 'react';
import { func, number, shape } from 'prop-types';
import { Checkbox } from 'ming-ui/antd-components';
import { FILTER_CONDITION_TYPE } from 'src/utils/domain/worksheet/filterConstants';
import { Option } from './Options';

export default function CheckboxComp(props) {
  const { control, filterType, onChange = () => {}, onRemove } = props;
  return (
    <div className="controlWrapper">
      <div className="ellipsis Font14 bold mBottom15 controlName">{control.controlName}</div>
      <Option>
        <Checkbox
          checked={filterType === FILTER_CONDITION_TYPE.NE}
          onChange={() => {
            if (filterType === FILTER_CONDITION_TYPE.NE) {
              onRemove();
            } else {
              onChange({
                filterType: FILTER_CONDITION_TYPE.NE,
                value: 1,
              });
            }
          }}
        >
          {_l('未选中')}
        </Checkbox>
      </Option>
      <Option>
        <Checkbox
          checked={filterType === FILTER_CONDITION_TYPE.EQ}
          onChange={() => {
            if (filterType === FILTER_CONDITION_TYPE.EQ) {
              onRemove();
            } else {
              onChange({
                filterType: FILTER_CONDITION_TYPE.EQ,
                value: 1,
              });
            }
          }}
        >
          {_l('已选中')}
        </Checkbox>
      </Option>
    </div>
  );
}

CheckboxComp.propTypes = {
  control: shape({}),
  filterType: number,
  onChange: func,
  onRemove: func,
};
