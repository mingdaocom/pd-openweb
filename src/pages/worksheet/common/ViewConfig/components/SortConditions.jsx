import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import update from 'immutability-helper';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon, Dropdown } from 'ming-ui';
import { SYSTEM_CONTROLS } from 'worksheet/constants/enum';
import { getSortData } from 'src/pages/worksheet/util';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { filterOnlyShowField, isOtherShowFeild } from 'src/pages/widgetConfig/util';

const ConditionsWrap = styled.div`
  .operateBtn {
    cursor: pointer;
    font-size: 20px;
    color: #9e9e9e;
    margin: 0 4px;
    line-height: 36px;

    &:hover {
      color: #2196f3;
    }

    &.disabled {
      color: #ddd !important;
    }
  }
`;

export default class SortConditions extends React.Component {
  static propTypes = {
    showSystemControls: PropTypes.bool,
    sortConditions: PropTypes.arrayOf(PropTypes.shape({})),
    columns: PropTypes.arrayOf(PropTypes.shape({})),
    onChange: PropTypes.func,
  };

  static defaultProps = {
    columns: [],
    onChange: () => {},
  };

  constructor(props) {
    super(props);
    this.state = this.getNewState(props);
  }

  componentWillReceiveProps(nextProps) {
    if (
      !_.isEqual(this.props.sortConditions, nextProps.sortConditions) ||
      !_.isEqual(this.props.columns, nextProps.columns)
    ) {
      this.setState(this.getNewState(nextProps));
    }
  }

  getNewState = props => {
    props = props || this.props;
    const { showSystemControls, sortConditions } = props;
    let { columns } = props;
    if (showSystemControls) {
      columns = columns
        .filter(column => !_.find(SYSTEM_CONTROLS, c => c.controlId === column.controlId))
        .concat(SYSTEM_CONTROLS);
    }
    return {
      columns,
      sortConditions:
        sortConditions && sortConditions.length
          ? this.getValideSortConditions(columns, sortConditions)
          : [{ controlId: 'ctime', isAsc: true }],
    };
  };

  getValideSortConditions = (columns, moreSort) => {
    let valideSortConditions = moreSort.filter(sc => _.find(columns, c => c.controlId === sc.controlId));
    if (!valideSortConditions.length) {
      valideSortConditions = [{ controlId: 'ctime', isAsc: false }];
    }
    return valideSortConditions;
  };

  handleChange = newSortConditions => {
    const { onChange } = this.props;
    onChange(newSortConditions);
  };

  @autobind
  handleChangeSortControl(index, value) {
    const { sortConditions } = this.state;
    const newSortConditions = update(sortConditions, {
      [index]: {
        $set: {
          controlId: value,
          isAsc: this.getSortTypes(value)[0].value === 2,
        },
      },
    });
    this.handleChange(newSortConditions);
  }

  @autobind
  handleChangeSortType(index, value) {
    const { sortConditions } = this.state;
    const newSortConditions = update(sortConditions, {
      [index]: {
        $merge: {
          isAsc: value === 2,
        },
      },
    });
    this.handleChange(newSortConditions);
  }

  @autobind
  handleAddCondition(index) {
    const newCondition = this.getCanSelectColumns()[0];
    const { sortConditions } = this.state;
    const newSortConditions = update(sortConditions, {
      $splice: [
        [
          index + 1,
          0,
          {
            controlId: newCondition.value,
            isAsc: this.getSortTypes(newCondition.value)[0].value === 2,
          },
        ],
      ],
    });
    this.handleChange(newSortConditions);
  }

  @autobind
  handleDeleteCondition(controlId) {
    const { sortConditions } = this.state;
    const newSortConditions = sortConditions.filter(sc => sc.controlId !== controlId);
    this.handleChange(newSortConditions);
  }

  getCanSelectColumns = controlId => {
    const { columns, sortConditions } = this.state;
    const control = _.find(columns, c => c.controlId === controlId);
    const sortConditionControls = sortConditions
      .map(c => _.find(columns, column => column.controlId === c.controlId))
      .filter(_.identity);
    const optionCondition = _.find(sortConditionControls, scc => scc.type === 9 || scc.type === 11 || scc.type === 10);
    const userCondition = _.find(sortConditionControls, scc => scc.type === 26);
    const groupCondition = _.find(sortConditionControls, scc => scc.type === 27);
    const existControls = [optionCondition, userCondition, groupCondition].filter(_.identity);
    return filterOnlyShowField(columns)
      .filter(o => ![42, 47].includes(o.type)) //排除签名字段 扫码
      .filter(
        c =>
          (!_.find(sortConditions, sc => sc.controlId === c.controlId) || c.controlId === controlId) &&
          (!(existControls.length && _.find([9, 11, 10, 26, 27], type => c.type === type)) ||
            (control && _.find([9, 11, 10, 26, 27], type => control.type === type))),
      )
      .map(c => ({
        text: c.controlName,
        value: c.controlId,
        itemContentStyle: { padding: '0 30px' },
        iconName: getIconByType(c.type),
      }));
  };

  getSortTypes = controlId => {
    const { columns } = this.state;
    const control = _.find(columns, c => c.controlId === controlId) || {};
    return getSortData(control.type, control);
  };

  renderCondtions = () => {
    const { columns } = this.state;
    const { sortConditions } = this.state;
    return sortConditions.map((condition, index) => {
      const canDelete = !(index === 0 && sortConditions.length === 1);
      const canAdd = sortConditions.length < (columns.length < 5 ? columns.length : 5);
      const control = _.find(columns, i => i.controlId === condition.controlId);
      return (
        <div className="flexRow mTop5" key={condition.controlId}>
          <Dropdown
            border
            isAppendToBody
            menuStyle={{ width: 180 }}
            className="flex mBottom10 mRight10 filterColumns Width120"
            value={condition.controlId}
            data={this.getCanSelectColumns(condition.controlId)}
            onChange={value => {
              if (value !== condition.controlId) {
                this.handleChangeSortControl(index, value);
              }
            }}
            {...(isOtherShowFeild(control)
              ? { renderError: () => <span className="Red">{_l('%0(无效类型)', control.controlName)}</span> }
              : {})}
          />
          <Dropdown
            border
            isAppendToBody
            className="flex mBottom10 Width120 mRight6"
            value={condition.isAsc ? 2 : 1}
            data={this.getSortTypes(condition.controlId)}
            onChange={value => {
              if (value !== (condition.isAsc ? 2 : 1)) {
                this.handleChangeSortType(index, value);
              }
            }}
          />
          <Icon
            className={cx('operateBtn', { disabled: !canDelete })}
            icon="remove_circle_outline"
            disabled={!canDelete}
            onClick={() => {
              if (canDelete) this.handleDeleteCondition(condition.controlId);
            }}
          />
          <Icon
            className={cx('operateBtn', { disabled: !canAdd })}
            icon="control_point"
            onClick={() => {
              if (canAdd) this.handleAddCondition(index);
            }}
          />
        </div>
      );
    });
  };

  render() {
    const { className } = this.props;
    return (
      <ConditionsWrap className={cx(className, 'sortConditions')}>
        <div className="Gray_9e mBottom24">{_l('选择此视图下的记录默认排序方式')}</div>
        {this.renderCondtions()}
      </ConditionsWrap>
    );
  }
}
