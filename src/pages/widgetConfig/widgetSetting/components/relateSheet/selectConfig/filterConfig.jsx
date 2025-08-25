import React, { Fragment, useState } from 'react';
import { isEqual } from 'lodash';
import _ from 'lodash';
import FilterConfig from 'src/pages/worksheet/common/WorkSheetFilter/common/FilterConfig';
import { CONTROL_FILTER_WHITELIST } from 'src/pages/worksheet/common/WorkSheetFilter/enum';
import { getTypeKey, redefineComplexControl } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import 'src/pages/worksheet/common/WorkSheetFilter/WorkSheetFilter.less';
import { SYSTEM_CONTROL } from '../../../../config/widget';
import { filterControlsFromAll } from '../../../../util';
import { getAdvanceSetting, handleAdvancedSettingChange, isSingleRelateSheet } from '../../../../util/setting';
import EmptyRuleConfig from '../../EmptyRuleConfig';

const formatCondition = ({ filters = [], relationControls = [], ruleValue }) => {
  function formatCondition(condition) {
    if (condition.groupFilters) {
      if (_.isEmpty(condition.groupFilters)) return null;
      return {
        ...condition,
        groupFilters: condition.groupFilters.map(formatCondition),
      };
    }
    const control = _.find(relationControls, column => condition.controlId === column.controlId) || {};
    // type为关联他表，type取sourceControlType的值 -1//无值, 通用方法转换redefineComplexControl

    const conditionGroupKey = getTypeKey(redefineComplexControl(control).type);
    const conditionGroupType = (CONTROL_FILTER_WHITELIST[conditionGroupKey] || {}).value;

    const ruleConfig = ruleValue ? { emptyRule: ruleValue } : {};
    let initialDynamicSource = {
      ...condition,
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
  return data;
};

export default function FilterDialog(props) {
  const {
    data = {},
    controls = [],
    handleChange,
    globalSheetInfo = {},
    globalSheetControls, //主标控件 用于 子表中的关联记录字段筛选选择范围，支持使用主表中的字段
    sheetSwitchPermit = [],
    from,
  } = props;

  const [ruleValue, setValue] = useState('');

  const { sourceControlId = '', type = '' } = data;
  const filters = getAdvanceSetting(data, 'filters') || [];
  const allControls = props.allControls.concat(
    SYSTEM_CONTROL.filter(c => _.includes(['caid', 'ownerid'], c.controlId)),
  );
  const relateSheetList = filterControlsFromAll(
    allControls,
    item => isSingleRelateSheet(item) && isEqual(item.controlId, data.controlId),
  );
  const currentColumns = allControls.map(redefineComplexControl);

  const dealFilters = (newConditions, value) => {
    const newFilters = formatCondition({
      filters: newConditions || filters,
      relationControls: controls,
      ruleValue: value || ruleValue,
    });
    handleChange(
      handleAdvancedSettingChange(data, { filters: _.isEmpty(newFilters) ? '' : JSON.stringify(newFilters) }),
    );
  };

  return (
    <Fragment>
      <FilterConfig
        canEdit
        feOnly
        supportGroup={true}
        filterColumnClassName="sheetViewFilterColumnOption"
        projectId={globalSheetInfo.projectId}
        appId={globalSheetInfo.appId}
        sheetSwitchPermit={sheetSwitchPermit}
        columns={controls}
        conditions={filters}
        filterDept={type !== 29}
        currentColumns={currentColumns}
        showCustom={true}
        from={'relateSheet'}
        filterResigned={false}
        widgetControlData={{ ...data, globalSheetId: globalSheetInfo.worksheetId, isSubList: from === 'subList' }} // 关联控件配置
        sourceControlId={sourceControlId}
        relateSheetList={relateSheetList} // 除去自身的本表的关联单条的数据
        onConditionsChange={dealFilters}
        globalSheetControls={globalSheetControls}
      />

      <EmptyRuleConfig
        {...props}
        filters={filters}
        handleChange={value => {
          setValue(value);
          dealFilters(undefined, value);
        }}
      />
    </Fragment>
  );
}
