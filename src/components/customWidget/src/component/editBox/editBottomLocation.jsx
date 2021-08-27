import React from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import { createNewWidget } from '../../utils/util';
import config from '../../config';

class EditBottomLocation extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {}

  render() {
    let { connectDropTarget, isOver } = this.props;
    return connectDropTarget(<div className="bottomLocation" />);
  }
}

let types = ['widgetList', 'editWidget'];
let targetSpec = {
  hover(props, monitor, component) {
    let item = monitor.getItem();
    // 拖入时，增加伪块
    if (!monitor.isOver({ shallow: true })) {
      props.insertFiller(
        createNewWidget('EDIT_FILLER', {
          data: {
            half: item.widget.data.half,
          },
        }),
        'bottom',
        props.widget
      );
    }
    config.lastMoveIn = 'bottom';
  },
  drop(props, monitor, component) {
    var item = monitor.getItem();
    let $dragPreview = $('#dragPreview');
    let $editFiller = $('.editFiller');
    let { left, top } = $editFiller.offset();
    if (props.dragState === config.DRAG_STATE.LEFT_HALF_DRAGGING || props.dragState === config.DRAG_STATE.LEFT_NORMAL_DRAGGING) {
      left = left + ($editFiller.innerWidth() - $dragPreview.innerWidth()) / 2;
      top = top + ($editFiller.innerHeight() - $dragPreview.innerHeight()) / 2;
    }
    props.changeDragState(config.DRAG_STATE.MIDDLE_ANIMATE);
    $dragPreview.one('transitionend', () => {
      props.changeDragState(config.DRAG_STATE.DEFAULT);
      item.widget.animation = true;
      props.insertWidget(item.widget);
      $dragPreview.css({
        left,
        top,
        transform: '',
      });
    });
    $dragPreview.css({
      left,
      top,
      transform: 'rotate(0deg)',
    });
  },
};
function targetCollect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  };
}

export default DropTarget(types, targetSpec, targetCollect)(EditBottomLocation);
