import React, { Component } from 'react';
import { findDOMNode, render } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
import cx from 'classnames';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import config from './config';
import DragPreview from './dragPreview';
const ClickAwayable = createDecoratedComponent(withClickAway);

class Operator extends Component {
  render() {
    return (
      <ClickAwayable component="ul" className="boderRadAll_3 templateStageOperator" onClickAway={() => this.props.showOperator()}>
        <li className="ThemeBGColor3" onClick={() => this.props.openEditName()}>
          {_l('修改看板名称')}
        </li>
        <li className="ThemeBGColor3" onClick={() => this.props.addStage()}>
          {_l('在此后添加新看板')}
        </li>
        {this.props.stages.length !== 1 ? (
          <li className="ThemeBGColor3" onClick={() => this.props.delStageItem()}>
            {_l('删除')}
          </li>
        ) : (
          undefined
        )}
      </ClickAwayable>
    );
  }
}

const stageSource = {
  beginDrag(props, monitor, component) {
    const preview = findDOMNode(component).outerHTML;
    const componentRect = findDOMNode(component).getBoundingClientRect();
    config.height = $(findDOMNode(component)).outerHeight();
    config.offset = {
      x: config.mouseOffset.left - componentRect.left,
      y: config.mouseOffset.top - componentRect.top,
    };
    render(<DragPreview preview={preview} />, document.getElementById('dragPreviewBox'));
    props.beginDrag(props.data, props.index);
    return {
      index: props.index,
    };
  },
  isDragging(props, monitor) {
    const preview = document.getElementById('stageDragPreview');
    const clientOffset = monitor.getClientOffset();
    if (preview && clientOffset) {
      preview.style.left = clientOffset.x - config.offset.x + 'px';
      preview.style.top = clientOffset.y - config.offset.y + 'px';

      // 处理滚动条滚动
      clearInterval(config.setInterval);
      config.setInterval = setInterval(() => {
        const $content = $('#customTemplateBox .customTemplateStage');
        const left = clientOffset.x - config.offset.x;
        if (left <= 50) {
          $content.scrollLeft($content.scrollLeft() - 100);
        } else if ($(window).width() - left <= 350) {
          $content.scrollLeft($content.scrollLeft() + 100);
        }
      }, 200);
    }
  },
  endDrag(props, monitor, component) {
    props.endDrag();
    clearInterval(config.setInterval);
    $('#dragPreviewBox').html('');
  },
};

const stageTarget = {
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();
    const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
    const clientOffset = monitor.getClientOffset();
    const hoverClientX = clientOffset.x - hoverBoundingRect.left;

    if (dragIndex < props.index && hoverClientX < hoverMiddleX) {
      return;
    }

    if (dragIndex > props.index && hoverClientX > hoverMiddleX) {
      return;
    }

    props.itemHover(props.index);
  },
};

@DragSource('stage', stageSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
}))
@DropTarget('stage', stageTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
}))
export default class CustomTemplateStageItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowOperator: false,
      isEditName: false,
    };
  }

  componentDidMount() {
    if (this.props.data === 'newStage') {
      $(findDOMNode(this.stageName)).select();
    }
  }

  componentDidUpdate() {
    if (this.state.isEditName || this.props.data === 'newStage') {
      $(findDOMNode(this.stageName)).select();
    }
  }

  /**
   * 打开名称修改
   */
  openEditName() {
    this.setState({ isEditName: true, isShowOperator: false });
    this.props.noDragIndexUpdate(this.props.index);
  }

  /**
   * 修改阶段名称
   * @param  {object} evt
   */
  updateStageName(evt) {
    if (evt.keyCode === 13 || evt.type === 'blur') {
      const name = evt.currentTarget.value;

      this.setState({ isEditName: false });
      this.props.noDragIndexUpdate(-1);

      if (name) {
        this.props.updateStageName(name, this.props.index);
      }
    }
  }

  /**
   * 添加新阶段
   * @param  {object} evt
   */
  addStageItem(evt) {
    if (evt.keyCode === 13 || evt.type === 'blur') {
      this.props.addStageItem(evt.currentTarget.value);
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
    const itemArray = {
      1: [''],
      2: ['', ''],
      3: ['', '', ''],
    };

    // 拖拽
    if (data === 'blank') {
      return <div className="customTemplateListBlank" style={{ height: config.height + 'px' }} />;
    }

    // 添加新阶段
    if (data === 'newStage') {
      return (
        <div className="customTemplateList boderRadAll_3 customTemplateListAdd">
          <input
            type="text"
            className="templateStageEdit ThemeBorderColor3 boderRadAll_3 Font14"
            defaultValue={data.name}
            placeholder={_l('填写看板名称')}
            ref={(stageName) => {
              this.stageName = stageName;
            }}
            onKeyDown={evt => this.addStageItem(evt)}
            onBlur={evt => this.addStageItem(evt)}
          />
        </div>
      );
    }

    const stagelist = () => {
      return (
        <div className="customTemplateList boderRadAll_3">
          {this.state.isEditName ? (
            <input
              type="text"
              className="templateStageEdit ThemeBorderColor3 boderRadAll_3 Font14"
              defaultValue={data.name}
              placeholder={_l('填写看板名称')}
              ref={(stageName) => {
                this.stageName = stageName;
              }}
              onKeyDown={evt => this.updateStageName(evt)}
              onBlur={evt => this.updateStageName(evt)}
            />
          ) : (
            <div className="templateStageHead Font14">
              <span className="overflow_ellipsis">{data.name}</span>
              <i
                className="icon-arrow-down-border ThemeColor3 pointer"
                onMouseDown={evt => this.checkMouseDownIsLeft(evt) && this.setState({ isShowOperator: !this.state.isShowOperator })}
              />
              {this.state.isShowOperator ? (
                <Operator
                  showOperator={() => this.setState({ isShowOperator: false })}
                  stages={this.props.stages}
                  openEditName={() => this.openEditName()}
                  addStage={() => {
                    this.setState({ isShowOperator: false });
                    this.props.addStage(this.props.index + 1);
                  }}
                  delStageItem={() => {
                    this.setState({ isShowOperator: false });
                    this.props.delStageItem(this.props.index);
                  }}
                />
              ) : (
                undefined
              )}
            </div>
          )}
          <ul className="customTemplateItem">
            {itemArray[data.taskCount].map((item, i) => (
              <li key={i}>
                <span className="customTemplateItemLine1" />
                <span className="customTemplateItemLine2" />
                <span className="customTemplateItemAvatar icon-task-select-other" />
              </li>
            ))}
          </ul>
        </div>
      );
    };

    return (
      <div className="customTemplateInline">
        {this.props.noDragIndex === this.props.index ? stagelist() : connectDragSource(connectDropTarget(stagelist()))}
      </div>
    );
  }
}
