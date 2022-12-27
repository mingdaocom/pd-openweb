import React from 'react';
import PropTypes from 'prop-types';
import { getEditModel } from './editModels';
import { DragSource, DropTarget } from 'react-dnd';
import { classSet, createNewWidget, strlen } from '../../utils/util';
import config from '../../config';
import { findDOMNode } from 'react-dom';
import _ from 'lodash';

class EditItem extends React.Component {
  static propTypes = {
    editWidgets: PropTypes.array,
  };
  constructor(props) {
    super(props);
  }

  handleClick() {
    let { widget } = this.props;
    if (widget.type > 0) {
      // 新公式正在编辑判断
      if (this.props.formulaEditStatus) {
        alert(_l('请先保存正在编辑的公式'), 3);
        return;
      }
      if (this.props.formulaEdit) {
        this.props.seleteSingleWidghtFormula(widget.id);
      } else {
        this.props.changeEffictiveWidget(widget.id);
      }
    }
  }

  deleteWidget(event) {
    const choosedWidget = this.props.widget;
    this.props.deleteWidget(event.target.getAttribute('id'));
    // 如果是关联他表控件，删除时候判断关联他的他表字段。清空数据
    if (choosedWidget.type === 29) {
      const enumDefault = choosedWidget.data.enumDefault;
      const dataSource = `$${choosedWidget.data.controlId || choosedWidget.id}$`;
      const allWidgets = _.flatten(this.props.editWidgets);
      const sheetFields = allWidgets.filter(widget => widget.enumName === 'SHEETFIELD' && widget.data.dataSource === dataSource);
      if (sheetFields.length > 0) {
        if (enumDefault === 1) {
          sheetFields.forEach(item => {
            this.props.changeWidgetData(item.id, {
              fieldList: [],
              sourceControlId: '',
            });
          });
        } else if (enumDefault === 2) {
          sheetFields.forEach(item => {
            this.props.deleteWidget(item.id);
          });
        }
      }
      // 删除关联本表对应的控件
      if (choosedWidget.data.dataSource === config.global.sourceId) {
        const needDeleteWidget = _.find(allWidgets, widget => widget.data.sourceControlId === choosedWidget.data.controlId);
        if (needDeleteWidget) {
          this.props.deleteWidget(needDeleteWidget.id);
        }
      }
    }
  }

  componentDidMount() {
    if (this._div) {
      this._div.addEventListener('animationend', () => {
        this.props.changeWidgetWithoutRefresh(this.props.widget.id, {
          animation: false,
        });
      });
    }
  }

  render() {
    let { widget, editWidgets, connectDropTarget, connectDragSource, isPreview, effictiveWidgetId, changeWidgetData } = this.props;
    if (!widget) {
      return null;
    }
    let sc = classSet(
      {
        editHide: widget.type === config.WIDGETS.EDIT_HIDE.type,
        editFiller: widget.type === config.WIDGETS.EDIT_FILLER.type,
        canMove: widget.type > 0,
        ThemeBGColor6: widget.id === effictiveWidgetId,
        formulaFocus: this.props.formulaEdit && widget.highLight === false,
        formulaSelected: this.props.formulaEdit && widget.highLight,
        pointerEvents: this.props.formulaEdit && widget.highLight === undefined,
      },
      'editWidgetListItem',
      widget.data.half ? 'halfItem' : 'normalItem',
      widget.animation && widget.data.half ? 'editBoxHalfAnimation' : '',
      widget.animation && !widget.data.half ? 'editBoxAnimation' : ''
    );
    let EditModel = getEditModel(this.props.widget.type);
    let noDeleteIcon;
    let editItemBox;
    if (widget.type > 0) {
      // 正常组件
      editItemBox = (
        <div className="editItemBox">
          {widget.type !== config.WIDGETS.DETAILED.type && widget.data.controlName ? (
            <div className="editItemName flexRow">
              <span className={`overflow_ellipsis ${widget.data.attribute === 1 ? '' : 'flex'}`}>{widget.data.controlName}</span>
              {widget.data.attribute === 1 && <i className="icon-ic_title mLeft5 Font18 ThemeColor3" />}
              {widget.data.attribute === 1 && <div className="flex" />}
            </div>
          ) : null}
          <div className="editModelBox">
            <EditModel widget={widget} editWidgets={editWidgets} changeEffictiveWidget={this.props.changeEffictiveWidget} changeWidgetData={changeWidgetData} />
          </div>
        </div>
      );
    } else if (widget.type === config.WIDGETS.EDIT_FILLER.type) {
      noDeleteIcon = true;
      // 填充组件
      editItemBox = (
        <div
          className="editItemBox"
          style={{
            height:
              this.props.dragState === config.DRAG_STATE.LEFT_ANIMATE ||
              this.props.dragState === config.DRAG_STATE.LEFT_HALF_DRAGGING ||
              this.props.dragState === config.DRAG_STATE.LEFT_NORMAL_DRAGGING
                ? '31px'
                : document.getElementById('dragPreview').offsetHeight - 20 + 'px',
          }}
        >
          <EditModel widget={widget} />
        </div>
      );
    } else {
      noDeleteIcon = true;
      editItemBox = (
        <div className="editItemBox">
          <EditModel widget={widget} />
        </div>
      );
    }

    if (!connectDropTarget || isPreview) {
      // 用于生成拖拽的dragpreview
      return (
        <div
          className={sc}
          onClick={this.handleClick.bind(this)}
          ref={div => {
            this._div = div;
          }}
          style={{
            width: widget.data.half ? config.DRAG_PREVIEW_WIDGET / 2 + 'px' : config.DRAG_PREVIEW_WIDGET + 'px',
          }}
        >
          {editItemBox}
          <div className="editWidgetMask" />
        </div>
      );
    }
    return connectDragSource(
      connectDropTarget(
        <div
          className={sc}
          ref={div => {
            this._div = div;
          }}
          onMouseDown={() => {
            this.time = setTimeout(() => {
              let evt = document.createEvent('HTMLEvents');
              evt.initEvent('mousemove', true, false);
              findDOMNode(this._div).dispatchEvent(evt);
            }, 500);
          }}
          onMouseUp={() => {
            clearTimeout(this.time);
          }}
          onMouseMove={() => {
            clearTimeout(this.time);
          }}
        >
          {editItemBox}
          <div className="editWidgetMask canDragEl" onClick={this.handleClick.bind(this)} />
          {noDeleteIcon ? null : (
            <div
              className="deleteWidget icon-closeelement-bg-circle"
              id={widget.id}
              onClick={this.deleteWidget.bind(this)}
              style={
                widget.id === effictiveWidgetId && !this.props.formulaEdit
                  ? {
                      display: 'block',
                    }
                  : {}
              }
            />
          )}
        </div>
      )
    );
  }
}

