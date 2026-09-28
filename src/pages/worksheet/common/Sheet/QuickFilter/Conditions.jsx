import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Motion, spring } from 'react-motion';
import cx from 'classnames';
import _, { get } from 'lodash';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import styled from 'styled-components';
import { Button } from 'ming-ui/antd-components';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/utils/domain/control/widgetTypes';
import { FILTER_CONDITION_TYPE } from 'src/utils/domain/worksheet/filterConstants';
import { formatQuickFilterValueToControlValue } from 'src/utils/domain/worksheet/filterQuick';
import { validate } from 'src/utils/domain/worksheet/filterQuick';
import { formatFilterValuesToServer } from 'src/utils/services/worksheet/quickFilter';
import FilterInput, { NumberTypes, TextTypes } from './Inputs';

const Con = styled.div`
  display: flex;
  flex-wrap: wrap;
  // 同一行的筛选项按行高居中：某个筛选项变高时（选中值多的关联记录、多选），
  // 顶部对齐会让旁边的筛选项贴在顶上、下方留出大片空白
  align-items: center;
  flex: 1;
  padding: ${({ $isConfigMode }) => ($isConfigMode ? '0 10px' : '0 10px 0 20px')};
`;

const Item = styled.div(
  ({ $maxWidth, $isConfigMode, $highlight }) => `
  display: flex;
  margin-bottom: 8px;
  width: ${$maxWidth};
  ${
    $isConfigMode
      ? `
    cursor: pointer;
    padding: 10px 0;
    margin-bottom: 0px;
    box-sizing: border-box;
    border: 1px solid ${$highlight ? 'var(--color-primary)' : 'transparent'};
    > * {
      pointer-events: none;
      user-select: none;
    }
  `
      : ''
  }
  &.isFirstFullLine {
    width: auto;
    max-width: ${$maxWidth};
    .content {
      width: auto;
    }
  }
`,
);

const Label = styled.div`
  font-size: 13px;
  color: var(--color-text-secondary);
  max-width: 140px;
  min-width: 60px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-weight: bold;
  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .requiredMark {
    flex-shrink: 0;
  }
`;

const Content = styled.div`
  flex: 1;
  width: 0;
  margin: 0 10px;
  min-height: 34px;
`;

const Operate = styled.div`
  height: 32px;
  text-align: left;
  margin-bottom: 12px;
  margin-left: 16px;
  ${({ $isConfigMode }) =>
    $isConfigMode
      ? `
      padding: 10px 0;
      height: 52px;
      `
      : ''}
  ${({ $isFilterComp }) =>
    $isFilterComp
      ? `
          margin-bottom: 0px;
          `
      : ''}
  &.operateIsNewLine {
    padding-left: 54px;
  }
`;

const ExpandBtn = styled.div`
  margin-left: 20px;
  cursor: pointer;
  color: var(--color-primary);
  font-size: 13px;
  .icon {
    margin-right: 2px;
    font-size: 15px;
  }
  &:hover {
    color: var(--color-link-hover);
  }
`;

function isFullLine(filter) {
  return String((filter.advancedSetting || {}).direction) === '1';
}

