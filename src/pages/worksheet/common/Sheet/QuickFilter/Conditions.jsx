import React, { useState, useEffect, useRef, useMemo } from 'react';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import cx from 'classnames';
import { Motion, spring } from 'react-motion';
import styled from 'styled-components';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import FilterInput, { validate, TextTypes, NumberTypes } from './Inputs';
import { Button } from 'ming-ui';

const Con = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex: 1;
  padding: 0 10px 0 20px;
`;

const Item = styled.div(
  ({ maxWidth }) => `
  display: flex;
  margin-bottom: 8px;
  width: ${maxWidth};
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
`;

const Operate = styled.div`
  position: relative;
  height: 32px;
  text-align: left;
  margin-bottom: 12px;
  margin-left: 16px;
  .Button {
    font-weight: 500;
  }
  &.operateIsNewLine {
    padding-left: 54px;
  }
`;

const ExpandBtn = styled.div(
  ({ showQueryBtn }) => `
  position: absolute;
  top: 6px;
  right: -${showQueryBtn ? 64 : 43}px;
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

function conditionAdapter(condition) {
  delete condition.control;
  return condition;
}

export default function Conditions(props) {
  const {
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
    updateQuickFilter,
    resetQuickFilter,
  } = props;
  const [values, setValues] = useState({});
  const didMount = useRef();
  const showQueryBtn = _.isUndefined(props.showQueryBtn)
    ? _.get(view, 'advancedSetting.enablebtn') === '1'
    : props.showQueryBtn;
  const store = useRef({});
  const debounceUpdateQuickFilter = useRef(_.debounce(updateQuickFilter, 500));
  const items = useMemo(
    () =>
      filters
        .map(filter => {
          const controlObj = _.find(controls, c => c.controlId === filter.controlId);
          const newControl = controlObj && turnControl(controlObj);
          return {
            ...filter,
            dataType: newControl ? newControl.type : filter.dataType,
            control: newControl,
          };
        })
        .filter(c => c.control),
    [JSON.stringify(filters)],
  );
  function update(newValues) {
    didMount.current = true;
    const valuesToUpdate = newValues || values;
    const quickFilter = items
      .map((filter, i) => ({
        ...filter,
        filterType: filter.filterType || 1,
        spliceType: filter.spliceType || 1,
        ...valuesToUpdate[i],
      }))
      .filter(validate)
      .map(conditionAdapter);
    if (quickFilter.length) {
      if (_.includes(TextTypes.concat(NumberTypes), store.current.activeType)) {
        debounceUpdateQuickFilter.current(quickFilter, view);
      } else {
        updateQuickFilter(quickFilter, view);
      }
    } else {
      resetQuickFilter(view);
    }
  }
  useEffect(() => {
    didMount.current = false;
    setValues({});
  }, [view.viewId]);
  useEffect(() => {
    if (didMount.current && !showQueryBtn && !_.isEmpty(values)) {
      update();
    }
  }, [JSON.stringify(filters)]);
  useEffect(() => {
    didMount.current = true;
  }, []);
  return (
    <Con className={cx('quickFilterWrap', className)}>
      {items.map((item, i) => (
        <Item
          key={i}
          className={'conditionItem ' + (i === 0 && firstIsFullLine && !fullShow ? 'isFirstFullLine' : '')}
          maxWidth={
            isFullLine(item)
              ? i === 0 && firstIsFullLine && !fullShow
                ? showQueryBtn
                  ? 'calc(100% - 180px)'
                  : 'calc(100% - 20px)'
                : '100%'
              : `${100 / colNum}%`
          }
        >
          <Label className="label ellipsis" title={item.control.controlName}>
            {item.control.controlName}
          </Label>
          <Content className="content">
            <FilterInput
              projectId={projectId}
              appId={appId}
              {...item}
              {...values[i]}
              onChange={(change = {}, { forceUpdate } = {}) => {
                store.current.activeType = item.control.type;
                const newValues = { ...values, [i]: { ...values[i], ...change } };
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
      {(showQueryBtn || showExpand) && (
        <Operate className={cx('buttons', operateIsNewLine ? 'operateIsNewLine' : '')}>
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
                localStorage.setItem('QUICK_FILTER_FULL_SHOW', !fullShow);
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
