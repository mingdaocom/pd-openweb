import React, { useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import { WIDGETS_TO_API_TYPE_ENUM } from 'pages/widgetConfig/config/widget';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import FilterInput, { NumberTypes } from 'mobile/RecordList/QuickFilter/Inputs';
import { conditionAdapter, formatQuickFilter, turnControl, validate } from 'mobile/RecordList/QuickFilter/utils';
import { DATE_TYPE } from 'worksheet/common/ViewConfig/components/fastFilter/config';
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
    background-color: var(--color-border-secondary);
  }
  .body {
    padding: 0 15px;
    overflow: auto;
    .controlWrapper {
      margin-bottom: 20px;
    }
    .selected {
      color: var(--color-primary);
      max-width: 100px;
      padding-left: 10px;
      font-weight: 500;
    }
  }
  .footer {
    border-top: 1px solid var(--color-border-secondary);
    .flex {
      padding: 10px;
    }
    .query {
      color: var(--color-white);
      background-color: var(--color-primary);
    }
  }
`;

const formatFilterValuesToText = (control, item) => {
  const controlType = control.type;
  const { values } = item;
  switch (controlType) {
    case WIDGETS_TO_API_TYPE_ENUM.USER_PICKER: // 人员
      return values.map(v => v.fullname);
    case WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE: // 角色
      return values.map(v => v.organizeName);
    case WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT: // 部门
      return values.map(v => v.departmentName);
    case WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE: // 地区
    case WIDGETS_TO_API_TYPE_ENUM.AREA_CITY: // 地区
    case WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY: // 地区
      return values.map(v => v.name);
    case WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET: // 关联
    case WIDGETS_TO_API_TYPE_ENUM.CASCADER: // 级联
      return values.map(v => v.name || _l('未命名'));
    case WIDGETS_TO_API_TYPE_ENUM.NUMBER: // 数值
    case WIDGETS_TO_API_TYPE_ENUM.MONEY: // 金额
    case WIDGETS_TO_API_TYPE_ENUM.FORMULA_NUMBER: // 公式
    case WIDGETS_TO_API_TYPE_ENUM.TIME: // 时间
    case WIDGETS_TO_API_TYPE_ENUM.DATE: // 日期
    case WIDGETS_TO_API_TYPE_ENUM.DATE_TIME: // 日期时间
      if (item.value || item.minValue || item.maxValue) {
        return [item.value ? item.value : `${item.minValue}~${item.maxValue}`];
      } else {
        const list = _.flatten(DATE_TYPE);
        return [_.get(_.find(list, { value: item.dateRange }), 'text')];
      }
    case WIDGETS_TO_API_TYPE_ENUM.SWITCH: // 检查项
      return item.filterType ? [item.filterType === 2 ? _l('选中') : _l('未选中')] : [];
    case WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU: // 单选
    case WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT: // 多选
    case WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN: // 下拉
      return values.map(id => _.get(_.find(control.options, { key: id }), 'value') || '');
    default:
      return values.filter(_.isString);
  }
};

function QuickFilter(props) {
  const { enableBtn, filters, getFiltersText, updateQuickFilter, onCloseDrawer } = props;
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
        filterType: filter.dataType === 36 ? filter.filterType : filter.filterType || (filter.dataType === 29 ? 24 : 2),
        spliceType: filter.spliceType || 1,
        ...valuesToUpdate[i],
      }))
      .filter(validate)
      .map(conditionAdapter);
    if (getFiltersText) {
      const texts = quickFilter.map(item => {
        const control = _.get(_.find(items, { controlId: item.controlId }), 'control') || {};
        return formatFilterValuesToText(control, item).join('、');
      });
      getFiltersText(texts);
    }
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
        <Icon className="textTertiary close" icon="close" onClick={onCloseDrawer} />
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
