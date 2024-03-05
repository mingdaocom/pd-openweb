import React, { useEffect, useRef, useState } from 'react';
import Trigger from 'rc-trigger';
import { useMeasure } from 'react-use';
import styled from 'styled-components';
import { emitter } from 'worksheet/util';
import { FlexCenter } from 'worksheet/components/Basics';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
const ClickAway = createDecoratedComponent(withClickAway);
import { formatForSave } from './model';
import Filters from './Filters';
import _ from 'lodash';

const FilterBtn = styled.span`
  line-height: 27px;
`;

const SelectedFilter = styled(FlexCenter)`
  display: inline-flex;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  line-height: 29px;
  margin-right: 16px;
  vertical-align: middle;
  color: #1e88e5;
  background-color: #e3f2fd;
  padding: 0 10px;
  .text {
    max-width: 160px;
  }
  .filterIcon {
    font-size: 18px;
    margin-right: 6px;
  }
  .closeIcon {
    font-size: 16px;
    margin-left: 6px;
    &:hover {
      color: #1565c0;
    }
  }
`;

export default function FiltersPopup(props) {
  const { zIndex, actions, state, onChange, ...rest } = props;
  const { worksheetId = '', type = '', className } = rest;
  const filtersRef = useRef();
  const btnRef = useRef();
  const [popupVisible, setPopupVisible] = useState();
  const { needSave, editingFilter, activeFilter } = state;
  function handleWorksheetHeadAddFilter(control) {
    setPopupVisible(true);
    setTimeout(() => {
      if (_.get(filtersRef, 'current.addFilterByControl')) {
        filtersRef.current.addFilterByControl(control);
      }
    }, 100);
  }
  useEffect(() => {
    emitter.addListener('FILTER_ADD_FROM_COLUMNHEAD' + worksheetId + type, handleWorksheetHeadAddFilter);
    return () => {
      emitter.removeListener('FILTER_ADD_FROM_COLUMNHEAD' + worksheetId + type, handleWorksheetHeadAddFilter);
    };
  }, []);
  let filteredText;
  if (editingFilter && /^new/.test(editingFilter.id)) {
    const filterControls = formatForSave(editingFilter);
    const count = _.sum(filterControls.map(c => _.get(c, 'groupFilters.length')));
    if (count > 0) {
      filteredText = _l('%0 项', count);
    }
  } else if (activeFilter) {
    filteredText = activeFilter.name + (needSave ? ' *' : '');
  }
  return (
    <Trigger
      zIndex={zIndex || 99}
      action={['click']}
      popup={
        <ClickAway
          specialFilter={target => {
            const $targetTarget = $(target).closest(
              [
                '.dropdownTrigger',
                '.addFilterPopup',
                '.filterControlOptionsList',
                '.mui-dialog-container',
                '.mui-datetimepicker',
                '.mui-datetimerangepicker',
                '.selectUserBox',
                '.worksheetFilterOperateList',
                '.ant-picker-dropdown',
                '.rc-trigger-popup',
                '.CityPicker',
                '.CityPicker-wrapper',
              ].join(','),
            )[0];
            return $targetTarget;
          }}
          onClickAwayExceptions={['.ant-cascader-menus', '.ant-tree-select-dropdown']}
          onClickAway={() => setPopupVisible(false)}
        >
          <Filters
            actions={actions}
            ref={filtersRef}
            state={state}
            onHideFilterPopup={() => setPopupVisible(false)}
            onChange={onChange}
            maxHeight={
              btnRef.current ? window.innerHeight - btnRef.current.getBoundingClientRect().y - 120 - 29 - 6 : undefined
            }
            {...rest}
          />
        </ClickAway>
      }
      getPopupContainer={() => document.body}
      popupClassName="filterTrigger"
      popupVisible={popupVisible}
      popupAlign={{
        points: ['tr', 'br'],
        offset: [162, 6],
        overflow: {
          adjustX: true,
          adjustY: true,
        },
      }}
      onPopupVisibleChange={visible => {
        if (visible) {
          setPopupVisible(true);
        }
      }}
    >
      <div ref={btnRef} className="mTop4">
        {!filteredText && (
          <FilterBtn data-tip={_l('筛选')} className={`mRight10 mTop2 ${className}`}>
            <i className="icon icon-worksheet_filter Gray_9e Hand Font18 ThemeHoverColor3"></i>
          </FilterBtn>
        )}
        {filteredText && (
          <SelectedFilter>
            <i className="icon icon-worksheet_filter filterIcon"></i>
            <span className="text ellipsis">{filteredText}</span>
            <i
              className="icon icon-close closeIcon"
              onClick={e => {
                e.stopPropagation();
                actions.setActiveFilter(undefined);
                actions.editFilter(undefined);
                onChange({
                  filterControls: [],
                });
              }}
            ></i>
          </SelectedFilter>
        )}
      </div>
    </Trigger>
  );
}
