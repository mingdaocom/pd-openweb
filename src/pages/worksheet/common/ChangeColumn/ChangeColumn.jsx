import React, { Component, Fragment } from 'react';
import { autobind } from 'core-decorators';
import { Icon, Input, Tooltip } from 'ming-ui';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { getControlsSorts, sortControlByIds } from 'worksheet/util';
import './ChangeColumn.less';
import _ from 'lodash';

const renderSortCon = ({ column, dragable, search, onClearSearch }) => (
  <div
    className={cx('flex dragCon', { HandImportant: !dragable })}
    onClick={() => {
      if (dragable || !search) return;
      onClearSearch();
    }}
  >
    <i className={cx('icon focusColor Gray_9e mRight6 Font16', 'icon-' + getIconByType(column.type))}></i>
    <span className="flex overflow_ellipsis focusColor">
      {column.controlName || (column.type === 22 ? _l('分段') : _l('备注'))}
    </span>
    <Tooltip popupPlacement="bottom" text={dragable ? null : _l('前往')}>
      <i
        className={cx('icon Gray_9e Font16 Right ThemeHoverColor3 dragHandle', {
          'icon-drag': dragable,
          'icon-backspace searchIcon': search && !dragable,
        })}
      ></i>
    </Tooltip>
  </div>
);

const SortHandle = SortableHandle(renderSortCon);

