/*
 * @Author: cloudZQY
 * @Module: 拖拽时呈现
 * @Description:
 * @Date: 2018-03-27 09:50:53
 * @Last Modified by: cloudZQY
 * @Last Modified time: 2018-03-27 09:50:53
 */
/*
 * @Author: cloudZQY
 * @Module: 拖拽时呈现
 * @Description:
 * @Date: 2018-03-27 09:50:53
 * @Last Modified by: cloudZQY
 * @Last Modified time: 2018-03-27 09:50:53
 */
/*
 * @Author: cloudZQY
 * @Module: 拖拽时呈现
 * @Description:
 * @Date: 2018-03-27 09:50:53
 * @Last Modified by: cloudZQY
 * @Last Modified time: 2018-03-27 09:50:53
 */
/*
 * @Author: cloudZQY
 * @Module: 拖拽时呈现
 * @Description:
 * @Date: 2018-03-27 09:50:53
 * @Last Modified by: cloudZQY
 * @Last Modified time: 2018-03-27 09:50:53
 */
import React from 'react';
import config from '../config';
import { connect } from 'react-redux';
import { classSet } from '../utils/util';

@connect(state => ({
  dragState: state.dragState,
  jDragPreviewWidget: state.jDragPreviewWidget,
}))
export default class DragPreview extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { jDragPreviewWidget, dragState } = this.props;
    let isDragging = !(dragState === config.DRAG_STATE.DEFAULT);
    let sc = classSet({
      isDragging: isDragging,
      ThemeBGColor6: isDragging,
      left:
        dragState === config.DRAG_STATE.LEFT_ANIMATE ||
        dragState === config.DRAG_STATE.LEFT_HALF_DRAGGING ||
        dragState === config.DRAG_STATE.LEFT_NORMAL_DRAGGING,
      transition: dragState === config.DRAG_STATE.LEFT_ANIMATE || dragState === config.DRAG_STATE.MIDDLE_ANIMATE,
    });

    let Preview = isDragging ? jDragPreviewWidget.widget : null;
    return (
      <div id="dragPreview" className={sc}>
        {Preview}
      </div>
    );
  }
}
