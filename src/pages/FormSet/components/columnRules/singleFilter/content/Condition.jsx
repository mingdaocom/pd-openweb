import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { Dropdown, Icon, Input } from 'ming-ui';
import DiabledInput from 'worksheet/common/WorkSheetFilter/components/contents/DiabledInput';
import { Select } from 'antd';
import AddCondition from './AddCondition';
import renderConditionValue from 'worksheet/common/WorkSheetFilter/components/contents';
import { getConditionOverrideValue, getFilterTypes } from 'worksheet/common/WorkSheetFilter/util';
import {
  FILTER_RELATION_TYPE,
  CONTROL_FILTER_WHITELIST,
  FILTER_CONDITION_TYPE,
  API_ENUM_TO_TYPE,
} from 'worksheet/common/WorkSheetFilter/enum';
import { conditionTypeListData } from '../../config';
import 'worksheet/common/WorkSheetFilter/WorkSheetFilter.less';
import { isCustomOptions } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import cx from 'classnames';
import _ from 'lodash';

// 为空 不为空  在范围内 不在范围内
const listType = [
  FILTER_CONDITION_TYPE.ISNULL,
  FILTER_CONDITION_TYPE.HASVALUE,
  FILTER_CONDITION_TYPE.BETWEEN,
  FILTER_CONDITION_TYPE.NBETWEEN,
  FILTER_CONDITION_TYPE.DATE_BETWEEN,
  FILTER_CONDITION_TYPE.DATE_NBETWEEN,
];
// 附件 检查框 地区 地区 地区
const listControlType = [
  API_ENUM_TO_TYPE.ATTACHMENT,
  API_ENUM_TO_TYPE.SWITCH,
  API_ENUM_TO_TYPE.AREA_INPUT_24,
  API_ENUM_TO_TYPE.AREA_INPUT_19,
  API_ENUM_TO_TYPE.AREA_INPUT_23,
];

//附件 检查框 自由链接 子表 签名
const showListControlType = [
  API_ENUM_TO_TYPE.ATTACHMENT,
  API_ENUM_TO_TYPE.SWITCH,
  API_ENUM_TO_TYPE.RELATION,
  API_ENUM_TO_TYPE.SUBLIST,
  API_ENUM_TO_TYPE.SIGNATURE,
];

export default class Condition extends Component {
  static propTypes = {
    projectId: PropTypes.string,
    index: PropTypes.number,
    childIndex: PropTypes.number,
    conditionGroupType: PropTypes.number,
    control: PropTypes.shape({}),
    condition: PropTypes.shape({}),
    conditionsLength: PropTypes.number,
    conditionsChildLength: PropTypes.number,
    onChange: PropTypes.func,
    onDelete: PropTypes.func,
    onUpdateRelationType: PropTypes.func,
    addCondition: PropTypes.func,
    conditionError: PropTypes.string,
  };
  constructor(props) {
    super(props);
    this.state = {};
  }

  @autobind
  changeConditionType(type) {
    const { condition = {}, onChange } = this.props;
    const overrideValue = getConditionOverrideValue(type, condition);
    let options = {
      ...overrideValue,
      dynamicSource: condition.dynamicSource,
      isDynamicsource: condition.isDynamicsource,
    };
    if (_.includes(listType, type)) {
      options.isDynamicsource = false;
      options.dynamicSource = [];
    }
    if (condition.fullValues) {
      options.fullValues = condition.fullValues;
    }
    onChange(options, false);
  }

