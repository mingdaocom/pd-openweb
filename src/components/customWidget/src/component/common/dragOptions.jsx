import PropTypes from 'prop-types';
import React from 'react';
import { classSet, strlen } from '../../utils/util';
import { DragSource, DropTarget } from 'react-dnd';
import config from '../../config';
import _ from 'lodash';
import Checkbox from './checkbox';
import './dragOptions.less';
import { findDOMNode } from 'react-dom';

let targetType = 'dragOptions';
let targetSpec = {
  hover(props, monitor, component) {
    if (!monitor.isOver({ shallow: true })) {
      props.hover(props.index);
    }
  },
  drop(props, monitor, component) {},
};
function targetCollect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  };
}

let sourceType = 'dragOptions';
let sourceSpec = {
  beginDrag(props, monitor, component) {
    let componentRect = findDOMNode(component).getBoundingClientRect();
    config.offset = {
      x: config.mouseOffset.left - componentRect.left,
      y: config.mouseOffset.top - componentRect.top,
    };
    props.changeDragPreview({
      widget: <OptionItem {...props} />,
    });
    props.changeDragState(config.DRAG_STATE.OPTIONS_DRAGGING);
    props.beginDrag(props.item, props.index);
    return {};
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
    props.drop();
    props.changeDragState(config.DRAG_STATE.DEFAULT);
  },
};
function sourceCollect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
  };
}

class OptionItem extends React.Component {
  constructor(props) {
    super(props);
  }

  handleChange(event) {
    let item = this.props.item;
    item.value = event.target.value;
    this.props.changeValue(item, this.props.index);
  }

  toggleCheckbox() {
    this.props.toggleCheckbox(this.props.index);
  }

  deleteOption() {
    this.props.deleteOption(this.props.index);
  }

  render() {
    let {
      item,
      connectDragSource,
      connectDropTarget,
      connectDragPreview,
    } = this.props;
    // 生成拖拽preview
    if (!connectDropTarget) {
      return (
        <div className='dragItem'>
          <span className='icon-task_sort dragPreview' />
          <input
            type='text'
            value={item.value}
            className='dragInput ThemeBorderColor3'
            onChange={this.handleChange.bind(this)}
          />
        </div>
      );
    }
    if (item === 'blank') {
      return (
        <div
          style={{
            width: '400px',
            height: '38px',
            backgroundColor: '#333',
            opacity: 0.25,
          }}
        />
      );
    }
    return connectDragPreview(
      connectDropTarget(
        <div className='dragItem'>
          {connectDragSource(
            <span
              className='dragPreview canDragEl activeShow tip-top-right'
              data-tip={_l('拖拽可调整选项的顺序')}>
              <span className='icon-drag fontIcon' />
            </span>,
          )}
          {item.key === undefined ? (
            <input
              type='text'
              value={item.value}
              className='dragInput ThemeBorderColor3'
              onChange={this.handleChange.bind(this)}
            />
          ) : (
            <input
              type='text'
              data-editcomfirm='true'
              value={item.value}
              className='dragInput ThemeBorderColor3'
              onChange={this.handleChange.bind(this)}
            />
          )}
          <div className='optionHandle'>
            <span className='tip-top-left' data-tip={_l('指定选项为默认选项')}>
              <Checkbox
                checked={item.checked}
                toggleCheckbox={this.toggleCheckbox.bind(this)}
              />
            </span>
            <span
              className='iconDelete pointer tip-top-left'
              data-tip={_l('删除选项内容')}>
              <span
                className='icon-task-new-delete fontIcon Font18'
                onClick={this.deleteOption.bind(this)}
              />
            </span>
          </div>
        </div>,
      ),
    );
  }
}

let DragItem = DragSource(
  sourceType,
  sourceSpec,
  sourceCollect,
)(DropTarget(targetType, targetSpec, targetCollect)(OptionItem));

class DragOptions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: _.cloneDeep(props.data),
    };
  }

  static propTypes = {
    data: PropTypes.array.isRequired, // 选项的数据，data.value 选项的值  data.checked 选项是否被选中
    changeDragPreview: PropTypes.func.isRequired, // dispatch的拖拽预览方法
    changeDragState: PropTypes.func.isRequired, // dispatch改变拖拽状态的方法
    changeData: PropTypes.func.isRequired, // 改变控件data的方法
    toggleCheckbox: PropTypes.func.isRequired, // 改变checkbox
    addOption: PropTypes.func.isRequired, // 加选项
  };

  componentWillReceiveProps(nexProps) {
    if (nexProps.data !== this.props.data) {
      this.setState({
        data: _.cloneDeep(nexProps.data),
      });
    }
  }

  beginDrag(item, index) {
    let data = this.state.data;
    this.dragItem = item;
    data.splice(index, 1, 'blank');
    this.setState({
      data,
    });
  }

  hover(index) {
    let data = this.state.data;
    _.remove(data, item => item === 'blank');
    data.splice(index, 0, 'blank');
    this.setState(data);
  }

  changeValue(item, index) {
    let data = this.state.data;
    data.splice(index, 1, item);
    this.props.changeData(data);
  }

  toggleCheckbox(index) {
    this.props.toggleCheckbox(index);
  }

  deleteOption(index) {
    let data = _.cloneDeep(this.state.data);
    // 只剩一个 不让删
    if (
      _.remove(
        data.map(option => option.isDeleted),
        item => !item,
      ).length <= 1
    ) {
      return false;
    }
    if (data[index].key) {
      data[index].isDeleted = true;
    } else {
      data.splice(index, 1);
    }
    this.props.changeData(data, true);
  }

  drop() {
    let data = _.cloneDeep(this.state.data);
    let dropIndex = 0;
    let changeOldDate = false;
    data = data.map((item, index) => {
      if (item === 'blank') {
        dropIndex = index;
        return this.dragItem;
      }
      return item;
    });
    // 判断是否拖拽影响了老数据
    data.forEach((item, index) => {
      if (index >= dropIndex && item.key) {
        changeOldDate = true;
      }
    });
    this.setState({ data });
    this.props.changeData(data, changeOldDate);
  }

  addOption() {
    this.props.addOption();
  }

  render() {
    return (
      <div className='dragOptions'>
        {this.state.data.map((item, index) => {
          if (item.isDeleted) {
            return null;
          }
          return (
            <DragItem
              index={index}
              item={item}
              key={index}
              changeDragPreview={this.props.changeDragPreview}
              changeDragState={this.props.changeDragState}
              beginDrag={this.beginDrag.bind(this)}
              drop={this.drop.bind(this)}
              hover={this.hover.bind(this)}
              changeValue={this.changeValue.bind(this)}
              toggleCheckbox={this.props.toggleCheckbox.bind(this)}
              deleteOption={this.deleteOption.bind(this)}
            />
          );
        })}
        <span
          className='addOption ThemeColor3'
          onClick={this.addOption.bind(this)}>
          {_l('+增加选项')}
        </span>
      </div>
    );
  }
}

export default DragOptions;
