import React, { Fragment, useEffect, useState, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import * as actions from 'mobile/RecordList/redux/actions';
import * as sheetActions from 'src/pages/worksheet/redux/actions';
import { bindActionCreators } from 'redux';
import { Icon } from 'ming-ui';
import FilterInput, { NumberTypes, TextTypes } from './Inputs';
import { validate, conditionAdapter, turnControl } from './utils';
import { formatFilterValuesToServer } from 'src/pages/worksheet/common/Sheet/QuickFilter/utils';
import { FILTER_CONDITION_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum';
import { formatForSave } from 'src/pages/worksheet/common/WorkSheetFilter/model';
import cx from 'classnames';
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

const Item = styled.div`
  .controlName {
    color: ${({ requiredError }) => (requiredError ? 'red' : '#151515')};
  }
`;
const SpaceLine = styled.div`
  height: 12px;
  margin: 0 -15px;
  background: #f5f5f5;
`;

const SavedItem = styled.div`
  cursor: pointer;
  font-size: 12px;
  display: inline-block;
  margin: 0 12px 12px 0;
  padding: 4px 12px;
  border-radius: 28px;
  max-width: 200px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  background-color: #f5f5f5;
  word-break: break-all;
  &.active {
    background-color: #2196f3;
    color: #fff;
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
    savedFilters = [],
    activeSavedFilter = {},
    updateQuickFilterWithDefault = () => {},
    updateActiveSavedFilter = () => {},
    pcUpdateFilters = () => {},
    base = {},
  } = props;
  const updateQuickFilter = _.includes([21, 1], view.viewType) ? pcUpdateQuickFilter : props.updateQuickFilter;
  const width = document.documentElement.clientWidth - 60;
  const showQueryBtn =
    (view.advancedSetting && view.advancedSetting.enablebtn && view.advancedSetting.enablebtn === '1') ||
    savedFilters.length;
  const store = useRef({});
  const [values, setValues] = useState({});
  const [requiredErrorVisible, setRequiredErrorVisible] = useState(false);
  const [filterControls, setFilterControls] = useState([]);
  const debounceUpdateQuickFilter = useRef(_.debounce(updateQuickFilter, 500));
  const showSavedFilter = !_.get(window, 'shareState.shareId') && base.type !== 'single';

  const items = useMemo(
    () =>
      filters
        .map(filter => {
          const controlObj = _.find(controls, c => c.controlId === filter.controlId);
          const newControl = controlObj && _.cloneDeep(turnControl(controlObj));
          const isRequired =
            _.get(view, 'advancedSetting.fastrequired') === '1' &&
            _.includes(_.get(view, 'advancedSetting.requiredcids', ''), (newControl || {}).controlId);
          return {
            ...filter,
            isRequired,
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
    const needCheckRequired = _.get(view, 'advancedSetting.fastrequired') === '1';
    const itemsWithValues = items.map((filter, i) => ({
      ...filter,
      filterType: filter.filterType || (filter.dataType === 29 ? 24 : 2),
      spliceType: filter.spliceType || 1,
      ...valuesToUpdate[i],
    }));

    if (needCheckRequired) {
      const emptyItems = itemsWithValues.filter(item => item.isRequired && !validate(item));
      if (emptyItems.length) {
        setRequiredErrorVisible(true);
        alert(_l('请填写%0', _.get(emptyItems, '0.control.controlName')), 2);
        return;
      }
    }
    setRequiredErrorVisible(false);
    const quickFilter = itemsWithValues.filter(validate).map(conditionAdapter);
    if (quickFilter.length) {
      const quickFilterDataFormat = quickFilter.map(c => {
        let values = formatFilterValuesToServer(c.dataType, c.values);
        if (values[0] === 'isEmpty') {
          c.filterType = 7;
          values = [];
        }
        if (c.filterType === FILTER_CONDITION_TYPE.DATE_BETWEEN && c.dateRange !== 18) {
          c.filterType = FILTER_CONDITION_TYPE.DATEENUM;
        }
        return {
          ...c,
          values,
        };
      });
      if (_.includes(TextTypes.concat(NumberTypes), store.current.activeType)) {
        debounceUpdateQuickFilter.current(quickFilterDataFormat, view);
      } else {
        debounceUpdateQuickFilter.current.cancel();
        updateQuickFilter(quickFilterDataFormat, view);
      }
    } else {
      updateQuickFilter([], view);
    }

    if (_.includes([21, 1], view.viewType)) {
      pcUpdateFilters({ filterControls }, view);
    }
    onHideSidebar();
  };

  const handleReset = () => {
    updateQuickFilterWithDefault(
      items.map(item => ({ ...item, values: [] })),
      view,
    );
    setValues({});
    updateActiveSavedFilter({}, view);
    updateQuickFilter([], view);
    setFilterControls([]);
    if (_.includes([21, 1], view.viewType)) {
      pcUpdateFilters({ filterControls: [] }, view);
    }
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
          <Item
            requiredError={
              requiredErrorVisible &&
              item.isRequired &&
              !validate({
                ...item,
                ...values[i],
              })
            }
          >
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
                values[i] = { ...values[i], dateRange: 0, minValue: undefined, maxValue: undefined, value: undefined };
                const newValues = { ...values };
                setValues(newValues);
                if (!showQueryBtn) {
                  update(newValues);
                }
              }}
            />
          </Item>
        ))}
        {showSavedFilter && !_.isEmpty(items) && !_.isEmpty(savedFilters) && <SpaceLine></SpaceLine>}
        {showSavedFilter && !_.isEmpty(savedFilters) && (
          <Fragment>
            <div className="Font14 Gray bold pTop16 pBottom16">{_l('常用筛选')}</div>
            {[
              { title: _l('个人'), data: savedFilters.filter(s => s.type === 1) },
              { title: _l('公共'), data: savedFilters.filter(s => s.type === 2) },
            ].map(item => {
              const { title, data = [] } = item;
              return _.isEmpty(data) ? null : (
                <Fragment>
                  <div className="Gray_75 bold ellipsis mBottom16">{title}</div>
                  {data.map(it => (
                    <SavedItem
                      className={cx('ellipsis', { active: activeSavedFilter.id === it.id })}
                      onClick={() => {
                        setFilterControls(formatForSave(it));
                        updateActiveSavedFilter(it, view);
                      }}
                    >
                      {it.name}
                    </SavedItem>
                  ))}
                </Fragment>
              );
            })}
          </Fragment>
        )}
      </div>
      {!!showQueryBtn && (
        <div className="footer flexRow valignWrapper">
          <div className="flex Font16 centerAlign" onClick={handleReset}>
            {_l('重置')}
          </div>
          <div className="flex Font16 centerAlign query" onClick={() => update()}>
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
    base: state.mobile.base,
  }),
  dispatch =>
    bindActionCreators(
      {
        ..._.pick(actions, ['updateQuickFilter', 'updateActiveSavedFilter']),
        pcUpdateQuickFilter: sheetActions.updateQuickFilter,
        pcUpdateFilters: sheetActions.updateFilters,
      },
      dispatch,
    ),
)(QuickFilter);
