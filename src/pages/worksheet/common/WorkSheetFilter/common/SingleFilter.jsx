import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import { SYSTEM_CONTROLS } from 'worksheet/constants/enum';
import AddCondition from '../components/AddCondition';
import Condition from '../components/Condition';
import { CONTROL_FILTER_WHITELIST } from '../enum';
import {
  getTypeKey,
  getDefaultCondition,
  checkConditionAvailable,
  formatOriginFilterValue,
  compareControlType,
  redefineComplexControl,
} from '../util';

// setting编辑字段，关联他表筛选/汇总 rule字段显示规则=> 不需要验证的from
const noCheckConditionAvailable = ['relateSheet', 'rule', 'subTotal', 'custombutton'];

export default class SingleFilter extends Component {
  static propTypes = {
    isRules: PropTypes.bool,
    controllable: PropTypes.bool,
    feOnly: PropTypes.bool,
    showSystemControls: PropTypes.bool,
    projectId: PropTypes.string,
    filterColumnClassName: PropTypes.string,
    canEdit: PropTypes.bool,
    columns: PropTypes.arrayOf(PropTypes.shape({})),
    conditions: PropTypes.arrayOf(PropTypes.shape({})),
    onConditionsChange: PropTypes.func,
  };
  static defaultProps = {
    conditions: [],
    onConditionsChange: () => {},
  };
  constructor(props) {
    super(props);
    const formateddata = formatOriginFilterValue({ items: props.conditions });
    this.state = {
      relationType: formateddata.relationType,
      conditions: formateddata.conditions,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.id && nextProps.id !== this.props.id) {
      const formateddata = formatOriginFilterValue({ items: nextProps.conditions });
      this.setState({
        relationType: formateddata.relationType,
        conditions: formateddata.conditions,
      });
    }
  }
  @autobind
  addCondition(control) {
    if (!control) {
      alert(_l('字段不存在'));
      return;
    }
    const { from = '' } = this.props;
    const { conditions } = this.state;
    const newCondition = getDefaultCondition(control);
    const newConditions = conditions.concat(newCondition);
    this.setState({
      conditions: newConditions,
    });
    if (_.includes(noCheckConditionAvailable, from) || checkConditionAvailable(newCondition)) {
      this.handleConditionsChange(newConditions);
    }
  }
  updateCondition(index, value) {
    const { from = '' } = this.props;
    const { conditions } = this.state;
    const newConditions = conditions.map((c, i) => (i === index ? Object.assign({}, c, value) : c));
    this.setState({
      conditions: newConditions,
    });
    if (_.includes(noCheckConditionAvailable, from)) {
      this.handleConditionsChange(newConditions);
    } else {
      if (!_.isEqual(conditions, newConditions)) {
        const availableConditions = newConditions.filter(condition => checkConditionAvailable(condition));
        this.handleConditionsChange(availableConditions);
      }
    }
  }
  deleteCondition(index) {
    const { conditions } = this.state;
    const newConditions = conditions.filter((c, i) => i !== index);
    this.setState({
      conditions: newConditions,
    });
    this.handleConditionsChange(newConditions);
  }
  handleConditionsChange(conditions, relationType) {
    const { onConditionsChange, feOnly } = this.props;
    const formatedConditions = conditions.map(condition => ({
      controlId: condition.controlId,
      dataType: condition.controlType,
      spliceType: _.isUndefined(relationType) ? this.state.relationType : relationType,
      filterType: condition.type,
      dateRange: condition.dateRange,
      dateRangeType: condition.dateRangeType,
      values:
        feOnly && _.includes([26, 27, 29, 19, 23, 24, 35], condition.controlType)
          ? condition.fullValues
          : condition.values,
      maxValue: condition.maxValue,
      minValue: condition.minValue,
      value: condition.value,
      folded: condition.folded,
      dynamicSource: condition.dynamicSource || [],
      isDynamicsource: condition.isDynamicsource,
    }));
    if (!_.isUndefined(relationType)) {
      this.setState({ relationType });
    }
    onConditionsChange(formatedConditions);
  }
  handleChangeRelationType(value) {
    this.handleConditionsChange(this.state.conditions, value);
  }
  renderConditions(columns = []) {
    const { isRules, projectId, canEdit, from, currentColumns, relateSheetList, sourceControlId, globalSheetControls } =
      this.props;
    const { relationType, conditions } = this.state;
    return conditions.map((condition, index) => {
      const control = _.find(columns, column => condition.controlId === column.controlId);
      const conditionGroupKey = control && getTypeKey(control.type);
      const conditionGroupType = conditionGroupKey && CONTROL_FILTER_WHITELIST[conditionGroupKey].value;
      return (
        <Condition
          isRules={isRules}
          canEdit={canEdit}
          projectId={projectId}
          key={condition.keyStr}
          index={index}
          from={from}
          sourceControlId={sourceControlId}
          condition={condition}
          conditionsLength={conditions.length}
          conditionGroupType={conditionGroupType}
          relationType={relationType}
          control={control}
          columns={this.props.columns}
          currentColumns={currentColumns}
          relateSheetList={relateSheetList} // 除去自身的本表的关联单条的数据
          globalSheetControls={globalSheetControls} //主记录的Controls
          onChange={value => {
            this.updateCondition(index, value);
          }}
          onDelete={() => {
            this.deleteCondition(index);
          }}
          onUpdateFilter={value => {
            this.handleChangeRelationType(value.relationType);
          }}
        />
      );
    });
  }
  render() {
    const { from, canEdit, showSystemControls, filterColumnClassName } = this.props;
    let { columns = [] } = this.props;
    const { conditions } = this.state;
    const filterWhiteKeys = _.flatten(
      Object.keys(CONTROL_FILTER_WHITELIST).map(key => CONTROL_FILTER_WHITELIST[key].keys),
    );
    if (showSystemControls) {
      columns = columns
        .filter(column => !_.find(SYSTEM_CONTROLS, c => c.controlId === column.controlId))
        .concat(SYSTEM_CONTROLS);
    }
    columns = columns.map(redefineComplexControl);
    columns = columns
      .filter(c => _.includes(filterWhiteKeys, c.type))
      .filter(c => !(c.type === 38 && c.enumDefault === 3));

    return (
      <div className={cx('singleFilter workSheetFilter', { exist: conditions.length })}>
        {this.renderConditions(columns)}
        {canEdit && (
          <AddCondition
            from={from}
            filterColumnClassName={filterColumnClassName}
            conditionCount={conditions.length}
            columns={columns}
            onAdd={this.addCondition}
          />
        )}
      </div>
    );
  }
}
