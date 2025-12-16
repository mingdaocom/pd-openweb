import React, { Component, Fragment } from 'react';
import { findDOMNode } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { DragSource, DropTarget } from 'react-dnd';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import { Tooltip } from 'ming-ui/antd-components';
import Textarea from 'ming-ui/components/Textarea';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import ChecklistItem from './checklistItem';
import config from './common/config';
import DragPreview from './common/dragPreview';
import EmptyItem from './common/emptyItem';

const ClickAwayable = createDecoratedComponent(withClickAway);
let root;

class ChecklistOperator extends Component {
  componentDidMount() {
    const { isShowOperator } = this.props;
    const clipboardText = this.props.data.name;
    const items = _.map(this.props.data.items, item => {
      return `\n${item.name}`;
    });

    $('.checklistOperator .clipboard')
      .off()
      .on('click', function () {
        copy(clipboardText + items.join(''));
        alert(_l('已复制到剪切板'));
        isShowOperator();
      });
  }

  render() {
    return (
      <ClickAwayable
        component="ul"
        className="boxShadow5 boderRadAll_3 checklistOperator"
        onClickAway={() => this.props.isShowOperator()}
      >
        <li className="ThemeBGColor3" onClick={() => this.props.updateChecklistName()}>
          <i className="icon-edit" />
          {_l('重命名')}
        </li>
        <li className="ThemeBGColor3 clipboard">
          <i className="icon-task-new-copy Font14" />
          {_l('复制清单')}
          <Tooltip
            title={_l('复制后，在要使用的清单中点击“添加检查项”并粘贴文本，将会自动创建复制的检查项。')}
            placement="bottomLeft"
          >
            <span className="mLeft25">
              <i className="icon-help" />
            </span>
          </Tooltip>
        </li>
        <li className="ThemeBGColor3" onClick={() => this.props.removeCheckList()}>
          <i className="icon-trash" />
          {_l('删除清单')}
        </li>
      </ClickAwayable>
    );
  }
}

const checklistSource = {
  beginDrag(props, monitor, component) {
    const preview = findDOMNode(component).outerHTML;
    const componentRect = findDOMNode(component).getBoundingClientRect();
    const outerWidth = $(findDOMNode(component)).outerWidth();
    config.height = $(findDOMNode(component)).outerHeight();
    config.offset = {
      x: config.mouseOffset.left - componentRect.left,
      y: config.mouseOffset.top - componentRect.top,
    };

    root = createRoot($('.taskDetailDragPreviewBox:last')[0]);
    root.render(<DragPreview preview={preview} width={outerWidth} />);
    props.checklistBeginDrag(props.data, props.index);
    return {
      index: props.index,
    };
  },
  isDragging(props, monitor) {
    const preview = $('.taskDetailDragPreview:last')[0];
    const clientOffset = monitor.getClientOffset();
    if (preview && clientOffset) {
      preview.style.left = clientOffset.x - config.offset.x + 'px';
      preview.style.top = clientOffset.y - config.offset.y + 'px';

      // 处理滚动条滚动
      clearInterval(config.setInterval);
      config.setInterval = setInterval(() => {
        const scrollEl = $('.taskDetailScroll .scroll-viewport');
        const scroll = scrollEl.scrollTop();
        const top = clientOffset.y - config.offset.y;
        if (top <= 180) {
          scrollEl.scrollTop(scroll - 100);
        } else if ($(window).height() - top - config.height <= 90) {
          scrollEl.scrollTop(scroll + 100);
        }
      }, 200);
    }
  },
  endDrag(props) {
    props.checklistDrop();
    clearInterval(config.setInterval);
    root.unmount();
  },
};

const checklistTarget = {
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
    const clientOffset = monitor.getClientOffset();
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    if (dragIndex < props.index && hoverClientY < hoverMiddleY) {
      return;
    }

    if (dragIndex > props.index && hoverClientY > hoverMiddleY) {
      return;
    }

    props.checklistHover(props.index);
  },
};

