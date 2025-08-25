import React, { Component } from 'react';
import { Select, Tooltip } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Dropdown, Icon, Input } from 'ming-ui';
import { isCustomOptions } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import {
  API_ENUM_TO_TYPE,
  CONDITION_OPTIONS,
  CONTROL_FILTER_WHITELIST,
  FILTER_CONDITION_TYPE,
  FILTER_RELATION_TYPE,
} from '../enum';
import { getConditionOverrideValue, getFilterTypes } from '../util';
import renderConditionValue from './contents';

// 为空 不为空  在范围内 不在范围内
const listType = [
  FILTER_CONDITION_TYPE.ISNULL,
  FILTER_CONDITION_TYPE.HASVALUE,
  FILTER_CONDITION_TYPE.BETWEEN,
  FILTER_CONDITION_TYPE.NBETWEEN,
  FILTER_CONDITION_TYPE.NORMALUSER,
  FILTER_CONDITION_TYPE.PORTALUSER,
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
  API_ENUM_TO_TYPE.LOCATION,
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
    const { condition = [], from } = this.props;
    let { dynamicSource, isDynamicsource } = condition;
    if (dynamicSource && dynamicSource.length > 0) {
      if (isDynamicsource === undefined) {
        isDynamicsource = true;
      }
    } else {
      if (isDynamicsource === undefined) {
        // 关联查询、工作表查询等默认值为动态值
        isDynamicsource =
          _.includes(['relateSheet'], from) && _.isUndefined(dynamicSource) && this.getIsDynamicValue() ? true : false;
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
    return (
      from === 'relateSheet' &&
      !(!_.includes([27], condition.controlType) && _.includes(listType, type)) &&
      !_.includes(listControlType, controlType)
    );
  };

  getIsDynamicValue = () => {
    const { condition, control } = this.props;
    return (
      !(!_.includes([27], condition.controlType) && _.includes(listType, condition.type)) &&
      !_.includes(listControlType, condition.controlType) &&
      !isCustomOptions(control)
    );
  };

  changeConditionType = type => {
    const { condition, onChange } = this.props;
    const overrideValue = getConditionOverrideValue(type, condition);
    onChange(overrideValue);

    if (_.includes(listType, type) && !_.includes([27], condition.controlType)) {
      this.setState({ isDynamicsource: false });
    }
  };

  renderOption = () => {
    const { canEdit, index, relationType, onUpdateFilter } = this.props;
    return (
      <React.Fragment>
        {index === 0 ? (
          <Dropdown
            disabled={!canEdit}
            defaultValue={relationType}
            isAppendToBody
            menuStyle={{ width: 'auto' }}
            data={[
              { text: _l('且%25000'), value: FILTER_RELATION_TYPE.AND },
              { text: _l('或'), value: FILTER_RELATION_TYPE.OR },
            ]}
            onChange={value => {
              onUpdateFilter({ relationType: value });
            }}
          />
        ) : (
          <span className="relationType">{[_l('且%25000'), _l('或')][relationType - 1]}</span>
        )}
      </React.Fragment>
    );
  };

  render() {
    const {
      isRules,
      projectId,
      appId,
      canEdit,
      index,
      control,
      conditionGroupType,
      condition,
      conditionsLength,
      onChange,
      onDelete,
      from,
      currentColumns,
      columns,
      relateSheetList,
      sourceControlId = '',
      filterDept,
      isSheetFieldError,
      filterResigned = true,
    } = this.props;
    let conditionFilterTypes = getFilterTypes(control, condition.type, from);
    // 单选下拉menu隐藏【等于】、【不等于】
    const hiddenValue =
      control && _.includes([9, 11], control.type) ? [FILTER_CONDITION_TYPE.ARREQ, FILTER_CONDITION_TYPE.ARRNE] : [];
    if (isRules && control) {
      if (control.type === 35 || control.type === 27) {
        conditionFilterTypes = conditionFilterTypes.filter(
          type => !_.includes([FILTER_CONDITION_TYPE.BETWEEN, FILTER_CONDITION_TYPE.NBETWEEN], type.value),
        );
      }
    }
    if (filterDept && control && control.type === 27) {
      conditionFilterTypes = conditionFilterTypes.filter(
        type => !_.includes([FILTER_CONDITION_TYPE.BETWEEN, FILTER_CONDITION_TYPE.NBETWEEN], type.value),
      );
    }
    if (from === 'subTotal' && control && _.includes([19, 23, 24, 27, 35], control.type)) {
      conditionFilterTypes = conditionFilterTypes.filter(
        type =>
          !_.includes(
            [
              FILTER_CONDITION_TYPE.BETWEEN,
              FILTER_CONDITION_TYPE.NBETWEEN,
              FILTER_CONDITION_TYPE.LIKE,
              FILTER_CONDITION_TYPE.NCONTAIN,
            ],
            type.value,
          ),
      );
    }
    const isDynamicStyle = from === 'relateSheet'; // 动态值选择的特定样式
    const isDynamicValue = this.getIsDynamicValue();
    return (
      <div
        className={cx('conditionItem', {
          readonly: !canEdit,
          conditionItemForDynamicStyle: isDynamicStyle,
        })}
      >
        <div
          className={cx('conditionItemHeader', { isbool: conditionGroupType === CONTROL_FILTER_WHITELIST.BOOL.value })}
        >
          {control ? (
            <React.Fragment>
              <span className={cx('columnName ellipsis', { errorName: isSheetFieldError })} title={control.controlName}>
                {isSheetFieldError ? _l('%0(无效数据)', control.controlName) : control.controlName}
              </span>
              {conditionGroupType !== CONTROL_FILTER_WHITELIST.BOOL.value && (
                <span className="relation">
                  <Dropdown
                    defaultValue={condition.type || conditionFilterTypes[0].value}
                    disabled={!canEdit}
                    data={conditionFilterTypes}
                    hiddenValue={hiddenValue}
                    isAppendToBody
                    menuStyle={{ width: 'auto' }}
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
              <Tooltip
                overlayClassName="deleteHoverTips"
                overlayInnerStyle={{ padding: '8px 10px' }}
                title={<span>{_l('ID: %0', condition.controlId)}</span>}
                placement="bottom"
              >
                <span className="Hand">{_l('该字段已删除')}</span>
              </Tooltip>
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
              options={isDynamicValue ? CONDITION_OPTIONS : CONDITION_OPTIONS.filter(o => o.value === 1)}
              suffixIcon={<Icon icon="arrow-down-border Font14" />}
              onChange={value => {
                this.setState(
                  {
                    isDynamicsource: value === 1 ? false : true,
                  },
                  () => {
                    onChange({
                      isDynamicsource: value === 1 ? false : true,
                      ...(value === 1 ? { dynamicSource: [] } : { values: undefined, value: undefined }), // 切换固定值时清空字段值
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
                appId,
                sourceControlId,
                from,
                filterResigned: filterResigned,
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
