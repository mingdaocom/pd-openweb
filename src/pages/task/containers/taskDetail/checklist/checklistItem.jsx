import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { DragSource, DropTarget } from 'react-dnd';
import cx from 'classnames';
import Textarea from 'ming-ui/components/Textarea';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import config from './common/config';
import DragPreview from './common/dragPreview';

const ClickAwayable = createDecoratedComponent(withClickAway);
let root;

class ChecklistOperator extends Component {
  render() {
    return (
      <ClickAwayable
        component="ul"
        className="boxShadow5 boderRadAll_3 checklistOperator"
        onClickAway={() => this.props.isShowOperator()}
      >
        <li className="ThemeBGColor3" onClick={() => this.props.createTask()}>
          <i className="icon-task-card" />
          {_l('转为任务')}
        </li>
        <li className="ThemeBGColor3" onClick={() => this.props.removeItem()}>
          <i className="icon-trash" />
          {_l('删除')}
        </li>
      </ClickAwayable>
    );
  }
}

const cardSource = {
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
    props.checklistItemBeginDrag(props.data, props.index, props.topIndex);
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
    props.checklistItemDrop();
    clearInterval(config.setInterval);
    root.unmount();
  },
};

const cardTarget = {
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

    props.checklistItemHover(props.index, props.topIndex);
  },
};

@DragSource(config.CHECKLIST_ITEM, cardSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
}))
@DropTarget(config.CHECKLIST_ITEM, cardTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
}))
export default class ChecklistItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditName: false,
      isShowOperator: false,
    };
  }

  /**
   * 修改检查项状态
   */
  updateItemStatus() {
    if (!this.props.noAuth) {
      this.props.updateItemStatus(this.props.data.itemId, !this.props.data.status);
    }
  }

  /**
   * 修改名称
   */
  editName(evt) {
    evt.nativeEvent.stopImmediatePropagation();
    if (!this.props.noAuth) {
      this.setState({ isEditName: true });
      this.props.noDragIndexUpdate(this.props.topIndex);
    }
  }

  /**
   * 修改检查项名称
   * @param  {object} evt
   */
  checklistNameUpdate(evt) {
    if (evt.keyCode === 13 || evt.type === 'blur') {
      if (evt.keyCode === 13) {
        evt.preventDefault();
      }

      const name = (evt.currentTarget.value || '').trim();

      this.setState({ isEditName: false });
      this.props.noDragIndexUpdate(-1);

      if (name) {
        this.props.updateItemName(this.props.data.itemId, name);
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

    if (data.type === 'blank') {
      return (
        <div
          style={{
            height: config.height + 'px',
            backgroundColor: '#e0e0e0',
            marginTop: '6px',
          }}
        />
      );
    }

    const checklistItem = () => {
      return (
        <div
          className={cx(
            'taskChecklistItem flexRow pointer',
            { itemActive: this.state.isShowOperator },
            { itemActiveBG: this.state.isEditName },
          )}
        >
          <span
            className={cx('checklistItemStatus Font18', data.status ? 'icon-ok' : 'icon-check_box')}
            onClick={() => this.updateItemStatus()}
          />

          {this.state.isEditName ? (
            <Textarea
              className="flex Font13"
              minHeight={20}
              maxLength={512}
              isSelect
              defaultValue={data.name}
              spellCheck={false}
              onKeyDown={evt => this.checklistNameUpdate(evt)}
              onBlur={evt => this.checklistNameUpdate(evt)}
            />
          ) : (
            <span
              className={cx('flex Font13 checklistItemName', { checklistItemCompleted: data.status })}
              onClick={evt => this.editName(evt)}
            >
              {data.name.length > 100 ? data.name.slice(0, 99) + '...' : data.name}
            </span>
          )}

          {this.props.noAuth ? undefined : (
            <i
              className="icon-moreop ThemeColor3"
              onMouseDown={evt => this.checkMouseDownIsLeft(evt) && this.setState({ isShowOperator: true })}
            />
          )}

          {this.state.isShowOperator ? (
            <ChecklistOperator
              isShowOperator={() => this.setState({ isShowOperator: false })}
              createTask={() => {
                this.setState({ isShowOperator: false });
                this.props.createTask(data.itemId, data.name);
              }}
              removeItem={() => {
                this.setState({ isShowOperator: false });
                this.props.removeItem(data.itemId);
              }}
            />
          ) : undefined}
        </div>
      );
    };

    return (
      <div>
        {this.props.noDragIndex === this.props.topIndex || this.props.noAuth
          ? checklistItem()
          : connectDragSource(connectDropTarget(checklistItem()))}
      </div>
    );
  }
}