let targetTypes = ['widgetList', 'editWidget'];
let targetSpec = {
  hover(props, monitor, component) {
    let item = monitor.getItem();

    // 拖入时，增加伪块
    if (!monitor.isOver({ shallow: true }) && props.widget.id !== config.lastMoveIn && props.widget.type !== config.WIDGETS.EDIT_FILLER.type) {
      // 修复重复触发move
      let clientOffset = monitor.getClientOffset();
      let componentRect = (findDOMNode(component) && findDOMNode(component).getBoundingClientRect && findDOMNode(component).getBoundingClientRect()) || {};
      if (!props.widget.data.half) {
        if (componentRect.left + componentRect.width / 2 > clientOffset.x) {
          // 在半边
          props.location.position = 'LEFT';
        } else {
          // 右半边
          props.location.position = 'RIGHT';
        }
      }
      props.insertFiller(
        createNewWidget('EDIT_FILLER', {
          data: {
            half: item.widget.data.half,
          },
        }),
        props.location,
        props.widget
      );
    }
    config.lastMoveIn = props.widget.id;
  },
  drop(props, monitor, component) {
    animteInsertWidget(props, monitor, 'fast');
  },
};
function targetCollect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  };
}

let sourceType = 'editWidget';
let sourceSpec = {
  beginDrag(props, monitor, component) {
    clearTimeout(component.time);
    let componentRect = (findDOMNode(component) && findDOMNode(component).getBoundingClientRect && findDOMNode(component).getBoundingClientRect()) || {};
    config.offset = {
      x: config.mouseOffset.left - componentRect.left,
      y: config.mouseOffset.top - componentRect.top,
    };
    props.changeDragPreview({
      widget: <EditItem {...props} />,
    });
    props.changeWidget(props.widget.id, {
      animation: false,
    });
    if (props.widget.data.half) {
      props.changeDragState(config.DRAG_STATE.MIDDLE_HALF_DRAGGING);
    } else {
      props.changeDragState(config.DRAG_STATE.MIDDLE_NORMAL_DRAGGING);
    }

    // 将自己位置的块换成占位块
    props.fillLocation(props.location);

    props.changeDragingItem(props.widget);
    return {
      widget: props.widget,
      filler: createNewWidget('EDIT_FILLER', {
        data: {
          half: props.widget.data.half,
        },
      }),
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
    config.lastMoveIn = '';
    // 没有拖到目标处时
    if (!monitor.didDrop()) {
      animteInsertWidget(props, monitor);
    }
  },
  canDrag(props, monitor) {
    return props.widget.type > 0 && !props.formulaEdit && !props.formulaEditStatus && props.dragState === config.DRAG_STATE.DEFAULT;
  },
};
function sourceCollect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
  };
}

function animteInsertWidget(props, monitor, mode) {
  var item = monitor.getItem();
  let $dragPreview = $('#dragPreview');
  let $editFiller = $('.editFiller');
  let transition = '';
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
    $dragPreview[0].style = '';
  });
  if (parseInt($dragPreview.css('top'), 10) === top && parseInt($dragPreview.css('left'), 10)) {
    // 一点没动
    props.changeDragState(config.DRAG_STATE.DEFAULT);
    props.insertWidget(item.widget);
    $dragPreview[0].style = '';
  }
  if (mode === 'fast') {
    transition = 'all 0.15s';
  }
  $dragPreview.css({
    left,
    top,
    transition,
    transform: 'rotate(0deg)',
  });
}

export default DragSource(sourceType, sourceSpec, sourceCollect)(DropTarget(targetTypes, targetSpec, targetCollect)(EditItem));
