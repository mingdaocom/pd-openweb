import React, { useState } from 'react';
import styled from 'styled-components';
import { arrayOf, func, shape, string } from 'prop-types';
import { RELATE_RECORD_SHOW_TYPE } from 'worksheet/constants/enum';
import RelateRecordDropdown from 'worksheet/components/RelateRecordDropdown/RelateRecordDropdownCopy';
import RelateRecordOptions from './RelateRecordOptions';

const Con = styled.div`
  display: flex;
  align-items: center;
  height: 32px;
  line-height: 32px;
  .RelateRecordDropdown-selected {
    border-color: #ddd;
    &.active {
      border-color: #2196f3;
    }
  }
  &:hover {
    .RelateRecordDropdown-selected:not(.active) {
      border-color: #ccc;
    }
  }
`;

const Dropdown = styled(RelateRecordDropdown)`
  width: 100%;
  .RelateRecordDropdown-selected {
    background-color: transparent;
    height: 32px;
    min-height: 32px;
    .normalSelectedItem {
      line-height: 30px;
      display: block;
    }
    > input {
      line-height: 32px !important;
      display: block;
    }
    .icon {
      margin: 8px;
    }
  }
`;

function filterDynamicSource(filters) {
  if (!filters) {
    return;
  }
  try {
    return JSON.stringify(JSON.parse(filters).filter(c => _.isEmpty(c.dynamicSource)));
  } catch (err) {
    return;
  }
}

export default function RelateRecord(props) {
  const { values = [], advancedSetting, onChange = () => {} } = props;
  const controlAdvancedSetting = _.get(props, 'control.advancedSetting') || {};
  const control = _.assign({}, props.control, {
    advancedSetting: {
      searchcontrol: controlAdvancedSetting.searchcontrol,
      filters: filterDynamicSource(controlAdvancedSetting.filters),
    },
  });
  const { relationControls = [] } = control;
  const { showtype, allowlink, ddset, allowitem, direction } = advancedSetting || {};
  const [active, setActive] = useState();
  const isMultiple = String(allowitem) === '2';
  let renderSelected;
  function handleChange(value) {
    onChange({
      filterType: 24,
      ...value,
    });
  }
  if (!values.length) {
    renderSelected = () => (
      <span className="normalSelectedItem" style={{ fontSize: 13, color: '#bdbdbd' }}>
        {_l('请选择')}
      </span>
    );
  } else if (isMultiple) {
    renderSelected = selected => (
      <span className="normalSelectedItem" style={{ fontSize: 13 }}>
        {!selected.length || _l('选中 %0 个', selected.length)}
      </span>
    );
  }
  if (String(direction) === '1') {
    return (
      <RelateRecordOptions
        multiple={isMultiple}
        selected={values}
        control={control}
        onChange={newRecords => {
          handleChange({ values: newRecords });
        }}
      />
    );
  }
  return (
    <Con>
      <Dropdown
        zIndex="xxx"
        disableNewRecord
        doNotClearKeywordsWhenChange={isMultiple}
        isQuickFilter
        control={control}
        {...control}
        advancedSetting={{}}
        controls={relationControls}
        selected={!values}
        showCoverAndControls={true}
        popupContainer={() => document.body}
        multiple={isMultiple}
        renderSelected={active ? undefined : renderSelected}
        onChange={newRecords => {
          handleChange({ values: newRecords });
        }}
        onVisibleChange={setActive}
      />
    </Con>
  );
}

RelateRecord.propTypes = {
  values: arrayOf(shape({})),
  control: shape({}),
  advancedSetting: shape({}),
  onChange: func,
};
