import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DragDropContext } from 'react-dnd';
import MouseBackEnd from '@mdfe/react-dnd-mouse-backend';
import _ from 'lodash';
import { Dialog } from 'ming-ui';
import ajaxRequest from 'src/api/taskCenter';
import 'src/components/createTask/createTask';
import { htmlEncodeReg } from 'src/utils/common';
import {
  addItems,
  createTaskRemoveItem,
  removeCheckList,
  removeItem,
  taskFoldStatus,
  updateCheckListIndex,
  updateCheckListName,
  updateItemIndex,
  updateItemName,
  updateItemStatus,
} from '../../../redux/actions';
import Checklist from './checklist';
import config from './common/config';
import './less/checklist.less';

@DragDropContext(MouseBackEnd)
class ChecklistContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      source: _.cloneDeep(props.taskChecklists[props.taskId] || []),
      noDragIndex: -1, // 编辑名称时该组禁止拖拽
      showAddItemChecklistId: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    const source = _.cloneDeep(nextProps.taskChecklists[nextProps.taskId] || []);
    this.setState({
      source,
      showAddItemChecklistId:
        nextProps.addChecklist && source.length > this.state.source.length ? source[source.length - 1].checkListId : '',
    });

    if (nextProps.addChecklist && source.length > this.state.source.length) {
      nextProps.closeAddChecklist();
    }
  }

  componentDidMount() {
    // 记录鼠标按下的位置
    $(document).on('mousedown.checklistDrag', '.taskChecklistBox .taskChecklist', event => {
      config.mouseOffset = {
        left: event.clientX,
        top: event.clientY,
      };
    });
  }

  componentWillUnmount() {
    $(document).off('.checklistDrag');
  }

  /**
   * checklist 拖拽前数据替换
   * @param  {object} item
   * @param {number} index
   */
  checklistBeginDrag(item, index) {
    const source = this.state.source;
    this.dragItem = item;
    source.splice(index, 1, 'blank');
    this.setState({ source });
  }

  /**
   * checklist 经过中数据替换
   * @param {number} index
   */
  checklistHover(index) {
    const source = this.state.source;
    _.remove(source, item => item === 'blank');
    source.splice(index, 0, 'blank');
    this.setState({ source });
  }

  /**
   * checklist 放开拖拽保存数据
   */
  checklistDrop() {
    let source = this.state.source;
    const currentCheckListId = this.dragItem.checkListId;
    let previousCheckListId = '';
    let prevIndex;

    source = source.map((item, index) => {
      if (item === 'blank') {
        prevIndex = index - 1;
        return this.dragItem;
      }
      return item;
    });

    if (prevIndex >= 0) {
      previousCheckListId = source[prevIndex].checkListId;
    }

    this.props.dispatch(
      updateCheckListIndex(this.props.taskId, currentCheckListId, previousCheckListId, prevIndex + 1),
    );
    this.setState({ source });
  }

  /**
   * checklistItem 拖拽前数据替换
   * @param  {object} item
   * @param {number} index
   * @param {number} topIndex 上一级的index
   */
  checklistItemBeginDrag(item, index, topIndex) {
    const source = this.state.source;
    this.dragItem = item;
    source[topIndex].items.splice(index, 1, { type: 'blank', status: this.dragItem.status });
    this.setState({ source });
  }

  /**
   * checklistItem 经过中数据替换
   * @param {number} index
   * @param {number} topIndex 上一级的index
   */
  checklistItemHover(index, topIndex) {
    const source = this.state.source;
    if (source[topIndex].items.length < 100) {
      source.forEach(data => {
        _.remove(data.items, item => item.type === 'blank');
      });

      source[topIndex].items.splice(index, 0, { type: 'blank', status: this.dragItem.status });
      this.setState({ source });
    }
  }

  /**
   * checklistItem 放开拖拽保存数据
   */
  checklistItemDrop() {
    const source = this.state.source;
    const currentItemId = this.dragItem.itemId;
    let previousItemId = '';
    let topIndex = 0;
    let prevIndex;

    source.forEach((data, i) => {
      data.items = data.items.map((item, index) => {
        if (item.type === 'blank') {
          topIndex = i;
          prevIndex = index - 1;
          return this.dragItem;
        }
        return item;
      });
    });

    if (prevIndex >= 0) {
      previousItemId = source[topIndex].items[prevIndex].itemId;
    }

    this.props.dispatch(
      updateItemIndex(this.props.taskId, currentItemId, previousItemId, source[topIndex].checkListId, prevIndex + 1),
    );
    this.setState({ source });
  }

  /**
   * 编辑名称时禁止拖拽 数组下标
   * @param  {number} index
   */
  noDragIndexUpdate(index) {
    this.setState({ noDragIndex: index });
  }

  /**
   * 修改清单名称
   * @param {string} checkListId
   * @param {string} name
   */
  updateCheckListName(checkListId, name) {
    this.props.dispatch(updateCheckListName(this.props.taskId, checkListId, name));
  }

  /**
   * 删除清单
   * @param  {string} checkListId
   */
  removeCheckList(checkListId) {
    Dialog.confirm({
      title: _l('删除清单？'),
      children: <div>{_l('清单被删除后，将无法恢复。')}</div>,
      closable: false,
      onOk: () => {
        this.props.dispatch(removeCheckList(this.props.taskId, checkListId));
      },
    });
  }

  /**
   * 添加检查项
   * @param  {string} checkListId
   * @param  {string} names
   */
  addItems(checkListId, names) {
    this.props.dispatch(addItems(this.props.taskId, checkListId, names));
  }

  /**
   * 修改检查项名称
   * @param  {string} itemId
   * @param  {string} name
   */
  updateItemName(itemId, name) {
    this.props.dispatch(updateItemName(this.props.taskId, itemId, name));
  }

  /**
   * 删除检查项
   * @param  {string} itemId
   */
  removeItem(itemId) {
    this.props.dispatch(removeItem(this.props.taskId, itemId));
  }

  /**
   * 修改检查项状态
   * @param  {string} itemId
   * @param  {boolean} status
   */
  updateItemStatus(itemId, status) {
    this.props.dispatch(updateItemStatus(this.props.taskId, itemId, status));
  }

  /**
   * 检查项转任务
   * @param  {string} itemId
   * @param  {string} name
   */
  createTask(itemId, name) {
    ajaxRequest.getProjectIdAndFolderIdForItemConvertTask({ itemId }).then(result => {
      const { taskDetails } = this.props;
      const { projectID, folderID } = taskDetails[this.props.taskId].data;

      if (result.data.projectId !== projectID || result.data.folderId !== (folderID || '')) {
        alert(_l('无法在当前项目下创建任务'), 3);
      }

      $.CreateTask({
        itemId,
        TaskName: htmlEncodeReg(name),
        ProjectID: result.data.projectId,
        FolderID: result.data.folderId,
        folderName: result.data.folderName,
        callback: () => {
          this.props.dispatch(createTaskRemoveItem(this.props.taskId, itemId));
        },
      });
    });
  }

  /**
   * 更改任务详情的收起展开
   */
  updateTaskFoldStatus(checklistId) {
    this.props.dispatch(taskFoldStatus(this.props.taskId, checklistId));
  }

  render() {
    const { source, showAddItemChecklistId } = this.state;
    const taskFoldStatus = this.props.taskFoldStatus[this.props.taskId] || [];

    return (
      <div className="taskChecklistBox">
        {source.map((item, i) => (
          <Checklist
            key={i}
            index={i}
            data={item}
            {...this.props}
            showAddItem={showAddItemChecklistId === item.checkListId}
            noDragIndex={this.state.noDragIndex}
            noDragIndexUpdate={this.noDragIndexUpdate.bind(this)}
            checklistBeginDrag={this.checklistBeginDrag.bind(this)}
            checklistHover={this.checklistHover.bind(this)}
            checklistDrop={this.checklistDrop.bind(this)}
            checklistItemBeginDrag={this.checklistItemBeginDrag.bind(this)}
            checklistItemHover={this.checklistItemHover.bind(this)}
            checklistItemDrop={this.checklistItemDrop.bind(this)}
            updateCheckListName={this.updateCheckListName.bind(this)}
            removeCheckList={this.removeCheckList.bind(this)}
            addItems={this.addItems.bind(this)}
            updateItemName={this.updateItemName.bind(this)}
            removeItem={this.removeItem.bind(this)}
            updateItemStatus={this.updateItemStatus.bind(this)}
            createTask={this.createTask.bind(this)}
            taskFoldStatus={taskFoldStatus}
            updateTaskFoldStatus={this.updateTaskFoldStatus.bind(this)}
          />
        ))}

        <div className="taskDetailDragPreviewBox" />
      </div>
    );
  }
}

export default connect(state => state.task)(ChecklistContainer);
