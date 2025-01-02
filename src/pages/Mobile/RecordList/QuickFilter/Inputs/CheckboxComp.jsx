import React from 'react';
import { Checkbox } from 'ming-ui';
import { shape, func, number } from 'prop-types';
import { FILTER_CONDITION_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum';
import { Option } from './Options';

export default function CheckboxComp(props) {
  const { control, filterType, onChange = () => {}, onRemove } = props;
  return (
    <div className="controlWrapper">
      <div className="ellipsis Font14 bold mBottom15 controlName">{control.controlName}</div>
      <Option>
        <Checkbox
          text={_l('未选中')}
          checked={filterType === FILTER_CONDITION_TYPE.NE}
          onClick={() => {
            if (filterType === FILTER_CONDITION_TYPE.NE) {
              onRemove();
            } else {
              onChange({
                filterType: FILTER_CONDITION_TYPE.NE,
                value: 1,
              });
            }
          }}
        />
      </Option>
      <Option>
        <Checkbox
          text={_l('已选中')}
          checked={filterType === FILTER_CONDITION_TYPE.EQ}
          onClick={() => {
            if (filterType === FILTER_CONDITION_TYPE.EQ) {
              onRemove();
            } else {
              onChange({
                filterType: FILTER_CONDITION_TYPE.EQ,
                value: 1,
              });
            }
          }}
        />
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
