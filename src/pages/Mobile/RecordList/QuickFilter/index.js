import React, { Fragment, useEffect, useState, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import * as actions from 'mobile/RecordList/redux/actions';
import * as sheetActions from 'src/pages/worksheet/redux/actions';
import { bindActionCreators } from 'redux';
import { Icon } from 'ming-ui';
import FilterInput, { NumberTypes } from './Inputs';
import { validate, conditionAdapter, turnControl, formatQuickFilter } from './utils';
import { formatFilterValuesToServer } from 'src/pages/worksheet/common/Sheet/QuickFilter/utils';
import { FILTER_CONDITION_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum';
import _ from 'lodash';

const Con = styled.div`
  .header {
    padding: 10px 15px;
    justify-content: flex-end;
  }
  .close {
    font-weight: bold;
    padding: 5px;
    border-radius: 50%;
    background-color: #e6e6e6;
  }
  .body {
    padding: 0 15px;
    overflow: auto;
    .controlWrapper {
      margin-bottom: 20px;
    }
    .selected {
      color: #2196f3;
      max-width: 100px;
      padding-left: 10px;
      font-weight: 500;
    }
  }
  .footer {
    border-top: 1px solid #eaeaea;
    z-index: 0;
    background-color: #fff;
    .flex {
      padding: 10px;
    }
    .query {
      color: #fff;
      background-color: #2196f3;
    }
  }
`;

export function QuickFilter(props) {
  const {
    view,
    filters,
    controls,
    pcUpdateQuickFilter,
    onHideSidebar,
    mobileNavGroupFilters = [],
    quickFilter = [],
    updateQuickFilterWithDefault = () => {},
  } = props;
  const updateQuickFilter = _.includes([21], view.viewType) ? pcUpdateQuickFilter : props.updateQuickFilter;
  const width = document.documentElement.clientWidth - 60;
  const showQueryBtn = view.advancedSetting && view.advancedSetting.enablebtn && view.advancedSetting.enablebtn === '1';
  const store = useRef({});
  const [values, setValues] = useState({});
  const debounceUpdateQuickFilter = useRef(_.debounce(updateQuickFilter, 500));

 

  const items = useMemo(
    () =>
      filters
        .map(filter => {
          const controlObj = _.find(controls, c => c.controlId === filter.controlId);
          const newControl = controlObj && _.cloneDeep(turnControl(controlObj));
          return {
            ...filter,
            control: newControl,
            dataType: newControl ? newControl.type : filter.dataType,
            filterType: newControl && newControl.encryId ? 2 : filter.filterType,
          };
        })
        .filter(c => c.control && !(window.shareState.shareId && _.includes([26, 27, 48], c.control.type))),
    [JSON.stringify(filters)],
  );

  const update = newValues => {
    const valuesToUpdate = newValues || values;
    const quickFilter = items
      .map((filter, i) => ({
        ...filter,
        filterType: filter.filterType || (filter.dataType === 29 ? 24 : 2),
        spliceType: filter.spliceType || 1,
        ...valuesToUpdate[i],
      }))
      .filter(validate)
      .map(conditionAdapter);
    if (quickFilter.length) {
      const quickFilterDataFormat = quickFilter.map(it => {
        let { values = [] } = it;
        if (
          (_.isArray(values) && (values[0] === 'isEmpty' || _.get(values[0], 'accountId') === 'isEmpty')) ||
          _.get(values[0], 'rowid') === 'isEmpty'
        ) {
          it.filterType = 7;
          values = [];
        }
        if (it.type === 2) {
          return { ...it, values: !_.isEmpty(values) ? [values.join('').trim()] : values };
        }
        if (it.filterType === FILTER_CONDITION_TYPE.DATE_BETWEEN && it.dateRange !== 18) {
          it.filterType = FILTER_CONDITION_TYPE.DATEENUM;
        }
        return { ...it, values };
      });
      if (_.includes(NumberTypes, store.current.activeType)) {
        debounceUpdateQuickFilter.current(formatQuickFilter(quickFilterDataFormat));
      } else {
        updateQuickFilter(formatQuickFilter(quickFilterDataFormat), view);
      }
    } else {
      updateQuickFilter([], view);
    }
  };
  const handleQuery = () => {
    update();
    onHideSidebar();
  };
  const handleReset = () => {
    updateQuickFilterWithDefault(
      items.map(item => ({ ...item, values: [] })),
      view,
    );
    setValues({});
    updateQuickFilter([], view);
    onHideSidebar();
  };
  useEffect(() => {
    setValues({});
  }, [view.viewId]);
  const filtersData = Object.keys(values)
    .map(key => ({
      controlId: 'fastFilter_' + _.get(items[key], 'control.controlId'),
      filterValue: {
        ...values[key],
        values: formatFilterValuesToServer(_.get(items[key], 'control.type'), _.get(values[key], 'values')),
      },
    }))
    .concat(
      quickFilter
        .filter(it => it.dataType === 2)
        .map(v => ({
          controlId: 'fastFilter_' + v.controlId,
          filterValue: {
            values: v.values,
          },
        })),
    )
    .concat(
      mobileNavGroupFilters.map(c => ({
        controlId: 'navGroup_' + c.controlId,
        filterValue: { values: c.values },
      })),
    );

  return (
    <Con className="flexColumn h100 overflowHidden" style={{ width }}>
      <div className="header flexRow valignWrapper">
        <Icon className="Gray_9e close" icon="close" onClick={onHideSidebar} />
      </div>
      <div className="flex body">
        {items.map((item, i) => (
          <FilterInput
            controls={controls}
            key={item.controlId}
            {...item}
            {...values[i]}
            filtersData={filtersData}
            projectId={props.projectId}
            appId={props.appId}
            worksheetId={props.worksheetId}
            filterText={props.filterText}
            onChange={(change = {}) => {
              store.current.activeType = item.control.type;
              const newValues = { ...values, [i]: { ...values[i], ...change } };
              setValues(newValues);
              if (!showQueryBtn && !_.isEmpty(newValues)) {
                update(newValues);
              }
            }}
            onRemove={() => {
              delete values[i];
              const newValues = { ...values };
              setValues(newValues);
              if (!showQueryBtn) {
                update(newValues);
              }
            }}
          />
        ))}
      </div>
      {showQueryBtn && (
        <div className="footer flexRow valignWrapper">
          <div className="flex Font16 centerAlign" onClick={handleReset}>
            {_l('重置')}
          </div>
          <div className="flex Font16 centerAlign query" onClick={handleQuery}>
            {_l('查询')}
          </div>
        </div>
      )}
    </Con>
  );
}

export default connect(
  state => ({
    mobileNavGroupFilters: state.mobile.mobileNavGroupFilters,
    quickFilter: state.mobile.quickFilter,
  }),
  dispatch =>
    bindActionCreators(
      { ..._.pick(actions, ['updateQuickFilter']), pcUpdateQuickFilter: sheetActions.updateQuickFilter },
      dispatch,
    ),
)(QuickFilter);
