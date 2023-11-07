import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { arrayOf, func, shape, string } from 'prop-types';
import { RELATE_RECORD_SHOW_TYPE } from 'worksheet/constants/enum';
import RelateRecordDropdown from 'worksheet/components/RelateRecordDropdown/RelateRecordDropdownCopy';
import RelateRecordOptions from './RelateRecordOptions';
import _ from 'lodash';

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
    .clearIcon,
    .dropIcon {
      margin: 8px;
    }
    .activeSelectedItem {
      margin-top: 0px !important;
    }
  }
`;

export default function RelateRecord(props) {
  const { from, values = [], filtersData, advancedSetting, onChange = () => {} } = props;
  const controlAdvancedSetting = _.get(props, 'control.advancedSetting') || {};
  const control = _.assign({}, props.control, {
    advancedSetting: {
      // ...(from === 'selectRecordDialog' ? { filters: controlAdvancedSetting.filters } : {}), // 薛老板说去掉 后面加开关 https://www.mingdao.com/app/eed8e526-6c6e-4e05-9ab7-e25550aa990c/5cc4391adb8d4e0001ee6618/5cc4391adb8d4e0001ee6619/row/2d774b9c-40a1-4b3c-83ce-84cf8fa7ac42
      searchcontrol: controlAdvancedSetting.searchcontrol,
    },
  });
  const { relationControls = [] } = control;
  const { showtype, navshow, allowlink, ddset, allowitem, navfilters, direction, shownullitem, nullitemname } =
    advancedSetting || {};
  let staticRecords;
  if (navshow === '3') {
    control.advancedSetting.filters = navfilters;
  } else if (navshow === '2') {
    staticRecords = JSON.parse(navfilters)
      .map(safeParse)
      .map(r => ({ rowid: r.id, ...r }));
  }
  let fastSearchControlArgs;
  if (advancedSetting.searchcontrol) {
    control.advancedSetting.searchcontrol = advancedSetting.searchcontrol;
    fastSearchControlArgs = {
      controlId: advancedSetting.searchcontrol,
      filterType: advancedSetting.searchtype === '1' ? 2 : 1,
    };
  }
  if (advancedSetting.clicksearch) {
    control.advancedSetting.clicksearch = advancedSetting.clicksearch;
  }
  const conRef = useRef();
  const [active, setActive] = useState();
  const isMultiple = String(allowitem) === '2';
  const prefixRecords =
    shownullitem === '1'
      ? [
          {
            rowid: 'isEmpty',
            name: nullitemname || _l('为空'),
          },
        ]
      : [];
  let renderSelected;
  function handleChange(value) {
    onChange({
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
    renderSelected = (selected = []) => {
      let text;
      if ((selected[0] || {}).rowid === 'isEmpty') {
        text = nullitemname || _l('为空');
      } else {
        text = !selected.length || _l('选中 %0 个', selected.length);
      }
      return (
        <span className="normalSelectedItem" style={{ fontSize: 13 }}>
          {text}
        </span>
      );
    };
  }
  if (String(direction) === '1') {
    return (
      <RelateRecordOptions
        multiple={isMultiple}
        selected={values}
        formData={filtersData}
        control={control}
        prefixRecords={prefixRecords}
        staticRecords={staticRecords}
        onChange={newRecords => {
          handleChange({ values: newRecords });
        }}
      />
    );
  }
  // searchcontrol
  // searchtype 0 模糊[default] 1精确
  // clicksearch 1 搜索后限制 0[default]
  return (
    <Con ref={conRef}>
      <Dropdown
        zIndex="xxx"
        disableNewRecord
        doNotClearKeywordsWhenChange={isMultiple}
        isQuickFilter
        control={control}
        {...control}
        selectedStyle={
          conRef.current
            ? {
                width: conRef.current.clientWidth,
              }
            : {}
        }
        popupOffset={[0, -16]}
        formData={filtersData}
        advancedSetting={{}}
        controls={relationControls}
        selected={values}
        showCoverAndControls={true}
        popupContainer={() => document.body}
        multiple={isMultiple}
        renderSelected={active ? undefined : renderSelected}
        prefixRecords={prefixRecords}
        staticRecords={staticRecords}
        fastSearchControlArgs={fastSearchControlArgs}
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
