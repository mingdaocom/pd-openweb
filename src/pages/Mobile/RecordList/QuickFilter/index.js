import React, { Fragment, useEffect, useState, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import * as actions from 'mobile/RecordList/redux/actions';
import { bindActionCreators } from 'redux';
import { Icon } from 'ming-ui';
import FilterInput, { validate, conditionAdapter, formatQuickFilter, NumberTypes } from './Inputs';
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
    .flex {
      padding: 10px;
    }
    .query {
      color: #fff;
      background-color: #2196f3;
    }
  }
`;

function QuickFilter(props) {
  const { view, filters, controls, updateQuickFilter, onHideSidebar } = props;
  const width = document.documentElement.clientWidth - 60;
  const showQueryBtn = view.advancedSetting && view.advancedSetting.enablebtn && view.advancedSetting.enablebtn === '1';
  const store = useRef({});
  const [values, setValues] = useState({});
  const debounceUpdateQuickFilter = useRef(_.debounce(updateQuickFilter, 500));
  const items = useMemo(
    () =>
      filters
        .map(filter => ({
          ...filter,
          control: _.find(controls, c => c.controlId === filter.controlId),
        }))
        .filter(c => c.control),
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
        let { values } = it;
        if (
          (_.isArray(values) && (values[0] === 'isEmpty' || _.get(values[0], 'accountId') === 'isEmpty')) ||
          _.get(values[0], 'rowid') === 'isEmpty'
        ) {
          it.filterType = 7;
          values = [];
        }
        return { ...it, values };
      });
      if (_.includes(NumberTypes, store.current.activeType)) {
        debounceUpdateQuickFilter.current(formatQuickFilter(quickFilterDataFormat));
      } else {
        updateQuickFilter(formatQuickFilter(quickFilterDataFormat));
      }
    } else {
      updateQuickFilter([]);
    }
  };
  const handleQuery = () => {
    update();
    onHideSidebar();
  };
  const handleReset = () => {
    setValues({});
    updateQuickFilter([]);
    onHideSidebar();
  };
  useEffect(() => {
    setValues({});
  }, [view.viewId]);

  return (
    <Con className="flexColumn h100 overflowHidden" style={{ width }}>
      <div className="header flexRow valignWrapper">
        <Icon className="Gray_9e close" icon="close" onClick={onHideSidebar} />
      </div>
      <div className="flex body">
        {filters.map((item, i) => (
          <FilterInput
            key={item.controlId}
            {...item}
            {...values[i]}
            projectId={props.projectId}
            appId={props.appId}
            worksheetId={props.worksheetId}
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
  state => ({}),
  dispatch => bindActionCreators(_.pick(actions, ['updateQuickFilter']), dispatch),
)(QuickFilter);
