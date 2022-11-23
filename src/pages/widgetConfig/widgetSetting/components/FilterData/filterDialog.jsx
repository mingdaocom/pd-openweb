import React, { Fragment, useState } from 'react';
import { Dialog, LoadDiv, Support } from 'ming-ui';
import { isEmpty, isEqual } from 'lodash';
import FilterConfig from 'src/pages/worksheet/common/WorkSheetFilter/common/FilterConfig';
import 'src/pages/worksheet/common/WorkSheetFilter/WorkSheetFilter.less';
import { CONTROL_FILTER_WHITELIST } from 'src/pages/worksheet/common/WorkSheetFilter/enum';
import {
  filterUnavailableConditions,
  getTypeKey,
  redefineComplexControl,
} from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { getAdvanceSetting, isSingleRelateSheet } from '../../../util/setting';
import { filterControlsFromAll } from '../../../util';
import './filterDialog.less';

export default function FilterDialog(props) {
  const {
    allowEmpty,
    supportGroup,
    data,
    onChange,
    onClose,
    allControls, //动态字段值显示的Controls
    title,
    fromCondition, //筛选作用的控件
    relationControls, //关联表的Controls
    helpHref,
    showSubtotalTip,
    globalSheetInfo,
    globalSheetControls, //主标控件 用于 子表中的关联记录字段筛选选择范围，支持使用主表中的字段
  } = props;

  const { sourceControlId, type } = data;
  const [filters, setFilters] = useState(props.filters || getAdvanceSetting(data, 'filters'));

  const relateSheetList = filterControlsFromAll(
    allControls,
    item => isSingleRelateSheet(item) && isEqual(item.controlId, data.controlId),
  );

  return (
    <Dialog
      visible
      title={title || _l('筛选关联记录')}
      okDisabled={isEmpty(filters) && !allowEmpty}
      okText={_l('确定')}
      cancelText={_l('取消')}
      className="filterDialog"
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
          };
          let initialSource = {
            ...condition,
            ...dataRangeInfo,
            conditionGroupType,
            type: condition.filterType,
            dynamicSource: [],
            isDynamicsource: false,
          };
          if (condition.isDynamicsource === undefined) {
            if (condition.dynamicSource.length > 0) {
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
          columns={relationControls}
          conditions={filters}
          filterDept={type !== 29}
          currentColumns={allControls}
          from={fromCondition}
          filterResigned={false}
          sourceControlId={sourceControlId}
          relateSheetList={relateSheetList} // 除去自身的本表的关联单条的数据
          onConditionsChange={conditions => {
            setFilters(conditions);
          }}
          globalSheetControls={globalSheetControls}
        />
        <Support
          type={3}
          style={{ position: 'absolute', bottom: 27 }}
          href={helpHref || 'https://help.mingdao.com/sheet14.html'}
          text={_l('帮助')}
        />
      </Fragment>
    </Dialog>
  );
}
