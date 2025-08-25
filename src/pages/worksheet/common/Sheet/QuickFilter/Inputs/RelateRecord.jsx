import React, { useState } from 'react';
import { useMeasure } from 'react-use';
import cx from 'classnames';
import _, { find } from 'lodash';
import { arrayOf, func, shape } from 'prop-types';
import styled from 'styled-components';
import RelateRecordDropdown from 'worksheet/components/RelateRecordDropdown/RelateRecordDropdownCopy';
import { getTitleTextFromRelateControl } from 'src/components/newCustomFields/tools/utils';
import RelateRecordOptions from './RelateRecordOptions';

const Con = styled.div`
  display: flex;
  align-items: center;
  height: 32px;
  line-height: 32px;
  .RelateRecordDropdown-selected {
    border-color: var(--border-color);
    max-height: 102px;
    overflow-y: auto;
    &.active {
      border-color: #1677ff;
    }
  }
  &:hover {
    .RelateRecordDropdown-selected:not(.active) {
      border-color: #ccc;
    }
  }
  &.isMultiple:not(.active) {
    height: auto !important;
    .RelateRecordDropdown-selected {
      height: auto !important;
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

const SelectedTags = styled.div`
  max-width: 100%;
  .item {
    position: relative;
    display: inline-block;
    margin: 0 0 5px 6px;
    line-height: 24px;
    padding: 0 24px 0 10px;
    background-color: rgba(0, 100, 240, 0.08);
    color: #151515;
    border-radius: 3px;
    .name {
      max-width: 100%;
    }
    .icon-close {
      cursor: pointer;
      position: absolute;
      right: 4px;
      top: 4px;
      color: #9d9d9d;
      font-size: 16px;
      &:hover {
        color: #757575;
      }
    }
    &.active.allowRemove {
      padding-right: 24px !important;
    }
  }
`;

export default function RelateRecord(props) {
  const { isDark, worksheetId, values = [], filtersData, advancedSetting, onChange = () => {} } = props;
  const controlAdvancedSetting = _.get(props, 'control.advancedSetting') || {};
  const control = _.assign({}, props.control, {
    advancedSetting: {
      searchcontrol: controlAdvancedSetting.searchcontrol,
    },
  });
  const { relationControls = [] } = control;
  const { navshow, allowitem, navfilters, direction, shownullitem, nullitemname } = advancedSetting || {};
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
  if (advancedSetting.clicksearch && navshow !== '2') {
    control.advancedSetting.clicksearch = advancedSetting.clicksearch;
  }
  const [conRef, { width }] = useMeasure();
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
  } else if (isMultiple || values.length > 1) {
    renderSelected = (selected = [], { handleDelete = () => {} } = {}) => {
      let text;
      if ((selected[0] || {}).rowid === 'isEmpty') {
        text = nullitemname || _l('为空');
      } else {
        text = !selected.length || _l('选中 %0 个', selected.length);
        return (
          <SelectedTags>
            {selected.map((record, i) => (
              <div
                className="item"
                key={i}
                style={{
                  ...(i === 0 ? { marginTop: 6 } : {}),
                  ...(selected.length > 1 ? { maxWidth: 'calc(100% - 30px)' } : {}),
                }}
              >
                <span className="name InlineBlock ellipsis">{getTitleTextFromRelateControl(control, record)}</span>
                <i
                  className="icon icon-close"
                  onClick={e => {
                    e.stopPropagation();
                    handleDelete(record);
                  }}
                ></i>
              </div>
            ))}
          </SelectedTags>
        );
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
        advancedSetting={advancedSetting}
        multiple={isMultiple}
        selected={values}
        formData={filtersData}
        control={control}
        parentWorksheetId={worksheetId}
        prefixRecords={prefixRecords}
        staticRecords={
          staticRecords
            ? staticRecords.concat(
                values.filter(item => !find(staticRecords, r => r.rowid === item.rowid) && item.rowid !== 'isEmpty'),
              )
            : []
        }
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
    <Con ref={conRef} className={cx({ isMultiple: true, active })}>
      {!!width && (
        <Dropdown
          isDark={isDark}
          popupClassName={values.length < 2 ? 'small' : ''}
          getFilterRowsGetType={32}
          zIndex="xxx"
          disableNewRecord
          doNotClearKeywordsWhenChange={isMultiple}
          parentWorksheetId={worksheetId}
          isQuickFilter
          control={control}
          {...control}
          selectedStyle={{ width, maxHeight: 102, overflowY: 'auto' }}
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
      )}
    </Con>
  );
}

RelateRecord.propTypes = {
  values: arrayOf(shape({})),
  control: shape({}),
  advancedSetting: shape({}),
  onChange: func,
};
