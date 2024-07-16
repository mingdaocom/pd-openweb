import React, { useState, useEffect, useRef, useMemo } from 'react';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import cx from 'classnames';
import { Motion, spring } from 'react-motion';
import { Button } from 'ming-ui';
import styled from 'styled-components';
import { DATE_OPTIONS, FILTER_CONDITION_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import FilterInput, { TextTypes, NumberTypes } from './Inputs';
import { validate } from './utils';
import { formatFilterValuesToServer } from './';
import _ from 'lodash';
import { formatQuickFilterValueToControlValue } from 'worksheet/common/WorkSheetFilter/util';

const Con = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex: 1;
  padding: ${({ isConfigMode }) => (isConfigMode ? '0 10px' : '0 10px 0 20px')};
`;

const Item = styled.div(
  ({ maxWidth, isConfigMode, isLastLine, highlight }) => `
  display: flex;
  margin-bottom: ${isLastLine ? 0 : 8}px;
  width: ${maxWidth};
  ${
    isConfigMode
      ? `
    cursor: pointer;
    padding: 10px 0;
    margin-bottom: 0px;
    box-sizing: border-box;
    border: 1px solid ${highlight ? '#2196f3' : 'transparent'};
    > * {
      pointer-events: none;
      user-select: none;
    }
  `
      : ''
  }
  &.isFirstFullLine {
    width: auto;
    max-width: ${maxWidth};
    .content {
      width: auto;
    }
  }
`,
);

const Label = styled.div`
  font-size: 13px;
  color: #757575;
  max-width: 140px;
  min-width: 60px;
  text-align: right;
  line-height: 1.2em;
  padding-top: 8.2px;
  font-weight: bold;
`;

const Content = styled.div`
  flex: 1;
  width: 0;
  margin: 0 10px;
  min-height: 34px;
`;

const Operate = styled.div`
  position: relative;
  height: 32px;
  text-align: left;
  margin-bottom: 12px;
  margin-left: 16px;
  ${({ isConfigMode }) =>
    isConfigMode
      ? `
      padding: 10px 0;
      `
      : ''}
  ${({ isFilterComp }) =>
    isFilterComp
      ? `
          margin-bottom: 0px;
          `
      : ''}
  .Button {
    font-weight: 500;
  }
  &.operateIsNewLine {
    padding-left: 54px;
  }
`;

const ExpandBtn = styled.div(
  ({ showQueryBtn }) => `
  // position: absolute;
  // top: 6px;
  // right: -${showQueryBtn ? 64 : 43}px;
  display: inline-block;
  margin-left: 20px;
  cursor: pointer;
  color: #2196f3;
  font-size: 13px;
  .icon {
    margin-right: 2px;
    font-size: 15px;
  }
  &:hover {
    color: #1565c0;
  }
`,
);

function isFullLine(filter) {
  return String((filter.advancedSetting || {}).direction) === '1';
}

function turnControl(control) {
  if (control.type === WIDGETS_TO_API_TYPE_ENUM.SHEET_FIELD) {
    control.type = control.sourceControlType;
  }
  if (control.type === WIDGETS_TO_API_TYPE_ENUM.SUBTOTAL && control) {
    control.type = control.enumDefault2 || 6;
  }
  if (control.type === WIDGETS_TO_API_TYPE_ENUM.FORMULA_DATE) {
    control.type = control.enumDefault === 2 ? 15 : 6;
  }
  return control;
}

export function conditionAdapter(condition) {
  delete condition.control;
  if (condition.dataType === 29 && condition.filterType === 2) {
    condition.filterType = 24;
  }
  return condition;
}

function getDefaultValues(items) {
  const values = {};
  items.forEach((item, i) => {
    const key = `${_.get(item, 'control.controlId') || _.get(item, 'controlId')}-${i}`;
    if (!_.isEmpty(item.value) || !_.isEmpty(item.values)) {
      values[key] = {
        values: item.values,
        value: item.value,
      };
    }
  });
  return values;
}

export default function Conditions(props) {
  const {
    from,
    worksheetId,
    isConfigMode,
    isFilterComp,
    activeFilterId,
    projectId,
    appId,
    queryText,
    className,
    view = {},
    colNum,
    operateIsNewLine,
    firstIsFullLine,
    fullShow,
    showExpand,
    setFullShow,
    controls = [],
    filters = [],
    navGroupFilters = [],
    hideStartIndex,
    updateQuickFilter,
    resetQuickFilter,
    onFilterClick,
  } = props;
  const [values, setValues] = useState({});
  const didMount = useRef();
  const showQueryBtn = _.isUndefined(props.showQueryBtn)
    ? _.get(view, 'advancedSetting.enablebtn') === '1'
    : props.showQueryBtn;
  const store = useRef({});
  const debounceUpdateQuickFilter = useRef(_.debounce(updateQuickFilter, 500));
  const items = useMemo(
    () => {
      setValues({});
      return filters
        .map(filter => {
          const controlObj = filter.control || _.find(controls, c => c.controlId === filter.controlId);
          const newControl = controlObj && _.cloneDeep(turnControl(controlObj));
          return {
            ...filter,
            dataType: newControl ? newControl.type : filter.dataType,
            control: newControl,
            filterType: newControl && newControl.encryId ? 2 : filter.filterType,
          };
        })
        .filter(c => c.control && !(window.shareState.shareId && _.includes([26, 27, 48], c.control.type)));
    }, // 分享状态快速筛选不应该显示 成员 部门 角色
    [
      JSON.stringify(filters),
      JSON.stringify(controls.map(c => _.pick(c, ['controlName', 'options']))),
      JSON.stringify(controls.filter(c => c.relationControls).map(c => _.map(c.relationControls, rc => rc.controlId))),
    ],
  );
  function update(newValues) {
    didMount.current = true;
    const valuesToUpdate = newValues || values;
    const quickFilter = items
      .map((item, i) => ({
        ...item,
        filterType: item.filterType || (item.dataType === 29 ? 24 : 2),
        spliceType: item.spliceType || 1,
        ...valuesToUpdate[`${_.get(item, 'control.controlId')}-${i}`],
      }))
      .filter(validate)
      .map(conditionAdapter);
    if (quickFilter.length) {
      const formattedFilter = quickFilter.map(c => {
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
        debounceUpdateQuickFilter.current(formattedFilter, view);
      } else {
        debounceUpdateQuickFilter.current.cancel();
        updateQuickFilter(formattedFilter, view);
      }
    } else {
      debounceUpdateQuickFilter.current([], view);
    }
  }
  useEffect(() => {
    didMount.current = false;
    setValues(getDefaultValues(filters));
  }, [view.viewId]);
  useEffect(() => {
    let newValues;
    if (isConfigMode) {
      newValues = { ...values };
      filters.forEach((item, i) => {
        const key = `${item.control.controlId}-${i}`;
        newValues[key] = _.pick(item, 'dateRange', 'filterType', 'value', 'values', 'minValue', 'maxValue');
      });
      setValues(newValues);
    }
    if (didMount.current && !showQueryBtn && !_.isEmpty(values)) {
      update(newValues);
    }
  }, [JSON.stringify(filters)]);
  useEffect(() => {
    didMount.current = true;
    if (from === 'filterComp') {
      update();
    }
  }, []);
  const visibleItems = items.slice(0, _.isNumber(hideStartIndex) ? hideStartIndex : undefined);
  const filtersData = Object.keys(values)
    .map(key => {
      const keyIndex = key.split('-')[1];
      return {
        ...(_.get(items[keyIndex], 'control') || {}),
        controlId: 'fastFilter_' + _.get(items[keyIndex], 'control.controlId'),
        value: formatQuickFilterValueToControlValue(_.get(items[keyIndex], 'control.type'), values[key]),
        filterValue: _.includes(
          [
            WIDGETS_TO_API_TYPE_ENUM.DATE, // 日期  * 类型无法转换成控件值
            WIDGETS_TO_API_TYPE_ENUM.DATE_TIME, // 日期时间 * 类型无法转换成控件值
            WIDGETS_TO_API_TYPE_ENUM.TIME, //  时间 * 类型无法转换成控件值
          ],
          _.get(items[keyIndex], 'control.type'),
        ) && {
          ..._.pick(values[key], ['value', 'values', 'dateRange']),
          values: formatFilterValuesToServer(_.get(items[keyIndex], 'control.type'), _.get(values[key], 'values')),
        },
      };
    })
    .concat(
      navGroupFilters.map(c => ({
        controlId: 'navGroup_' + c.controlId,
        filterValue: { values: c.values, ...(c.filterType === 7 ? { filterType: c.filterType } : {}) },
      })),
    );
  return (
    <Con className={className} isConfigMode={isConfigMode} style={items.length ? { marginTop: 8 } : {}}>
      {visibleItems.map((item, i) => (
        <Item
          isConfigMode={isConfigMode}
          highlight={activeFilterId === item.fid}
          key={i}
          className={cx(
            'conditionItem ' + (i === 0 && firstIsFullLine && !fullShow ? 'isFirstFullLine' : ''),
            item.className,
          )}
          maxWidth={
            isFullLine(item)
              ? i === 0 && firstIsFullLine && !fullShow
                ? showQueryBtn
                  ? 'calc(100% - 180px)'
                  : 'calc(100% - 20px)'
                : '100%'
              : `${100 / colNum}%`
          }
          onClick={isConfigMode ? () => onFilterClick(item.fid, item) : _.noop}
        >
          <Label className="label ellipsis" title={item.control.controlName}>
            {item.control.controlName || _l('未命名')}
          </Label>
          <Content className="content">
            <FilterInput
              from={from}
              appendToBody={isFilterComp}
              projectId={projectId}
              worksheetId={worksheetId}
              appId={appId}
              {...item}
              {...values[`${item.control.controlId}-${i}`]}
              filtersData={filtersData}
              onChange={(change = {}, { forceUpdate } = {}) => {
                store.current.activeType = item.control.type;
                const key = `${item.control.controlId}-${i}`;
                const newValues = {
                  ...values,
                  [key]: { ...values[key], ...change },
                };
                setValues(newValues);
                if ((!showQueryBtn || forceUpdate) && !_.isEmpty(newValues)) {
                  update(newValues);
                }
              }}
              onEnterDown={() => {
                if (showQueryBtn) {
                  update();
                }
              }}
            />
          </Content>
        </Item>
      ))}
      {(showQueryBtn || showExpand) && !!visibleItems.length && (
        <Operate
          className={cx('buttons', operateIsNewLine ? 'operateIsNewLine' : '')}
          isConfigMode={isConfigMode}
          isFilterComp={isFilterComp}
        >
          {showQueryBtn && (
            <Button type="primary" className="mRight10" size="mdnormal" onClick={() => update()}>
              {queryText || _l('查询')}
            </Button>
          )}
          {showQueryBtn && (
            <Button
              type="ghostgray"
              size="mdnormal"
              onClick={() => {
                setValues({});
                resetQuickFilter(view);
              }}
            >
              {_l('重置')}
            </Button>
          )}
          {showExpand && (
            <ExpandBtn
              showQueryBtn={showQueryBtn}
              onClick={() => {
                setFullShow(!fullShow);
                safeLocalStorageSetItem('QUICK_FILTER_FULL_SHOW', !fullShow);
              }}
            >
              <Motion
                defaultStyle={{ rotate: fullShow ? 0 : 180 }}
                style={{
                  rotate: spring(fullShow ? 0 : 180),
                }}
              >
                {({ rotate }) => (
                  <i
                    className="InlineBlock icon icon-arrow-up-border"
                    style={{ transform: `rotate(${rotate}deg)` }}
                  ></i>
                )}
              </Motion>
              {fullShow ? _l('收起') : _l('展开')}
            </ExpandBtn>
          )}
        </Operate>
      )}
    </Con>
  );
}

Conditions.propTypes = {
  isConfigMode: bool,
  isFilterComp: bool,
  projectId: string,
  className: string,
  queryText: string,
  colNum: number,
  showQueryBtn: bool,
  operateIsNewLine: bool,
  firstIsFullLine: bool,
  fullShow: bool,
  view: shape({}),
  controls: arrayOf(shape({})),
  filters: arrayOf(shape({})),
  showExpand: func,
  setFullShow: func,
  updateQuickFilter: func,
  resetQuickFilter: func,
};
