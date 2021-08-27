import React from 'react';
import { Checkbox } from 'ming-ui';
import styled from 'styled-components';
import { func, string } from 'prop-types';
import { FILTER_CONDITION_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum';

const Con = styled.div`
  display: flex;
  height: 32px;
  align-items: center;
  font-size: 0px;
`;

export default function CheckboxComp(props) {
  const { filterType, onChange = () => {} } = props;
  return (
    <Con>
      <Checkbox
        checked={filterType === FILTER_CONDITION_TYPE.EQ}
        onClick={() => {
          onChange({
            filterType: filterType === FILTER_CONDITION_TYPE.EQ ? FILTER_CONDITION_TYPE.NE : FILTER_CONDITION_TYPE.EQ,
            value: 1,
          });
        }}
      />
    </Con>
  );
}

CheckboxComp.propTypes = {
  filterType: string,
  onChange: func,
};
