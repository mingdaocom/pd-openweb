import React from 'react';
import styled from 'styled-components';
import { getControlByControlId } from '../../../util';
import { getAdvanceSetting } from '../../../util/setting';

const FilterTextWrap = styled.div`
  display: flex;
  margin-top: 10px;
  background: #f1f2f3;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px 10px;
  position: relative;
  .editIcon {
    position: absolute;
    top: 8px;
    right: 12px;
  }
`;

export default function FilterText({ data, allControls }) {
  const filters = getAdvanceSetting(data, 'filters');
  return (
    <FilterTextWrap>
      {filters.map((item, index) => {
        const { controlId } = item;
        const { controlName } = getControlByControlId(allControls, controlId);
        return (
          <div className="filterItem">
            {index > 0 && <div className="filterMode">{filters[index - 1].spliceType === 1 ? _l('且') : _l('或')}</div>}
            <div className="controlName">{controlName}</div>
            <div className="filterType"></div>
            <div className="filterInfo"></div>
          </div>
        );
      })}
      <div className="editIcon">
        <i className="icon-hr_edit"></i>
      </div>
    </FilterTextWrap>
  );
}
