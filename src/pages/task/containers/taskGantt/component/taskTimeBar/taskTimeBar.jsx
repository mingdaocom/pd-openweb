import React, { Component } from 'react';
import config from '../../config/config';
import './taskTimeBar.less';
import TimeBars from '../timeBars/timeBars';
import { DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import cx from 'classnames';

const ganttTarget = {
  hover(props, monitor, component) {
    // 触发拖拽单侧的时候也触发了拖拽整个的bug
    if (config.isSingleDrag) {
      return;
    }

    const dragIndex = monitor.getItem().index;

    if (dragIndex !== props.index && props.dragHoverIndex !== props.index) {
      props.ganttDragHover(props.index);
    } else if (dragIndex === props.index && props.dragHoverIndex !== -1) {
      props.ganttDragHover(-1);
    }
  },
};

@DropTarget(config.DRAG_GANTT, ganttTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
}))
export default class TaskTimeBar extends Component {
  render() {
    const { item, connectDropTarget } = this.props;

    return connectDropTarget(
      <div
        className={cx('taskTimeBars', { taskTimeBarsHover: this.props.dragHoverIndex === this.props.index })}
        style={{ height: item.taskTimeBars.length * 26 }}
      >
        {item.taskTimeBars.map((timeBars, row) =>
          timeBars.map((data, col) => {
            return <TimeBars data={data} row={row} col={col} key={data.taskId} {...this.props} />;
          })
        )}

        {!config.folderId && item.account.hidden ? (
          <div className="taskTimeBarsHidden" onClick={() => this.props.updateUserStatus(item.account.accountId)} />
        ) : (
          undefined
        )}
      </div>
    );
  }
}
