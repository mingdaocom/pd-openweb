import React, { Component } from 'react';
import { Icon, Input, Tooltip } from 'ming-ui';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { getControlsSorts, sortControlByIds } from 'worksheet/util';
import SortableColumn from './SortableColumn';
import './ChangeColumn.less';
import _ from 'lodash';

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
    showTabs: PropTypes.bool,
    showOperate: PropTypes.bool, // 显示全显示、全隐藏操作
  };
  static defaultProps = {
    layout: 1,
    noempty: true,
    dragable: false,
    selected: [],
    columns: [],
    placeholder: _l('搜索字段'),
    showTabs: false,
    showOperate: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      search: '',
      controlsSorts: getControlsSorts(props.columns, props.controlsSorts),
      focusControlId: undefined,
      retractTabControlIds: [],
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

  handleItemClick = (column, hideFocus) => {
    const { noempty, min1msg, maxSelectedNum, selected, columns } = this.props;

    if (selected.indexOf(column.controlId) > -1) {
      if (noempty && selected.length === 1) {
        alert(min1msg || _l('至少显示一个字段'), 3);
        return;
      }
      let _selected = selected.filter(controlId => {
        if (column.type === 52) {
          return (
            controlId !== column.controlId &&
            (columns.find(l => l.controlId === controlId) || {}).sectionId !== column.controlId
          );
        } else if (column.sectionId && selected.includes(column.sectionId)) {
          let _select = _.some(
            selected,
            l => l !== column.controlId && (columns.find(m => m.controlId === l) || {}).sectionId === column.sectionId,
          );
          return column.sectionId === controlId ? _select : controlId !== column.controlId;
        }
        return controlId !== column.controlId;
      });

      this.handleChange({
        selected: _selected,
      });
    } else {
      if (maxSelectedNum && selected.length >= maxSelectedNum) {
        alert(_l('最多显示%0个字段', maxSelectedNum), 3);
        return;
      }

      this.handleChange({
        selected: _.union(
          selected.concat(
            column.controlId,
            column.type === 52 ? columns.filter(l => l.sectionId === column.controlId).map(l => l.controlId) : [],
            column.sectionId &&
              columns.find(l => l.controlId === column.sectionId) &&
              !selected.includes(column.sectionId)
              ? [column.sectionId]
              : [],
          ),
        ),
      });
    }

    this.setState({
      focusControlId: hideFocus ? undefined : column.controlId,
    });
  };

  handleSortEnd = (newItems, newIndex) => {
    const { selected, sortAutoChange } = this.props;
    const param = {};
    let newList = newItems;

    if (sortAutoChange) {
      const hideTabIndex = _.findIndex(newList, l => l.controlId === 'hideListCount');
      const newIsShow = newIndex < hideTabIndex + 1;
      const oldIsShow = selected.includes(newList[newIndex].controlId);

      if (newIsShow !== oldIsShow) {
        param.selected = oldIsShow
          ? selected.filter(controlId => controlId !== newList[newIndex].controlId)
          : selected.concat(newList[newIndex].controlId);
      }

      newList = newList.filter(l => !['showListCount', 'hideListCount'].includes(l.controlId));
    }

    this.setState({ focusControlId: newItems[newIndex].controlId });
    this.handleChange({
      ...param,
      controlsSorts: newList.map(l => l.controlId),
    });
  };

  setRetractTabControlIds = (value, type) => {
    const { retractTabControlIds } = this.state;

    this.setState({
      retractTabControlIds: type ? retractTabControlIds.filter(l => l !== value) : retractTabControlIds.concat(value),
    });
  };

  handleClearSearch = controlId => {
    this.setState({ search: '', focusControlId: controlId }, () => {
      let focusElem = document.querySelector('.columnCheckList .focusColumnItem');

      if (!focusElem) return;

      setTimeout(() => {
        let top = focusElem.offsetTop - document.querySelector('.columnCheckList').offsetTop;
        $('.columnCheckList').scrollTop(top - 40);
      }, 0);
    });
  };

  render() {
    const {
      placeholder,
      layout,
      advance,
      maxSelectedNum,
      dragable,
      selected,
      columns,
      maxHeight,
      isShowColumns = false,
      sortAutoChange = false,
      showOperate,
    } = this.props;
    const { search, controlsSorts, focusControlId, retractTabControlIds } = this.state;
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
          {_l('全显示')}
        </button>
        <button
          onClick={() =>
            this.handleChange({
              selected: [],
            })
          }
          className="ThemeHoverColor3"
        >
          {_l('全隐藏')}
        </button>
        {isShowColumns && (
          <Tooltip text={_l('按表单字段重置')} popupPlacement="bottom">
            <button
              onClick={() => {
                this.handleChange({
                  selected: columns
                    .sort((a, b) => {
                      if (a.row === b.row) {
                        return a.col - b.col;
                      }
                      return a.row - b.row;
                    })
                    .filter(l => l.controlId.length > 20)
                    .slice(0, 50)
                    .map(l => l.controlId),
                  controlsSorts: columns.map(l => l.controlId),
                });
              }}
              className="iconButton ThemeHoverColor3"
            >
              <Icon icon="loop" className="Font20" />
            </button>
          </Tooltip>
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
              autoFocus={true}
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
            {layout === 2 && !search && quickOperate}
          </div>
        )}
        <div className="sortableList flex" style={{ maxHeight }}>
          <SortableColumn
            canDrag={dragable && !search}
            items={filteredColumns}
            focusControlId={focusControlId}
            selected={selected}
            maxHeight={maxHeight}
            isShowColumns={isShowColumns}
            search={search}
            sortAutoChange={sortAutoChange}
            retractTabControlIds={retractTabControlIds}
            setRetractTabControlIds={this.setRetractTabControlIds}
            handleSortEnd={this.handleSortEnd}
            handleItemClick={this.handleItemClick}
            onClearSearch={this.handleClearSearch}
          />
        </div>
        {layout === 1 && advance && !search && showOperate && quickOperate}
      </div>
    );
  }
}