export function turnControl(control) {
  if (control.type === WIDGETS_TO_API_TYPE_ENUM.SHEET_FIELD) {
    control.type = control.sourceControlType;
  }

  if (control.type === WIDGETS_TO_API_TYPE_ENUM.SUBTOTAL && control) {
    control.type = control.enumDefault2 || 6;
  }

  if (control.type === WIDGETS_TO_API_TYPE_ENUM.FORMULA_DATE) {
    control.type = control.enumDefault === 2 ? (control.unit === '3' ? 15 : 16) : 6;
  }

  if (control.type === WIDGETS_TO_API_TYPE_ENUM.FORMULA_FUNC) {
    control.type = control.enumDefault2;
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

export function getValues(items, { includeDefaultValues = true } = {}) {
  const values = {};
  items.forEach((item, i) => {
    const key = `${_.get(item, 'control.controlId') || _.get(item, 'controlId')}-${i}`;

    if (includeDefaultValues && (!_.isEmpty(item.value) || !_.isEmpty(item.values))) {
      values[key] = {
        values: item.values,
        value: item.value,
      };
    } else if (get(item, 'dataType') === 29) {
      values[key] = {
        values: [],
      };
    }
  });
  return values;
}

export default function Conditions(props) {
  const {
    from,
    defaultTriggerUpdate = false,
    showTextAdvanced,
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
    viewRowsLoading,
  } = props;
  const [values, setValues] = useState({});
  const [relateRecordResetKey, setRelateRecordResetKey] = useState(0);
  const [isQuerying, setIsQuerying] = useState(false);
  const didMount = useRef();
  const showQueryBtn = _.isUndefined(props.showQueryBtn)
    ? _.get(view, 'advancedSetting.enablebtn') === '1'
    : props.showQueryBtn;
  const store = useRef({});
  const debounceUpdateQuickFilter = useRef(_.debounce(updateQuickFilter, 500));
  const items = useMemo(
    () => {
      return filters
        .map(filter => {
          const controlObj = filter.control || _.find(controls, c => c.controlId === filter.controlId);
          const newControl = controlObj && _.cloneDeep(turnControl(controlObj));
          const isRequired =
            _.get(view, 'advancedSetting.fastrequired') === '1' &&
            _.includes(_.get(view, 'advancedSetting.requiredcids', ''), (newControl || {}).controlId);
          return {
            ...filter,
            isRequired,
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
      _.get(view, 'advancedSetting.fastrequired'),
      _.get(view, 'advancedSetting.requiredcids'),
    ],
  );
  const [prevItems, setPrevItems] = useState(items);

  if (items !== prevItems) {
    setPrevItems(items);
    setValues({});
  }

  function update(newValues, { noDebounce, skipRequiredCheck } = {}) {
    didMount.current = true;
    const valuesToUpdate = newValues || values;
    const needCheckRequired = _.get(view, 'advancedSetting.fastrequired') === '1' && !skipRequiredCheck;
    const itemsWithValues = items.map((item, i) => ({
      ...item,
      filterType: item.dataType === 36 ? item.filterType : item.filterType || (item.dataType === 29 ? 24 : 2),
      spliceType: item.spliceType || 1,
      ...valuesToUpdate[`${_.get(item, 'control.controlId')}-${i}`],
    }));

    if (needCheckRequired) {
      const emptyItems = itemsWithValues.filter(item => item.isRequired && !validate(item));

      if (emptyItems.length) {
        alert(_l('请填写%0筛选值', _.get(emptyItems, '0.control.controlName')), 3);
        return;
      }
    }

    const quickFilter = itemsWithValues.filter(validate).map(conditionAdapter);

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

      if (_.includes(TextTypes.concat(NumberTypes), store.current.activeType) && !noDebounce) {
        debounceUpdateQuickFilter.current(formattedFilter, view);
      } else {
        debounceUpdateQuickFilter.current.cancel();
        updateQuickFilter(formattedFilter, view);
      }
    } else {
      if (!noDebounce) {
        debounceUpdateQuickFilter.current([], view);
      } else {
        updateQuickFilter([], view);
      }
    }
  }

  useEffect(() => {
    didMount.current = false;
    setValues(getValues(filters));
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
    if (!viewRowsLoading) {
      setIsQuerying(false);
    }
  }, [viewRowsLoading]);
  useEffect(() => {
    didMount.current = true;
    if (defaultTriggerUpdate) {
      // 自动触发(自定义页面筛选器进入即筛选)时不校验必填：必填未配默认值不应拦截首次自动筛选，
      // 空必填字段由下方 validate 过滤自然忽略、照常筛选，与工作表快速筛选行为一致。
      update(undefined, { skipRequiredCheck: true });
    }
  }, []);
  const visibleItems = items.slice(0, _.isNumber(hideStartIndex) ? hideStartIndex : undefined);
  const filtersData = Object.keys(values)
    .map(key => {
      const keyIndex = key.split('-')[1];
      const control = _.get(items[keyIndex], 'control') || {};
      return {
        ...control,
        type:
          (control.type === 9 || control.type === 11) &&
          String(get(items[keyIndex], 'advancedSetting.allowitem')) === '2'
            ? 10
            : control.type,
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
          ..._.pick(values[key], ['value', 'values', 'dateRange', 'advancedSetting']),
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
  store.current.values = values;
  return (
    <Con className={className} $isConfigMode={isConfigMode} style={items.length ? { marginTop: 8 } : {}}>
      {visibleItems.map((item, i) => (
        <Item
          $isConfigMode={isConfigMode}
          $highlight={activeFilterId === item.fid}
          key={i}
          className={cx(
            'conditionItem ' + (i === 0 && firstIsFullLine && !fullShow ? 'isFirstFullLine' : ''),
            item.className,
          )}
          $maxWidth={
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
          <Label className="label" title={item.control.controlName}>
            <span className="name">{item.control.controlName || _l('未命名')}</span>
            {item.isRequired && (
              <span className="requiredMark" style={{ color: 'var(--color-error)' }}>
                *
              </span>
            )}
          </Label>
          <Content className="content">
            <FilterInput
              key={item.dataType === WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET ? relateRecordResetKey : undefined}
              showTextAdvanced={showTextAdvanced}
              from={from}
              appendToBody={isFilterComp}
              projectId={projectId}
              worksheetId={worksheetId}
              appId={appId}
              viewId={view.viewId}
              {...item}
              {...values[`${item.control.controlId}-${i}`]}
              filtersData={filtersData}
              onChange={(change = {}, { forceUpdate } = {}) => {
                const values = store.current.values;
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
          className={cx('buttons flexCenter', operateIsNewLine ? 'operateIsNewLine' : '')}
          $isConfigMode={isConfigMode}
          $isFilterComp={isFilterComp}
        >
          {showQueryBtn && (
            <Button
              color="var(--app-primary-color)"
              className="quickFilterButton mRight10"
              onClick={() => {
                if (viewRowsLoading && isQuerying) {
                  return;
                }

                setIsQuerying(true);
                update(undefined, { noDebounce: true });
              }}
              loading={viewRowsLoading && isQuerying}
            >
              {viewRowsLoading && isQuerying ? _l('查询中...') : queryText || _l('查询')}
            </Button>
          )}
          {showQueryBtn && (
            <Button
              className="quickFilterButton quickFilterReset"
              onClick={() => {
                setValues(getValues(items, { includeDefaultValues: false }));
                // 搜索词由关联记录组件内部维护，未选记录时 values 也不会变化，重置时一并重新初始化。
                setRelateRecordResetKey(key => key + 1);
                resetQuickFilter(view);
              }}
            >
              {_l('重置')}
            </Button>
          )}
          {showExpand && (
            <ExpandBtn
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
