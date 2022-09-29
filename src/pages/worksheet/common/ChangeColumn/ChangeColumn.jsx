import React, { Component } from 'react';
import { autobind } from 'core-decorators';
import { Icon, Input } from 'ming-ui';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { getControlsSorts, sortControlByIds } from 'worksheet/util';
import './ChangeColumn.less';

const SortHandle = SortableHandle(() => (
  <i className="icon icon-drag Gray_9e Font16 Right ThemeHoverColor3 Hand dragHandle"></i>
));

const SortableItem = SortableElement(({ index, selected, column, handleItemClick }) => (
  <div className="showControlsColumnCheckItem flexRow Hand" key={index} onClick={() => handleItemClick(column)}>
    <div className="flex overflow_ellipsis">
      <Icon
        icon={selected.indexOf(column.controlId) > -1 ? 'ic_toggle_on' : 'ic_toggle_off'}
        className="switchIcon Font22 mRight12"
      />
      <i className={cx('icon Gray_9e mRight6 Font16', 'icon-' + getIconByType(column.type))}></i>
      <span>{column.controlName || (column.type === 22 ? _l('分段') : _l('备注'))}</span>
    </div>
    <SortHandle />
  </div>
));

const SortableList = SortableContainer(({ filteredColumns, selected, handleItemClick, maxHeight = '' }) => {
  return (
    <div className="columnCheckList" style={{ overflow: 'auto', maxHeight }}>
      {!filteredColumns.length && <div className="emptyTip TxtCenter">{_l('没有搜索结果')}</div>}
      {filteredColumns.map((column, i) => (
        <SortableItem index={i} selected={selected} column={column} handleItemClick={handleItemClick} />
      ))}
    </div>
  );
});

export default class ChangeColumn extends Component {
  static propTypes = {
    placeholder: PropTypes.string,
    layout: PropTypes.number, // 呈现方式 1 dropdown 2 平铺
    noShowCount: PropTypes.bool,
    showColumnLength: PropTypes.number,
    noempty: PropTypes.bool, // 至少显示1个  默认 true
    dragable: PropTypes.bool,
    maxSelectedNum: PropTypes.number,
    min1msg: PropTypes.string,
    advance: PropTypes.bool,
    columns: PropTypes.arrayOf(PropTypes.shape({})),
    selected: PropTypes.arrayOf(PropTypes.string),
    controlsSorts: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
  };
  static defaultProps = {
    layout: 1,
    noempty: true,
    dragable: false,
    selected: [],
    columns: [],
    placeholder: _l('搜索字段')
  };

  constructor(props) {
    super(props);
    this.state = {
      search: '',
      controlsSorts: getControlsSorts(props.columns, props.controlsSorts),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.controlsSorts, nextProps.controlsSorts)) {
      this.setState({
        controlsSorts: getControlsSorts(nextProps.columns, nextProps.controlsSorts),
      });
    }
  }

  handleChange({ selected, controlsSorts } = {}) {
    const { onChange } = this.props;
    onChange({
      selected: sortControlByIds(
        (selected || this.props.selected).map(controlId => ({ controlId })),
        controlsSorts || this.state.controlsSorts,
      ).map(c => c.controlId),
      newControlSorts: controlsSorts || this.state.controlsSorts,
    });
  }

  @autobind
  handleItemClick(column) {
    const { noempty, min1msg, maxSelectedNum, selected } = this.props;
    if (selected.indexOf(column.controlId) > -1) {
      if (noempty && selected.length === 1) {
        alert(min1msg || _l('至少显示一个字段'), 3);
        return;
      }
      this.handleChange({
        selected: selected.filter(controlId => controlId !== column.controlId),
      });
    } else {
      if (maxSelectedNum && selected.length >= maxSelectedNum) {
        alert(_l('最多显示%0个字段', maxSelectedNum), 3);
        return;
      }
      this.handleChange({
        selected: _.union(selected.concat(column.controlId)),
      });
    }
  }

  @autobind
  handleSortEnd({ oldIndex, newIndex }) {
    const { controlsSorts } = this.state;
    const newControlSorts = arrayMove(controlsSorts, oldIndex, newIndex);
    this.handleChange({
      controlsSorts: newControlSorts,
    });
  }

  render() {
    const {
      placeholder,
      noShowCount,
      layout,
      showColumnLength,
      advance,
      min1msg,
      maxSelectedNum,
      dragable,
      selected,
      columns,
      maxHeight,
    } = this.props;
    const { search, controlsSorts } = this.state;
    const filteredColumns = sortControlByIds(columns, controlsSorts).filter(
      column => column.controlName.toLowerCase().indexOf(search.toLowerCase()) > -1,
    );
    const quickOperate = (
      <div className="quickOperate">
        <button
          className="ThemeHoverColor3"
          onClick={() => {
            if (maxSelectedNum && columns.length >= maxSelectedNum) {
              alert(_l('最多显示%0个字段', maxSelectedNum), 3);
            }
            this.handleChange({
              selected: columns
                .slice(0, _.isUndefined(maxSelectedNum) ? 10000000 : maxSelectedNum)
                .map(c => c.controlId),
            });
          }}
        >
          {_l('显示全部')}
        </button>
        <button
          onClick={() =>
            this.handleChange({
              selected: [],
            })
          }
          className="Right ThemeHoverColor3"
        >
          {_l('隐藏全部')}
        </button>
        {layout === 2 && !noShowCount && showColumnLength > 0 && (
          <span className="showColumnLength Gray_9e Right">{_l('显示%0列', showColumnLength)}</span>
        )}
      </div>
    );
    return (
      <div className={cx('workSheetChangeColumn flexColumn', { advance, hideDrag: !!search || !dragable })}>
        {advance && (
          <div className="searchBar flexRow">
            <i className="icon icon-search"></i>
            <Input
              value={search}
              placeholder={placeholder}
              className="flex"
              onChange={value => {
                this.setState({ search: value.trim() });
              }}
            />
            {search && (
              <i
                className="icon icon-close"
                onClick={() => {
                  this.setState({ search: '' });
                }}
              ></i>
            )}
          </div>
        )}
        {layout === 2 && advance && !search && quickOperate}
        <div className="sortableList flex" style={{ maxHeight }}>
          <SortableList
            useDragHandle
            axis="y"
            lockAxis={'y'}
            helperClass="active"
            filteredColumns={filteredColumns}
            selected={selected}
            min1msg={min1msg}
            maxSelectedNum={maxSelectedNum}
            onSortEnd={this.handleSortEnd}
            handleItemClick={this.handleItemClick}
            maxHeight={maxHeight}
          />
        </div>
        {layout === 1 && advance && !search && quickOperate}
      </div>
    );
  }
}