const SortableItem = SortableElement(
  ({
    index,
    selected,
    column,
    handleItemClick,
    focusControlId,
    dragable,
    search,
    onClearSearch,
    tabColumns = undefined,
    retractTabControlIds = [],
    setRetractTabControlIds,
  }) => {
    const isRetract = retractTabControlIds.includes(column.controlId);

    return (
      <div className={cx('showControlsColumnDrageble', { tabColumn: column.type === 52 })}>
        <div
          className={cx('showControlsColumnCheckItem flexRow', {
            focusColumnItem: focusControlId === column.controlId,
          })}
          key={index}
        >
          <Icon
            icon={selected.indexOf(column.controlId) > -1 ? 'ic_toggle_on' : 'ic_toggle_off'}
            className="switchIcon Font30 mRight8 Hand"
            onClick={() => handleItemClick(column, !dragable && !search)}
          />
          {dragable ? (
            <SortHandle
              search={search}
              column={column}
              dragable={dragable}
              onClearSearch={() => onClearSearch(column.controlId)}
            />
          ) : (
            renderSortCon({ column, search, dragable, onClearSearch: () => onClearSearch(column.controlId) })
          )}
          {tabColumns && tabColumns.length !== 0 && !search && (
            <Icon
              onClick={() => setRetractTabControlIds(column.controlId, isRetract)}
              className="Font22 Gray_9e expendIcon"
              icon={isRetract ? 'expand_more' : 'expand_less'}
            />
          )}
        </div>
        {!dragable && tabColumns && !isRetract && !search && (
          <div className="subColumns">
            {tabColumns.map((item, i) => (
              <SortableItem
                index={index + i + 1}
                selected={selected}
                column={item}
                dragable={dragable}
                search={search}
                focusControlId={focusControlId}
                handleItemClick={handleItemClick}
                onClearSearch={onClearSearch}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);

const SortableList = SortableContainer(
  ({
    filteredColumns,
    selected,
    handleItemClick,
    maxHeight = '',
    isShowColumns,
    focusControlId,
    dragable = false,
    search = false,
    onClearSearch,
    sortAutoChange = false,
    showTabs = false,
    retractTabControlIds = [],
    setRetractTabControlIds,
  }) => {
    let filteredShowColumns = filteredColumns.filter(l => selected.indexOf(l.controlId) > -1);
    let filteredHideColumns = filteredColumns.filter(l => selected.indexOf(l.controlId) < 0);
    return (
      <div className="columnCheckList" style={{ overflow: 'auto', maxHeight }}>
        {!filteredColumns.length && <div className="emptyTip TxtCenter">{_l('没有搜索结果')}</div>}
        {!sortAutoChange ? (
          <Fragment>
            {filteredColumns.map((column, i) =>
              showTabs && column.sectionId && !search ? null : (
                <SortableItem
                  index={i}
                  selected={selected}
                  column={column}
                  dragable={dragable}
                  search={search}
                  focusControlId={focusControlId}
                  handleItemClick={handleItemClick}
                  onClearSearch={onClearSearch}
                  tabColumns={
                    column.type === 52 ? filteredColumns.filter(l => l.sectionId === column.controlId) : undefined
                  }
                  retractTabControlIds={retractTabControlIds}
                  setRetractTabControlIds={setRetractTabControlIds}
                />
              ),
            )}
          </Fragment>
        ) : (
          <Fragment>
            {isShowColumns && (dragable || filteredShowColumns.length !== 0) && (
              <div className="Gray_75 Font13 bold mBottom14 mTop12 pLeft9 columnCheckListTitle showColumnCheckListTitle">{`${_l(
                '显示',
              )} ${filteredShowColumns.length}`}</div>
            )}
            {isShowColumns && filteredShowColumns.length === 0 && dragable && (
              <div className="pLeft9 dragListEmptyTip showDrafListEmptyCon">{_l('开启或拖拽到这里')}</div>
            )}
            {filteredShowColumns.map((column, i) => (
              <SortableItem
                index={i}
                selected={selected}
                column={column}
                handleItemClick={handleItemClick}
                focusControlId={focusControlId}
                dragable={dragable}
                search={search}
                onClearSearch={onClearSearch}
                showTabs={showTabs}
              />
            ))}
            {isShowColumns && (dragable || filteredHideColumns.length !== 0) && (
              <div className="Gray_75 Font13 bold mBottom14 mTop12 pLeft9 columnCheckListTitle hideColumnCheckListTitle">{`${_l(
                '隐藏',
              )} ${filteredHideColumns.length}`}</div>
            )}
            {isShowColumns && filteredHideColumns.length === 0 && dragable && (
              <div className="pLeft9 dragListEmptyTip hideDrafListEmptyCon">{_l('关闭或拖拽到这里')}</div>
            )}
            {filteredHideColumns.map((column, i) => (
              <SortableItem
                index={filteredShowColumns.length + i}
                selected={selected}
                column={column}
                handleItemClick={handleItemClick}
                focusControlId={focusControlId}
                dragable={dragable}
                search={search}
                onClearSearch={onClearSearch}
              />
            ))}
          </Fragment>
        )}
      </div>
    );
  },
);

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
  };
  static defaultProps = {
    layout: 1,
    noempty: true,
    dragable: false,
    selected: [],
    columns: [],
    placeholder: _l('搜索字段'),
    showTabs: false,
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

  @autobind
  handleItemClick(column, hideFocus) {
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
            column.sectionId && !selected.includes(column.sectionId) ? [column.sectionId] : [],
          ),
        ),
      });
    }
    this.setState({
      focusControlId: hideFocus ? undefined : column.controlId,
    });
  }

  @autobind
  handleSortEnd({ oldIndex, newIndex }, e) {
    const { controlsSorts } = this.state;
    const { selected, sortAutoChange } = this.props;
    let param = {};
    if (sortAutoChange) {
      $('.columnCheckList').removeClass('viewContentGrabbing');
      let oldControlId = controlsSorts[oldIndex];
      let newControlId = controlsSorts[newIndex];

      if (selected.indexOf(oldControlId) > -1 && selected.indexOf(newControlId) < 0) {
        // 显示到隐藏
        param.selected = selected.filter(controlId => controlId !== oldControlId);
      } else if (selected.indexOf(newControlId) > -1 && selected.indexOf(oldControlId) < 0) {
        // 隐藏到显示
        param.selected = selected.concat(oldControlId);
      } else if ($('.showDrafListEmptyCon').get(0)) {
        const { top: showTop } = $('.showColumnCheckListTitle').offset();
        const { top: hideTop } = $('.hideColumnCheckListTitle').offset();

        if (e.clientY < hideTop && e.clientY > showTop + 20) param.selected = selected.concat(oldControlId);
      } else if ($('.hideDrafListEmptyCon').get(0)) {
        const { top: hideTop } = $('.hideColumnCheckListTitle').offset();

        if (e.clientY > hideTop + 20) param.selected = selected.filter(controlId => controlId !== oldControlId);
      }
    }
    const newControlSorts = arrayMove(controlsSorts, oldIndex, newIndex);
    this.handleChange({
      ...param,
      controlsSorts: newControlSorts,
    });
  }

  @autobind
  handleSortStart({ index }) {
    if (!this.props.isShowColumns) return;
    const { controlsSorts, search } = this.state;
    $('.columnCheckList').addClass('viewContentGrabbing');
    if (search) return;
    let controlId = controlsSorts[index];
    this.setState({
      focusControlId: controlId,
    });
  }

  setRetractTabControlIds = (value, type) => {
    const { retractTabControlIds } = this.state;

    this.setState({
      retractTabControlIds: type ? retractTabControlIds.filter(l => l !== value) : retractTabControlIds.concat(value),
    });
  };

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
      isShowColumns = false,
      sortAutoChange = false,
      showTabs,
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
            isShowColumns={isShowColumns}
            focusControlId={focusControlId}
            onSortStart={this.handleSortStart}
            dragable={dragable && !search}
            search={search}
            onClearSearch={controlId => {
              this.setState({ search: '', focusControlId: controlId }, () => {
                let focusElem = document.querySelector('.columnCheckList .focusColumnItem');
                if (!focusElem) return;
                let top = focusElem.offsetTop - document.querySelector('.columnCheckList').offsetTop;
                $('.columnCheckList').scrollTop(top - 40);
              });
            }}
            sortAutoChange={sortAutoChange}
            showTabs={showTabs}
            retractTabControlIds={retractTabControlIds}
            setRetractTabControlIds={this.setRetractTabControlIds}
          />
        </div>
        {layout === 1 && advance && !search && quickOperate}
      </div>
    );
  }
}
