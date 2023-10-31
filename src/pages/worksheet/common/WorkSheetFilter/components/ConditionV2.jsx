import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import { Dropdown, Icon, Input } from 'ming-ui';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { VerticalMiddle } from 'worksheet/components/Basics';
import renderConditionValue from './contents';
import { getConditionOverrideValue, getFilterTypes } from '../util';
import {
  FILTER_RELATION_TYPE,
  CONTROL_FILTER_WHITELIST,
  FILTER_CONDITION_TYPE,
  API_ENUM_TO_TYPE,
  valueTypeOptions,
} from '../enum';
import { Select, Tooltip } from 'antd';
import { conditionTypeListData } from 'src/pages/FormSet/components/columnRules/config';
import { isCustomOptions } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import _ from 'lodash';
import styled from 'styled-components';
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

const ParamsDropdown = styled(Dropdown)`
  flex: 1;
  max-width: calc(100% - 132px) !important;
  margin-bottom: 5px;

  .Dropdown--input {
    min-height: 36px;
    height: auto !important;
  }

  .titleDisplay {
    line-height: 22px;
    padding: 0 12px;
    border-radius: 16px;
    color: #174c76;
    background: #d8eeff;
    border: 1px solid #bbd6ea;
    font-size: 12px;
    white-space: normal;
  }
  &.isDelete {
    color: #f44336;
    background: rgba(244, 67, 54, 0.06);
    .Dropdown--input {
      border-color: #f44336 !important;
    }
  }
`;
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
    onChange: PropTypes.func,
    onDelete: PropTypes.func,
    onUpdateFilter: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      isDynamicsource: this.isCanDynamicsource(props) && this.setIsDynamicsourceFn(), // 是否动态筛选值
      valueType:
        this.isCanDynamicsource(props) && this.setIsDynamicsourceFn()
          ? 0
          : !!((props.condition || {}).dynamicSource || []).length
          ? 2
          : 1,
    };
  }

  componentDidMount() {
    this.state = {
      isDynamicsource: this.isCanDynamicsource(this.props) && this.setIsDynamicsourceFn(), // 是否动态筛选值
      valueType:
        this.isCanDynamicsource(this.props) && this.setIsDynamicsourceFn()
          ? 0
          : !!((this.props.condition || {}).dynamicSource || []).length
          ? 2
          : 1,
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
          _.includes(['relateSheet', 'fastFilter'], from) && _.isUndefined(dynamicSource) && this.getIsDynamicValue()
            ? true
            : false;
      }
    }
    return isDynamicsource;
  };

  isCanDynamicsource = data => {
    const { condition = [], from = '' } = data;
    const { type = '', controlType = '' } = condition;
    // 附件 检查框 地区 地区 地区 为空 不为空  在范围内 不在范围内没有动态筛选
    return (
      _.includes(['rule', 'relateSheet', 'fastFilter'], from) &&
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

  @autobind
  changeConditionType(type) {
    const { condition, onChange } = this.props;
    const overrideValue = getConditionOverrideValue(type, condition, this.state.valueType);
    onChange(overrideValue);

    if (_.includes(listType, type) && !_.includes([27], condition.controlType)) {
      this.setState({ isDynamicsource: false });
    }
  }

  @autobind
  renderControl() {
    const {
      conditionError,
      conditionGroupType,
      condition,
      canEdit,
      onChange,
      control,
      currentColumns,
      columns,
      relateSheetList,
      projectId,
      appId,
      sourceControlId = '',
      from,
      filterResigned = true,
      globalSheetControls,
      urlParams = [],
      showCustom,
    } = this.props;
    const { dynamicSource = [] } = condition;
    const showParamsTypes = [
      ...CONTROL_FILTER_WHITELIST.TEXT.keys,
      ...CONTROL_FILTER_WHITELIST.NUMBER.keys,
      ...CONTROL_FILTER_WHITELIST.DATE.keys,
      ...CONTROL_FILTER_WHITELIST.TIME.keys,
    ].concat([28, 36]);
    const showUrlParams =
      (!!urlParams.length || !!dynamicSource.filter(item => item.rcid === 'url').length) &&
      _.includes(showParamsTypes, condition.controlType);

    return (
      <div className="flexRow flex">
        {showUrlParams && (
          <Dropdown
            border
            className="Width120 mRight12"
            data={valueTypeOptions}
            value={this.state.valueType}
            onChange={value => {
              this.setState({ valueType: value });
              if (value === 1) {
                onChange({ dynamicSource: [] });
              } else {
                const dateRangeSetObj =
                  conditionGroupType === CONTROL_FILTER_WHITELIST.DATE.value ? { dateRange: 0, dateRangeType: 0 } : {};
                onChange({
                  values: [],
                  dynamicSource: [
                    {
                      cid: '',
                      rcid: 'url',
                      staticValue: '',
                    },
                  ],
                  ...dateRangeSetObj,
                });
              }
            }}
          />
        )}

        {this.state.valueType === 1 || !showUrlParams ? (
          <div className={cx('conditionValue', conditionError)}>
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
              showCustom: showCustom,
              filterResigned: filterResigned,
              conditionType: condition.controlType,
              isDynamicsource: this.state.isDynamicsource,
              globalSheetControls,
            })}
          </div>
        ) : (
          <ParamsDropdown
            border
            className={cx({
              isDelete: !!(dynamicSource[0] || {}).cid && !_.includes(urlParams, (dynamicSource[0] || {}).cid),
            })}
            data={urlParams.map(item => {
              return { text: item, value: item };
            })}
            renderTitle={() => {
              const params = (dynamicSource[0] || {}).cid;
              const isDelete = !!params && !_.includes(urlParams, params);
              return !isDelete ? (
                !!params ? (
                  <div className="titleDisplay">{params}</div>
                ) : (
                  <span className="Gray_bd">{_l('请选择')}</span>
                )
              ) : (
                <span>{_l('该参数已删除')}</span>
              );
            }}
            value={(dynamicSource[0] || {}).cid || ''}
            onChange={value => {
              onChange({
                dynamicSource: [
                  {
                    cid: value,
                    rcid: 'url',
                    staticValue: '',
                  },
                ],
              });
            }}
          />
        )}
      </div>
    );
  }

  render() {
    const {
      isRules,
      canEdit,
      control,
      conditionGroupType,
      condition,
      onChange,
      onDelete,
      from,
      filterDept,
      isSheetFieldError,
    } = this.props;
    let conditionFilterTypes = getFilterTypes(control, condition.type, from);
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
    if (filterDept && control && control.type === 27) {
      conditionFilterTypes = conditionFilterTypes.filter(
        type => !_.includes([FILTER_CONDITION_TYPE.BETWEEN, FILTER_CONDITION_TYPE.NBETWEEN], type.value),
      );
    }
    if (from === 'subTotal' && control && _.includes([19, 23, 24, 35], control.type)) {
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
    const isDynamicStyle = _.includes(['relateSheet', 'rule', 'fastFilter'], from); // 动态值选择的特定样式
    const isDynamicValue = this.getIsDynamicValue();
    return (
      <div
        className={cx('conditionItem', {
          readonly: !canEdit,
          conditionItemForDynamicStyle: isDynamicStyle,
        })}
      >
        <VerticalMiddle
          className={cx('conditionItemHeader', { isbool: conditionGroupType === CONTROL_FILTER_WHITELIST.BOOL.value })}
        >
          {control ? (
            <React.Fragment>
              <i
                className={`controlIcon icon icon-${getIconByType(control.originType === 37 ? 37 : control.type)}`}
              ></i>
              <span className={cx('columnName ellipsis', { errorName: isSheetFieldError })} title={control.controlName}>
                {isSheetFieldError ? _l('%0(无效数据)', control.controlName) : control.controlName}
              </span>
              {conditionGroupType !== CONTROL_FILTER_WHITELIST.BOOL.value && (
                <span className="relation">
                  <Dropdown
                    dropIcon="task_custom_btn_unfold"
                    defaultValue={condition.type || conditionFilterTypes[0].value}
                    disabled={!canEdit}
                    data={conditionFilterTypes}
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
            <div className="deletedColumn mTop6">
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
        </VerticalMiddle>
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
                      ...(value === 1 ? { dynamicSource: [] } : { values: undefined, value: undefined }), // 切换固定值时清空字段值
                    });
                  },
                );
              }}
            />
          )}
          {control ? this.renderControl() : <Input className="deletedColumn" disabled />}
        </div>
      </div>
    );
  }
}
