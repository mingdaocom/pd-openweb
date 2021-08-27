import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import { Dropdown, Icon, Tooltip, Input } from 'ming-ui';
import renderConditionValue from './contents';
import { getConditionOverrideValue, getFilterTypes } from '../util';
import { FILTER_RELATION_TYPE, CONTROL_FILTER_WHITELIST, FILTER_CONDITION_TYPE, API_ENUM_TO_TYPE } from '../enum';
import { Select } from 'antd';
import { conditionTypeListData } from 'src/pages/FormSet/components/columnRules/config';
// 为空 不为空  在范围内 不在范围内
const listType = [
  FILTER_CONDITION_TYPE.ISNULL,
  FILTER_CONDITION_TYPE.HASVALUE,
  FILTER_CONDITION_TYPE.BETWEEN,
  FILTER_CONDITION_TYPE.NBETWEEN,
];
// 附件 检查框 地区 地区 地区
const listControlType = [
  API_ENUM_TO_TYPE.ATTACHMENT,
  API_ENUM_TO_TYPE.SWITCH,
  API_ENUM_TO_TYPE.AREA_INPUT_24,
  API_ENUM_TO_TYPE.AREA_INPUT_19,
  API_ENUM_TO_TYPE.AREA_INPUT_23,
];
export default class Condition extends Component {
  static propTypes = {
    isRules: PropTypes.bool,
    projectId: PropTypes.string,
    canEdit: PropTypes.bool,
    index: PropTypes.number,
    conditionGroupType: PropTypes.number,
    relationType: PropTypes.number,
    control: PropTypes.shape({}),
    condition: PropTypes.shape({}),
    conditionsLength: PropTypes.number,
    onChange: PropTypes.func,
    onDelete: PropTypes.func,
    onUpdateFilter: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      isDynamicsource: this.isCanDynamicsource(props) && this.setIsDynamicsourceFn(), // 是否动态筛选值
    };
  }

  componentDidMount() {
    this.state = {
      isDynamicsource: this.isCanDynamicsource(this.props) && this.setIsDynamicsourceFn(), // 是否动态筛选值
    };
  }

  setIsDynamicsourceFn = () => {
    const { condition = [] } = this.props;
    let { dynamicSource = [], isDynamicsource } = condition;
    if (dynamicSource.length > 0) {
      if (isDynamicsource === undefined) {
        isDynamicsource = true;
      }
    } else {
      if (isDynamicsource === undefined) {
        isDynamicsource = false;
      }
    }
    return isDynamicsource;
  };

  isCanDynamicsource = data => {
    const { condition = [], from = '' } = data;
    const { type = '', controlType = '' } = condition;
    {
      /* // 附件 检查框 地区 地区 地区 为空 不为空  在范围内 不在范围内没有动态筛选 */
    }
    return from === 'relateSheet' && !_.includes(listType, type) && !_.includes(listControlType, controlType);
  };

  @autobind
  changeConditionType(type) {
    const { condition, onChange } = this.props;
    const overrideValue = getConditionOverrideValue(type, condition);
    onChange(overrideValue);
  }

  renderOption = () => {
    const {
      isRules,
      projectId,
      canEdit,
      index,
      control,
      conditionGroupType,
      relationType,
      condition,
      conditionsLength,
      onChange,
      onDelete,
      onUpdateFilter,
      from,
      currentColumns,
      columns,
      relateSheetList,
      sourceControlId = '',
    } = this.props;
    return (
      <React.Fragment>
        {index === 0 ? (
          <Dropdown
            disabled={!canEdit}
            defaultValue={relationType}
            isAppendToBody
            menuStyle={{ width: 46 }}
            data={[
              { text: _l('且'), value: FILTER_RELATION_TYPE.AND },
              { text: _l('或'), value: FILTER_RELATION_TYPE.OR },
            ]}
            onChange={value => {
              onUpdateFilter({ relationType: value });
            }}
          />
        ) : (
          <span className="relationType">{[_l('且'), _l('或')][relationType - 1]}</span>
        )}
      </React.Fragment>
    );
  };

  render() {
    const {
      isRules,
      projectId,
      canEdit,
      index,
      control,
      conditionGroupType,
      relationType,
      condition,
      conditionsLength,
      onChange,
      onDelete,
      onUpdateFilter,
      from,
      currentColumns,
      columns,
      relateSheetList,
      sourceControlId = '',
    } = this.props;
    let conditionFilterTypes = getFilterTypes(condition.controlType, control, condition.type);
    if (isRules && control) {
      if (control.type === 29 && control.enumDefault === 2) {
        conditionFilterTypes = conditionFilterTypes.filter(
          type => !_.includes([FILTER_CONDITION_TYPE.RCEQ, FILTER_CONDITION_TYPE.RCNE], type.value),
        );
        if (!_.find(conditionFilterTypes, type => type.value === condition.type)) {
          this.changeConditionType(conditionFilterTypes[0].value);
        }
      }
      if (control.type === 35 || control.type === 27) {
        conditionFilterTypes = conditionFilterTypes.filter(
          type => !_.includes([FILTER_CONDITION_TYPE.BETWEEN, FILTER_CONDITION_TYPE.NBETWEEN], type.value),
        );
      }
    }
    const isDynamicStyle = from === 'relateSheet'; //动态值选择的特定样式
    const isDynamicValue = !_.includes(listType, condition.type) && !_.includes(listControlType, condition.controlType);
    return (
      <div className={cx('conditionItem', { readonly: !canEdit, conditionItemForDynamicStyle: isDynamicStyle })}>
        <div
          className={cx('conditionItemHeader', { isbool: conditionGroupType === CONTROL_FILTER_WHITELIST.BOOL.value })}
        >
          {control ? (
            <React.Fragment>
              <span className="columnName ellipsis" title={control.controlName}>
                {control.controlName}
              </span>
              {conditionGroupType !== CONTROL_FILTER_WHITELIST.BOOL.value && (
                <span className="relation">
                  <Dropdown
                    defaultValue={condition.type || conditionFilterTypes[0].value}
                    disabled={!canEdit}
                    data={conditionFilterTypes}
                    isAppendToBody
                    menuStyle={{ width: 120 }}
                    onChange={this.changeConditionType}
                  />
                </span>
              )}
              <span
                className="deleteBtn ThemeHoverColor3"
                onClick={() => {
                  onDelete();
                }}
              >
                <i className="icon icon-close"></i>
              </span>
            </React.Fragment>
          ) : (
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
          )}
        </div>
        <div className="conditionItemContent">
          {/* // 附件 检查框 地区 地区 地区 为空 不为空  在范围内 不在范围内没有动态筛选 */}
          {isDynamicStyle && (
            <Select
              className="dynamicSource"
              disabled={!isDynamicValue}
              dropdownClassName="dynamicSelectDropdown"
              value={this.state.isDynamicsource ? 2 : 1}
              options={isDynamicValue ? conditionTypeListData : conditionTypeListData.filter(o => o.value === 1)}
              suffixIcon={<Icon icon="arrow-down-border Font14" />}
              onChange={value => {
                this.setState(
                  {
                    isDynamicsource: value === 1 ? false : true,
                  },
                  () => {
                    onChange({
                      isDynamicsource: value === 1 ? false : true,
                    });
                  },
                );
              }}
            />
          )}
          {control ? (
            <div className="conditionValue">
              {renderConditionValue(conditionGroupType, {
                ...condition,
                dateRange: from === 'subTotal' ? 18 : condition.dateRange,
                disabled: !canEdit,
                onChange,
                control,
                relationColumns: columns,
                currentColumns, // 当前表控件list
                relateSheetList,
                projectId,
                sourceControlId,
                from,
                conditionType: condition.controlType,
                isDynamicsource: this.state.isDynamicsource,
                globalSheetControls: this.props.globalSheetControls,
              })}
            </div>
          ) : (
            <Input className="deletedColumn" disabled />
          )}
          {!isDynamicStyle && index !== conditionsLength - 1 && (
            <div className="conditionRelation">{this.renderOption()}</div>
          )}
        </div>
        {isDynamicStyle && index !== conditionsLength - 1 && (
          <div className="conditionRelationBox">{this.renderOption()}</div>
        )}
      </div>
    );
  }
}
