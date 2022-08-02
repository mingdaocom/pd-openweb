import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import AddCondition from './content/AddCondition';
import Condition from './content/Condition';
import { CONTROL_FILTER_WHITELIST } from 'worksheet/common/WorkSheetFilter/enum';
import {
  getTypeKey,
  getDefaultCondition,
  formatOriginFilterValue,
  redefineComplexControl,
} from 'worksheet/common/WorkSheetFilter/util';
import './SingleFilter.less';
import { formatCondition, getArrBySpliceType, isRelateMoreList } from '../config';
export default class SingleFilter extends Component {
  static propTypes = {
    projectId: PropTypes.string,
    columns: PropTypes.arrayOf(PropTypes.shape({})),
    filters: PropTypes.arrayOf(PropTypes.shape([])),
    filterError: PropTypes.any,
    onConditionsChange: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.conditionsData = [];
    this.state = {
      transConditions: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    const { columns = [], filters } = nextProps;
    const filterWhiteKeys = _.flatten(
      Object.keys(CONTROL_FILTER_WHITELIST).map(key => CONTROL_FILTER_WHITELIST[key].keys),
    );
    this.conditionsData = columns
      .map(redefineComplexControl)
      .filter(c => _.includes(filterWhiteKeys, c.type))
      .filter(c => !(c.type === 38 && c.enumDefault === 3));
    if (nextProps.editingId !== this.props.editingId) {
      this.setState({
        transConditions: getArrBySpliceType(filters),
      });
    }
  }

  @autobind
  addCondition(control, parentIndex) {
    const { transConditions = [] } = this.state;
    const isItemAdd = parentIndex > -1;
    //关联多条手动选中条件为空，避免初始值导致显示字段删除字样
    let defaultControl = getDefaultCondition(control);
    if (isRelateMoreList(control, defaultControl)) {
      defaultControl.type = 7;
    }
    const newControl = [{ ...defaultControl, spliceType: isItemAdd ? 2 : 1, isDynamicsource: false }];
    let newCondition = isItemAdd
      ? transConditions.map((it, idx) => {
          return idx === parentIndex
            ? it.map(item => Object.assign({}, item, { spliceType: 1 })).concat(newControl)
            : it;
        })
      : transConditions.concat([newControl]);
    this.handleConditionsChange(newCondition);
  }
  getCurrentIndex(index, childIndex) {
    const { transConditions } = this.state;
    let idx = 0;
    transConditions.map((item, pIndex) => {
      if (pIndex === index) {
        item.map((it, cIndex) => {
          if (cIndex === childIndex) {
            idx = idx + childIndex;
          }
        });
      } else {
        idx = idx + item.length;
      }
    });
    return idx;
  }
  updateCondition(index, childIndex, value) {
    const { transConditions } = this.state;
    const newConditions = transConditions.map((c, i) => {
      return i === index ? c.map((it, idx) => (idx === childIndex ? Object.assign({}, it, value) : it)) : c;
    });
    this.handleConditionsChange(newConditions);
  }
  deleteCondition(index, childIndex) {
    const { transConditions } = this.state;
    const newConditions = transConditions.map((it = [], i) => {
      if (i === index) {
        let isDeleteLastOr = false;
        it.map(c => {
          //删除最后一项或
          isDeleteLastOr = childIndex === it.length - 1 && c.spliceType === 2;
        });
        const itFilter = it.filter((c, idx) => idx !== childIndex) || [];
        return (
          itFilter.map((item, x) =>
            x === itFilter.length - 1 && isDeleteLastOr ? { ...item, spliceType: 2 } : item,
          ) || []
        );
      } else {
        return it;
      }
    });
    this.handleConditionsChange(newConditions);
  }
  handleConditionsChange(newConditions) {
    const { onConditionsChange } = this.props;
    const conditions = _.flatten(newConditions.filter(it => it.length > 0));
    const formatedConditions = conditions.map(condition => {
      return formatCondition(condition);
    });
    this.setState(
      {
        transConditions: getArrBySpliceType(formatedConditions),
      },
      () => onConditionsChange(formatedConditions),
    );
  }
  handleChangeRelationType(index, childIndex, value) {
    const { transConditions } = this.state;
    const newConditions = transConditions.map((c, i) => {
      return i === index ? c.map((it, idx) => (idx === childIndex ? Object.assign({}, it, value) : it)) : c;
    });
    this.handleConditionsChange(newConditions);
  }
  handleChangeError(index) {
    this.props.updateFilterError(index);
  }
  renderConditions() {
    const { projectId, filterError = {} } = this.props;
    const { transConditions = [] } = this.state;
    return transConditions.map((itemConditions = [], index) => {
      let conditionItemArr = (formatOriginFilterValue({ items: itemConditions }) || {}).conditions;
      return conditionItemArr.map((condition, childIndex) => {
        let control = _.find(this.conditionsData, column => condition.controlId === column.controlId) || {};
        // //转换成关联多条列表，按删除处理
        if (isRelateMoreList(control, condition)) {
          control = {};
        }
        const conditionGroupKey = control && getTypeKey(control.type);
        const conditionGroupType = conditionGroupKey && CONTROL_FILTER_WHITELIST[conditionGroupKey].value;
        const currentColumnsFilter = this.conditionsData.filter(item => item.controlId !== condition.controlId);
        const originIndex = this.getCurrentIndex(index, childIndex);
        return (
          <Condition
            projectId={projectId}
            key={control.controlId}
            index={index}
            childIndex={childIndex}
            condition={condition}
            conditionsLength={transConditions.length}
            conditionsChildLength={conditionItemArr.length}
            conditionGroupType={conditionGroupType}
            control={control}
            columns={this.conditionsData}
            currentColumns={currentColumnsFilter}
            relateSheetList={control.relationControls} // 除去自身的本表的关联单条的数据
            conditionError={filterError[originIndex] || ''}
            onChange={(val, dispatchError = true) => {
              this.updateCondition(index, childIndex, val);
              dispatchError && this.handleChangeError(originIndex);
            }}
            onDelete={() => {
              this.deleteCondition(index, childIndex);
              this.handleChangeError(originIndex);
            }}
            onUpdateRelationType={value => {
              this.handleChangeRelationType(index, childIndex, value);
            }}
            addCondition={value => this.addCondition(value, index)}
          />
        );
      });
    });
  }
  render() {
    return (
      <div className="singleRuleFilter">
        {this.renderConditions()}
        <AddCondition columns={this.conditionsData} onAdd={this.addCondition} iconNode={false} />
      </div>
    );
  }
}