  render() {
    const {
      projectId,
      index,
      childIndex,
      control,
      conditionGroupType,
      condition,
      conditionsLength,
      conditionsChildLength,
      onChange,
      onDelete,
      onUpdateRelationType,
      currentColumns,
      columns,
      relateSheetList,
      sourceControlId = '',
      conditionError,
      addCondition,
    } = this.props;
    //是否有固定值、动态值,没有过滤选项
    const isStaticValue = _.includes([FILTER_CONDITION_TYPE.ISNULL, FILTER_CONDITION_TYPE.HASVALUE], condition.type);
    const isDynamicValue = !_.includes(listType, condition.type) && !_.includes(listControlType, condition.controlType);
    const isDynamicsource = condition.isDynamicsource || condition.dynamicSource.length > 0;
    //是否显示或分界线或添加条件icon
    const showOrRelate = childIndex === conditionsChildLength - 1 && index !== conditionsLength - 1;
    let conditionTypeListDataFilter = [...conditionTypeListData];
    if (!_.includes(showListControlType, condition.controlType) && isStaticValue) {
      conditionTypeListDataFilter = conditionTypeListDataFilter.filter(item => item.value === 1);
    }
    if (!isDynamicValue) {
      conditionTypeListDataFilter = conditionTypeListDataFilter.filter(item => item.value === 2);
    }

    let conditionFilterTypes = getFilterTypes(condition.controlType, control, condition.type, 'rule');
    if (control) {
      if (
        control.type === 29 &&
        control.enumDefault === 2 &&
        _.get(control.advancedSetting || {}, 'showtype') === '2'
      ) {
        conditionFilterTypes = conditionFilterTypes.filter(
          type => !_.includes([FILTER_CONDITION_TYPE.RCEQ, FILTER_CONDITION_TYPE.RCNE], type.value),
        );
        if (!_.find(conditionFilterTypes, type => type.value === condition.type)) {
          this.changeConditionType(conditionFilterTypes[0].value);
        }
      }
      if (_.includes([35, 27, 19, 23, 24], control.type)) {
        conditionFilterTypes = conditionFilterTypes.filter(
          type => !_.includes([FILTER_CONDITION_TYPE.BETWEEN, FILTER_CONDITION_TYPE.NBETWEEN], type.value),
        );
      }
    }
    const dynamicValueDisabled = isCustomOptions(control);
    return (
      <div className="conditionItem mTop10">
        <div className="conditionItemHeader">
          {control.controlId ? (
            <React.Fragment>
              {control.controlName ? (
                <span className="columnName ellipsis">{control.controlName}</span>
              ) : (
                <span className="columnName ellipsis Red">{_l('字段已删除')}</span>
              )}
              {conditionGroupType !== CONTROL_FILTER_WHITELIST.BOOL.value && (
                <span className="relation">
                  <Dropdown
                    defaultValue={condition.type || (conditionFilterTypes[0] || {}).value}
                    data={conditionFilterTypes}
                    isAppendToBody
                    menuClass="conditionDropdownMenu"
                    onChange={this.changeConditionType}
                  />
                </span>
              )}
              <span
                className="deleteBtn"
                onClick={() => {
                  onDelete();
                }}
              >
                <i className="icon icon-delete1"></i>
              </span>
              <div className="conditionItemContent">
                <div className="conditionItemContentLeft">
                  {conditionTypeListDataFilter.length > 0 ? (
                    <Fragment>
                      {/* // 附件 检查框 地区 地区 地区 为空 不为空  在范围内 不在范围内没有动态筛选 */}
                      {isDynamicValue && (
                        <Select
                          className="ruleListSelect"
                          dropdownClassName="ruleListSelectDropdown"
                          disabled={dynamicValueDisabled}
                          value={isDynamicsource ? 2 : 1}
                          options={conditionTypeListDataFilter}
                          suffixIcon={<Icon icon="arrow-down-border Font14" />}
                          onChange={value => {
                            onChange({
                              isDynamicsource: value === 1 ? false : true,
                              value: value === 1 ? condition.value : '',
                              values: value === 1 ? condition.values : [],
                              dynamicSource: value === 1 ? [] : condition.dynamicSource,
                            });
                          }}
                        />
                      )}
                      <div className={cx('conditionValue', conditionError)}>
                        {renderConditionValue(conditionGroupType, {
                          ...condition,
                          dateRange: condition.dateRange,
                          onChange,
                          control,
                          relationColumns: columns,
                          currentColumns, // 当前表控件list
                          relateSheetList,
                          projectId,
                          sourceControlId,
                          from: 'rule',
                          conditionType: condition.controlType,
                          isDynamicsource,
                        })}
                      </div>
                    </Fragment>
                  ) : (
                    <DiabledInput />
                  )}
                </div>
                <div className="optionBox">
                  {showOrRelate ? (
                    <AddCondition className="mLeft15" columns={columns} onAdd={value => addCondition(value)} />
                  ) : null}
                  {childIndex !== conditionsChildLength - 1 ? (
                    <Dropdown
                      className="relationItemBox"
                      defaultValue={condition.spliceType}
                      isAppendToBody
                      menuStyle={{ width: 46 }}
                      data={[
                        { text: _l('且'), value: FILTER_RELATION_TYPE.AND },
                        { text: _l('或'), value: FILTER_RELATION_TYPE.OR },
                      ]}
                      onChange={value => {
                        onUpdateRelationType({ spliceType: value });
                      }}
                    />
                  ) : null}
                </div>
              </div>
            </React.Fragment>
          ) : (
            <div className="conditionDeleteCon">
              <div className="deletedColumn">
                <i className="icon icon-info"></i>
                {_l('该字段已删除')}
                <span
                  className="deleteBtn ThemeHoverColor3"
                  onClick={() => {
                    onDelete();
                  }}
                >
                  <i className="icon icon-close"></i>
                </span>
              </div>
              <Input className="deletedColumn" disabled />
            </div>
          )}
        </div>
        {showOrRelate ? (
          <div className="conditionRelationBox">
            <span className="line"></span>
            <Dropdown
              defaultValue={condition.spliceType}
              isAppendToBody
              menuStyle={{ width: 46 }}
              data={[
                { text: _l('且'), value: FILTER_RELATION_TYPE.AND },
                { text: _l('或'), value: FILTER_RELATION_TYPE.OR },
              ]}
              onChange={value => {
                onUpdateRelationType({ spliceType: value });
              }}
            />
          </div>
        ) : null}
      </div>
    );
  }
}
