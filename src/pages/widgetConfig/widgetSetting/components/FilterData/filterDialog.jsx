import React, { Fragment, useRef, useState } from 'react';
import { isEmpty, isEqual } from 'lodash';
import _ from 'lodash';
import { Dialog, Support } from 'ming-ui';
import FilterConfig from 'src/pages/worksheet/common/WorkSheetFilter/common/FilterConfig';
import { CONTROL_FILTER_WHITELIST } from 'src/pages/worksheet/common/WorkSheetFilter/enum';
import {
  filterUnavailableConditions,
  getTypeKey,
  redefineComplexControl,
} from 'src/pages/worksheet/common/WorkSheetFilter/util';
import 'src/pages/worksheet/common/WorkSheetFilter/WorkSheetFilter.less';
import { filterControlsFromAll } from '../../../util';
import { getAdvanceSetting, isSingleRelateSheet } from '../../../util/setting';
import EmptyRuleConfig from '../EmptyRuleConfig';
import './filterDialog.less';

export default function FilterDialog(props) {
  const {
    allowEmpty,
    supportGroup,
    data = {},
    onChange,
    onClose,
    allControls = [], //动态字段值显示的Controls
    title,
    fromCondition, //筛选作用的控件
    relationControls, //关联表的Controls
    helpHref,
    showSubtotalTip,
    globalSheetInfo = {},
    globalSheetControls, //主标控件 用于 子表中的关联记录字段筛选选择范围，支持使用主表中的字段
    hideSupport,
    showCustom = false,
    filterKey = 'filters',
    sheetSwitchPermit = [],
    showEmptyRule = false,
    from,
  } = props;

  const { sourceControlId = '', type = '' } = data;
  const originFilters = props.filters || getAdvanceSetting(data, [filterKey]);
  const [filters, setFilters] = useState(originFilters);
  const ruleRef = useRef(null);

  const relateSheetList = filterControlsFromAll(
    allControls,
    item => isSingleRelateSheet(item) && isEqual(item.controlId, data.controlId),
  );

  const currentColumns = allControls.map(redefineComplexControl);

  return (
    <Dialog
      visible
      title={title || _l('筛选关联记录')}
      okDisabled={isEmpty(filters) && !allowEmpty}
      okText={_l('确定')}
      cancelText={_l('取消')}
      className="filterDialog"
      width={560}
      overlayClosable={props.overlayClosable}
      onCancel={onClose}
      onOk={() => {
        function formatCondition(condition) {
          if (condition.groupFilters) {
            return {
              ...condition,
              groupFilters: condition.groupFilters.map(formatCondition),
            };
          }
          const control = _.find(relationControls, column => condition.controlId === column.controlId) || {};
          // type为关联他表，type取sourceControlType的值 -1//无值, 通用方法转换redefineComplexControl

          const conditionGroupKey = getTypeKey(redefineComplexControl(control).type);
          const conditionGroupType = (CONTROL_FILTER_WHITELIST[conditionGroupKey] || {}).value;
          const dataRangeInfo = fromCondition === 'subTotal' && conditionGroupKey === 'DATE' ? { dateRange: 18 } : {};

          const ruleConfig = showEmptyRule && ruleRef.current ? { emptyRule: ruleRef.current } : {};
          let initialDynamicSource = {
            ...condition,
            ...dataRangeInfo,
            conditionGroupType,
            type: condition.filterType,
            values: [],
            maxValue: undefined,
            minValue: undefined,
            value: undefined,
            fullValues: [],
            isDynamicsource: true,
            ...ruleConfig,
          };
          let initialSource = {
            ...condition,
            ...dataRangeInfo,
            conditionGroupType,
            type: condition.filterType,
            dynamicSource: [],
            isDynamicsource: false,
            ...ruleConfig,
          };
          if (condition.isDynamicsource === undefined) {
            if ((_.get(condition, 'dynamicSource') || []).length > 0) {
              return initialDynamicSource;
            } else {
              return initialSource;
            }
          } else {
            if (!condition.isDynamicsource) {
              return initialSource;
            } else {
              return initialDynamicSource;
            }
          }
        }
        const data = filters.map(formatCondition).filter(_.identity);
        onChange({
          filters: filterUnavailableConditions(data),
        });
      }}
    >
      <Fragment>
        {showSubtotalTip && <div className="Gray_9e">{_l('设置筛选字段后，汇总结果需要在表单提交后才能显示')}</div>}
        <FilterConfig
          supportGroup={supportGroup}
          canEdit
          feOnly
          filterColumnClassName="sheetViewFilterColumnOption"
          projectId={globalSheetInfo.projectId}
          appId={globalSheetInfo.appId}
          sheetSwitchPermit={sheetSwitchPermit}
          columns={relationControls}
          conditions={filters}
          filterDept={type !== 29}
          currentColumns={currentColumns}
          showCustom={showCustom}
          from={fromCondition}
          filterResigned={false}
          widgetControlData={{ ...data, globalSheetId: globalSheetInfo.worksheetId, isSubList: from === 'subList' }} // 关联控件配置
          sourceControlId={sourceControlId}
          relateSheetList={relateSheetList} // 除去自身的本表的关联单条的数据
          onConditionsChange={conditions => {
            setFilters(conditions);
          }}
          globalSheetControls={globalSheetControls}
        />

        {showEmptyRule && (
          <EmptyRuleConfig {...props} filters={filters} handleChange={value => (ruleRef.current = value)} />
        )}

        {!hideSupport && (
          <Support
            type={3}
            style={{ position: 'absolute', bottom: 27 }}
            href={helpHref || 'https://help.mingdao.com/worksheet/filter-associated-records'}
            text={_l('帮助')}
          />
        )}
      </Fragment>
    </Dialog>
  );
}
