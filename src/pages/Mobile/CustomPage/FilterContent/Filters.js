import React, { useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import FilterInput, { NumberTypes } from 'mobile/RecordList/QuickFilter/Inputs';
import { conditionAdapter, formatQuickFilter, turnControl, validate } from 'mobile/RecordList/QuickFilter/utils';
import { formatFilterValuesToServer } from 'src/pages/worksheet/common/Sheet/QuickFilter/utils';
import { FILTER_CONDITION_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum';

const Con = styled.div`
  .header {
    padding: 0 15px 10px;
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
      color: #1677ff;
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
      background-color: #1677ff;
    }
  }
`;

function QuickFilter(props) {
  const { enableBtn, filters, updateQuickFilter, onCloseDrawer } = props;
  const store = useRef({});
  const [values, setValues] = useState({});
  const debounceUpdateQuickFilter = useRef(_.debounce(updateQuickFilter, 500));
  const items = useMemo(
    () =>
      filters
        .map(filter => {
          const newControl = _.cloneDeep(turnControl(filter.control));
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
      const formattedFilter = quickFilter.map(c => {
        if (values[0] === 'isEmpty') {
          c.filterType = 7;
        }
        if (c.filterType === FILTER_CONDITION_TYPE.DATE_BETWEEN && c.dateRange !== 18) {
          c.filterType = FILTER_CONDITION_TYPE.DATEENUM;
        }
        return {
          ...c,
        };
      });
      if (_.includes(NumberTypes, store.current.activeType)) {
        debounceUpdateQuickFilter.current(formatQuickFilter(formattedFilter));
      } else {
        updateQuickFilter(formatQuickFilter(formattedFilter));
      }
    } else {
      updateQuickFilter([]);
    }
  };
  const handleQuery = () => {
    update();
    onCloseDrawer();
  };
  const handleReset = () => {
    setValues({});
    updateQuickFilter([]);
    onCloseDrawer();
  };
  const filtersData = Object.keys(values)
    .map(key => ({
      controlId: 'fastFilter_' + _.get(filters[key], 'control.controlId'),
      filterValue: {
        ...values[key],
        values: formatFilterValuesToServer(_.get(filters[key], 'control.type'), _.get(values[key], 'values')),
      },
    }))
    .concat(
      filters
        .filter(it => it.dataType === 2)
        .map(v => ({
          controlId: 'fastFilter_' + v.controlId,
          filterValue: {
            values: v.values,
          },
        })),
    );

  useEffect(() => {
    update();
  }, [items]);

  return (
    <Con className="flexColumn h100 overflowHidden">
      <div className="header flexRow valignWrapper">
        <Icon className="Gray_9e close" icon="close" onClick={onCloseDrawer} />
      </div>
      <div className="flex body">
        {items.map((item, i) => (
          <FilterInput
            key={item.controlId}
            {...item}
            {...values[i]}
            filtersData={filtersData}
            projectId={props.projectId}
            appId={props.appId}
            showTextAdvanced={false}
            // worksheetId={props.worksheetId}
            onChange={(change = {}) => {
              store.current.activeType = item.control.type;
              const newValues = { ...values, [i]: { ...values[i], ...change } };
              setValues(newValues);
              if (!enableBtn && !_.isEmpty(newValues)) {
                update(newValues);
              }
            }}
            onRemove={() => {
              delete values[i];
              const newValues = { ...values };
              setValues(newValues);
              if (!enableBtn) {
                update(newValues);
              }
            }}
          />
        ))}
      </div>
      {enableBtn && (
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

export default QuickFilter;
