import React from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon, Dropdown, Tooltip, Support, SortableList } from 'ming-ui';
import { SYSTEM_CONTROLS } from 'worksheet/constants/enum';
import { getSortData } from 'src/pages/worksheet/util';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { filterOnlyShowField, isOtherShowFeild } from 'src/pages/widgetConfig/util';
import _ from 'lodash';

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
  .tipsIcon {
    left: -38px;
    line-height: 36px;
  }
  .ming.Dropdown,
  .dropdownTrigger {
    overflow: hidden;
  }
`;

const Item = props => {
  const { sortConditions = [], columns, condition = {}, info = {}, DragHandle } = props;
  const { index } = info;
  const canDelete = !(index === 0 && sortConditions.length === 1);
  const canAdd = sortConditions.length < (columns.length < 5 ? columns.length : 5);
  const control = _.find(columns, i => i.controlId === condition.controlId);
  let controlType = control ? (control.type === 30 ? control.sourceControlType : control.type) : '';
  return (
    <div className="flexRow alignItemsCenter mBottom10">
      <DragHandle className="alignItemsCenter flexRow">
        <Icon className="mRight5 Font14 Hand" icon="drag" />
      </DragHandle>
      <div className="flexRow flex" style={{ position: 'relative' }} key={condition.controlId}>
        {[9, 10, 11].includes(controlType) && (
          <Tooltip
            popupPlacement={'bottom'}
            text={
              <span>
                {_l(
                  '按照记录当时存储的选项序号进行排序。当每次修改了选项顺序后，需要重新刷新历史数据的选项序号以校准排序。',
                )}
                <Support
                  className="InlineBlock"
                  type={3}
                  href="https://help.mingdao.com/worksheet/batch-refresh"
                  text={_l('点击了解更多')}
                />
              </span>
            }
          >
            <i className="icon-info1 tipsIcon Font16 Absolute Gray_9e" />
          </Tooltip>
        )}
        <Dropdown
          border
          openSearch
          isAppendToBody
          menuStyle={{ width: 200 }}
          className="flex mRight10 filterColumns"
          value={condition.controlId}
          data={props.getCanSelectColumns(condition.controlId)}
          searchNull={() => {
            return <div className="TxtCenter">{_l('暂无搜索结果')}</div>;
          }}
          onChange={value => {
            if (value !== condition.controlId) {
              props.handleChangeSortControl(index, value);
            }
          }}
          {...(isOtherShowFeild(control)
            ? { renderError: () => <span className="Red">{_l('%0(无效类型)', control.controlName)}</span> }
            : !control
            ? { renderError: () => <span className="Red">{_l('字段已删除')}</span> }
            : {})}
        />
        <Dropdown
          border
          isAppendToBody
          className="flex mRight6"
          value={condition.isAsc ? 2 : 1}
          data={props.getSortTypes(condition.controlId)}
          onChange={value => {
            if (value !== (condition.isAsc ? 2 : 1)) {
              props.handleChangeSortType(index, value);
            }
          }}
        />
        <Icon
          className={cx('operateBtn', { disabled: !canDelete })}
          icon="remove_circle_outline"
          disabled={!canDelete}
          onClick={() => {
            if (canDelete) props.handleDeleteCondition(condition.controlId);
          }}
        />
        <Icon
          className={cx('operateBtn', { disabled: !canAdd })}
          icon="control_point"
          onClick={() => {
            if (canAdd) props.handleAddCondition(index);
          }}
        />
      </div>
    </div>
  );
};

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
    const { showSystemControls, sortConditions, isSubList } = props;
    let { columns } = props;
    if (showSystemControls) {
      columns = columns
        .filter(column => !_.find(SYSTEM_CONTROLS, c => c.controlId === column.controlId))
        .concat(SYSTEM_CONTROLS);
    }
    return {
      columns,
      sortConditions:
        sortConditions && sortConditions.length ? sortConditions : [{ controlId: 'ctime', isAsc: !!isSubList }], //子表默认旧的在前，视图默认新的在前
    };
  };

  handleChange = newSortConditions => {
    const { onChange } = this.props;
    onChange(newSortConditions);
  };

  handleChangeSortControl = (index, value) => {
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
  };

  handleChangeSortType = (index, value) => {
    const { sortConditions } = this.state;
    const newSortConditions = update(sortConditions, {
      [index]: {
        $merge: {
          isAsc: value === 2,
        },
      },
    });
    this.handleChange(newSortConditions);
  };

  handleAddCondition = index => {
    const newCondition = this.getCanSelectColumns()[0];
    if (!newCondition) {
      return;
    }
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
  };

  handleDeleteCondition = controlId => {
    const { sortConditions } = this.state;
    const newSortConditions = sortConditions.filter(sc => sc.controlId !== controlId);
    this.handleChange(newSortConditions);
  };

  getCanSelectColumns = controlId => {
    const { columns, sortConditions } = this.state;
    const control = _.find(columns, c => c.controlId === controlId);
    const sortConditionControls = sortConditions
      .map(c => _.find(columns, column => column.controlId === c.controlId))
      .filter(_.identity);
    // 人员，部门，关联，组织角色，附件，级联选择此类支持多选的数组格式，都只能选择一个排序
    const list = [26, 27, 29, 48, 35, 14, 9, 10, 11];
    // const optionTypes = [9, 10, 11];
    const isExist = !!sortConditionControls.find(o => list.includes(o.type) || list.includes(o.sourceControlType));
    return filterOnlyShowField(columns)
      .filter(o => ![42, 47, 49, 51, 52].includes(o.type)) //排除签名字段 扫码 接口查询按钮 查询记录
      .filter(
        c =>
          (!_.find(sortConditions, sc => sc.controlId === c.controlId) || c.controlId === controlId) &&
          (!(isExist && _.find(list, type => [c.type, c.sourceControlType].includes(type))) ||
            (control && _.find(list, type => [control.type, control.sourceControlType].includes(type)))),
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

  //拖拽排序
  handleSortEnd = listNew => {
    this.handleChange(listNew);
  };

  renderCondtions = () => {
    const { columns, sortConditions } = this.state;
    return (
      <div className="mTop24">
        <SortableList
          itemKey="controlId"
          items={sortConditions}
          useDragHandle
          onSortEnd={this.handleSortEnd}
          helperClass={cx('sortConditionsViewControl', this.props.helperClass)}
          renderItem={options => (
            <Item
              {...this.props}
              {...options}
              index={options.index}
              sortConditions={sortConditions}
              condition={options.item}
              key={'item_' + options.index}
              info={{ index: options.index }}
              columns={columns}
              handleChangeSortControl={this.handleChangeSortControl}
              handleChangeSortType={this.handleChangeSortType}
              handleDeleteCondition={this.handleDeleteCondition}
              handleAddCondition={this.handleAddCondition}
              getSortTypes={this.getSortTypes}
              getCanSelectColumns={this.getCanSelectColumns}
            />
          )}
        />
      </div>
    );
  };

  render() {
    const { className } = this.props;
    return <ConditionsWrap className={cx(className, 'sortConditions')}>{this.renderCondtions()}</ConditionsWrap>;
  }
}