@DragSource(config.CHECKLIST, checklistSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
}))
@DropTarget(config.CHECKLIST, checklistTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
}))
export default class Checklist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditName: false,
      isShowOperator: false,
      checklistAdd: props.showAddItem,
    };
  }

  /**
   * 修改名称
   */
  editName() {
    if (!this.props.noAuth) {
      this.setState({ isEditName: true });
      this.props.noDragIndexUpdate(this.props.index);
    }
  }

  /**
   * 修改清单名称
   * @param  {object} evt
   */
  checklistNameUpdate(evt) {
    if (evt.keyCode === 13 || evt.type === 'blur') {
      if (evt.keyCode === 13) {
        evt.preventDefault();
      }

      const name = evt.currentTarget.value.trim();

      this.setState({ isEditName: false });
      this.props.noDragIndexUpdate(-1);

      if (name) {
        this.props.updateCheckListName(this.props.data.checkListId, name);
      }
    }
  }

  /**
   * 添加检查项
   * @param  {object} evt
   */
  checklistAdd(evt) {
    if (evt.keyCode === 13 || evt.type === 'blur') {
      if (evt.keyCode === 13) {
        evt.preventDefault();
      }

      const name = evt.currentTarget.value.trim();
      if (name) {
        this.props.noDragIndexUpdate(-1);
        this.props.addItems(this.props.data.checkListId, name);
        if (evt.keyCode === 13) {
          $(evt.currentTarget).val('').focus();
        } else {
          this.setState({ checklistAdd: false });
        }
      } else {
        this.props.noDragIndexUpdate(-1);
        this.setState({ checklistAdd: false });
      }
    }
  }

  /**
   * 检查是左键点击
   * @param  {object} evt
   */
  checkMouseDownIsLeft(evt) {
    return evt.button === 0;
  }

  render() {
    const { data, connectDragSource, connectDropTarget } = this.props;
    const items = data.items || [];
    const sum = items.length;
    const completedSum = _.filter(items, item => item.status).length;
    const percent = (Math.floor((completedSum / sum) * 100) || 0) + '%';
    const isHidden = _.includes(this.props.taskFoldStatus, data.checkListId);

    if (data === 'blank') {
      return (
        <div
          style={{
            height: config.height + 'px',
            backgroundColor: '#e0e0e0',
            marginTop: '10px',
            borderRadius: '5px',
          }}
        />
      );
    }

    const checklist = () => {
      return (
        <div className="taskChecklist">
          <div className="taskChecklistHead">
            <i className="icon-list" />
            <div className={cx('taskChecklistName Font14', { Hidden: this.state.isEditName })}>
              <span onClick={() => this.editName()}>{data.name}</span>
              <span className="taskChecklistCount Font14">
                {completedSum}/{sum}
              </span>
            </div>
            {this.state.isEditName ? (
              <Textarea
                minHeight={20}
                maxLength={100}
                defaultValue={data.name}
                isSelect
                spellCheck={false}
                onKeyDown={evt => this.checklistNameUpdate(evt)}
                onBlur={evt => this.checklistNameUpdate(evt)}
              />
            ) : undefined}
            {this.props.noAuth ? undefined : (
              <i
                className={cx('icon-moreop pointer ThemeColor3', { Hidden: this.state.isEditName })}
                onMouseDown={evt => this.checkMouseDownIsLeft(evt) && this.setState({ isShowOperator: true })}
              />
            )}
            {this.state.isShowOperator ? (
              <ChecklistOperator
                updateChecklistName={() => {
                  this.setState({ isEditName: true, isShowOperator: false });
                  this.props.noDragIndexUpdate(this.props.index);
                }}
                isShowOperator={() => this.setState({ isShowOperator: false })}
                data={data}
                removeCheckList={() => {
                  this.setState({ isShowOperator: false });
                  this.props.removeCheckList(data.checkListId);
                }}
              />
            ) : undefined}
            <Tooltip title={isHidden ? _l('展开') : _l('收起')}>
              <span className="taskDetailFold">
                <i
                  className={cx('pointer ThemeColor3', isHidden ? 'icon-arrow-down-border' : 'icon-arrow-up-border')}
                  onClick={() => this.props.updateTaskFoldStatus(data.checkListId)}
                />
              </span>
            </Tooltip>
          </div>

          {!isHidden ? (
            <Fragment>
              <div className="taskChecklistPercent mTop15">
                <span className="taskChecklistPercentNum">{percent}</span>
                <div className="percentBox">
                  <div className="percentSize" style={{ width: percent }} />
                </div>
              </div>

              <div className="taskChecklistItems">
                {items.length ? (
                  items.map((item, i) => (
                    <ChecklistItem
                      key={i}
                      index={i}
                      data={item}
                      topIndex={this.props.index}
                      noDragIndex={this.props.noDragIndex}
                      noAuth={this.props.noAuth}
                      updateItemName={this.props.updateItemName}
                      removeItem={this.props.removeItem}
                      updateItemStatus={this.props.updateItemStatus}
                      createTask={this.props.createTask}
                      noDragIndexUpdate={this.props.noDragIndexUpdate}
                      checklistItemBeginDrag={this.props.checklistItemBeginDrag}
                      checklistItemHover={this.props.checklistItemHover}
                      checklistItemDrop={this.props.checklistItemDrop}
                    />
                  ))
                ) : (
                  <EmptyItem index={0} topIndex={this.props.index} checklistItemHover={this.props.checklistItemHover} />
                )}
              </div>

              {this.state.checklistAdd && (
                <div className="taskChecklistAdd flexRow ThemeBGColor6">
                  <span className="icon-task-status-no checklistItemStatus Font15" />
                  <Textarea
                    className="ThemeBGColor6 flex"
                    minHeight={20}
                    isFocus
                    onKeyDown={evt => this.checklistAdd(evt)}
                    onBlur={evt => this.checklistAdd(evt)}
                  />
                </div>
              )}

              {!this.props.noAuth && items.length < 100 && (
                <span
                  className={cx('taskChecklistItemAdd ThemeColor3 pointer', { Hidden: this.state.checklistAdd })}
                  onClick={() => {
                    this.setState({ checklistAdd: true });
                    this.props.noDragIndexUpdate(this.props.index);
                  }}
                >
                  <i className="icon-plus" />
                  {_l('一个检查项')}
                </span>
              )}
            </Fragment>
          ) : null}
        </div>
      );
    };

    return (
      <div>
        {this.props.noDragIndex === this.props.index || this.props.noAuth
          ? checklist()
          : connectDragSource(connectDropTarget(checklist()))}
      </div>
    );
  }
}
