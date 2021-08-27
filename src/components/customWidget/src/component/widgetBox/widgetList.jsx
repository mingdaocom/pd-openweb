import React from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import WidgetListItem from './widgetListItem';
import EditItem from '../editBox/editItem';
import config from '../../config';
import { createNewWidget, classSet } from '../../utils/util';
import { findDOMNode } from 'react-dom';

let sourceSpec;
class WidgetList extends React.Component {
  constructor(props) {
    super(props);
    this.click = true;
  }

  addBottomWidget() {
    // 如果还有控件在飞，就不让点
    if (this.props.dragState !== config.DRAG_STATE.DEFAULT) return false;
    let left, top;
    let $bottomLocation = $('.bottomLocation');
    let $editBox = $('.editBox');
    $('.editBox').scrollTop($('.editBox')[0].offsetTop + $bottomLocation[0].getBoundingClientRect().top);
    this.props.changeDragPreview({
      widget: <WidgetList {...this.props} widget={createNewWidget(this.props.enumName)} isPreview={true} />,
    });
    let componentRect = findDOMNode(this._li).getBoundingClientRect();
    $('#dragPreview').css({
      top: componentRect.top,
      left: componentRect.left,
    });
    let half = this.props.WIDGETS[this.props.enumName].data.half;
    // 计算动画飘向最后一排的位置
    if (half) {
      this.props.changeDragState(config.DRAG_STATE.LEFT_HALF_DRAGGING);
      let lastList = this.props.editWidgets[this.props.editWidgets.length - 1];
      if (lastList && lastList[1] && lastList[1].enumName === 'EDIT_HIDE') {
        let $editHide = $('.editHide');
        top = $editHide.last().offset().top + 5;
        left = $editHide.last().offset().left + 63;
      } else {
        this.props.changeDragState(config.DRAG_STATE.LEFT_NORMAL_DRAGGING);
        top = $bottomLocation.offset().top + 5;
        left = $bottomLocation.offset().left + 63;
      }
    } else {
      this.props.changeDragState(config.DRAG_STATE.LEFT_NORMAL_DRAGGING);
      top = $bottomLocation.offset().top + 5;
      left = $bottomLocation.offset().left + 216;
    }
    this.props.changeDragState(config.DRAG_STATE.LEFT_ANIMATE);
    $('#dragPreview').one('transitionend', () => {
      this.props.addBottomWidget(createNewWidget(this.props.enumName, { animation: true }));
      setTimeout(function () {
        $('.editBox').scrollTop($('.editBox')[0].offsetTop + $bottomLocation[0].getBoundingClientRect().top + 240);
      }, 0);
      this.props.changeDragState(config.DRAG_STATE.DEFAULT);
      $('#dragPreview').css({
        transform: '',
      });
    });
    if (parseInt($('#dragSource').css('top'), 10) === top && parseInt($('#dragSource').css('left'), 10)) {
      // 一点没动
      this.props.addBottomWidget(createNewWidget(this.props.enumName, { animation: true }));
      this.props.changeDragState(config.DRAG_STATE.DEFAULT);
    }
    $('#dragPreview').css({
      top,
      left,
      transform: 'rotate(0deg)',
    });
  }

  render() {
    let { editWidgets, connectDragSource } = this.props;
    let active = false;
    editWidgets.forEach(list =>
      list.forEach && list.forEach(widget => {
        if (widget && widget.id === this.props.effictiveWidgetId && widget.type === this.props.WIDGETS[this.props.enumName].type) {
          active = true;
        }
      })
    );
    let sc = classSet(
      {
        active: active,
      },
      this.props.isChoosed ? 'emptyItem' : '',
      'ThemeColor3',
      'widgetListLi',
      'canDragEl'
    );
    if (!connectDragSource) {
      return (
        <li className="widgetListLi" style={{ background: '#fff' }}>
          <WidgetListItem {...this.props} />
          <span className="addBottomWidget">
            <i className="icon-control_point iconFont iconMenu" />
          </span>
        </li>
      );
    }
    return connectDragSource(
      <li
        ref={li => {
          this._li = li;
        }}
        onMouseDown={e => {
          this.t = setTimeout(() => {
            let evt = document.createEvent('HTMLEvents');
            evt.initEvent('mousemove', true, false);
            findDOMNode(this._li).dispatchEvent(evt);
          }, 500);
        }}
        onMouseUp={() => {
          clearTimeout(this.t);
        }}
        className={sc}
      >
        <WidgetListItem {...this.props} />
        <span className="addBottomWidget tip-top-left" data-tip={_l('添加控件')}>
          <i className="icon-control_point iconMenu" onClick={this.addBottomWidget.bind(this)} />
        </span>
      </li>
    );
  }
}

let type = 'widgetList';
sourceSpec = {
  beginDrag(props, monitor, component) {
    clearTimeout(component.t);
    let componentRect = findDOMNode(component).getBoundingClientRect();
    config.offset = {
      x: config.mouseOffset.left - componentRect.left,
      y: config.mouseOffset.top - componentRect.top,
    };
    props.changeDragPreview({
      widget: <WidgetList {...props} widget={createNewWidget(props.enumName)} isPreview={true} />,
    });
    let half = props.WIDGETS[props.enumName].data.half;
    if (half) {
      props.changeDragState(config.DRAG_STATE.LEFT_HALF_DRAGGING);
    } else {
      props.changeDragState(config.DRAG_STATE.LEFT_NORMAL_DRAGGING);
    }
    return {
      widget: createNewWidget(props.enumName, { animation: true }),
    };
  },
  isDragging(props, monitor) {
    var preview = document.getElementById('dragPreview');
    let clientOffset = monitor.getClientOffset();
    if (clientOffset && clientOffset) {
      preview.style.left = clientOffset.x - config.offset.x + 'px';
      preview.style.top = clientOffset.y - config.offset.y + 'px';
    }
  },
  endDrag(props, monitor, component) {
    props.changeDragState(config.DRAG_STATE.LEFT_ANIMATE);
    config.lastMoveIn = '';
    if (!monitor.didDrop()) {
      // 没有拖到目标处时
      let offset = $('.emptyItem').offset();
      props.resetEditBox();
      $('#dragPreview').one('transitionend', () => {
        props.changeDragState(config.DRAG_STATE.DEFAULT);
        $('#dragPreview').css({
          transform: '',
        });
      });
      $('#dragPreview').css({
        top: offset.top,
        left: offset.left,
        transform: 'rotate(0deg)',
      });
    }
  },
  canDrag(props, monitor) {
    return props.dragState === config.DRAG_STATE.DEFAULT;
  },
};
function sourceCollect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
  };
}
export default DragSource(type, sourceSpec, sourceCollect)(WidgetList);
