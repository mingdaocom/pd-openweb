import PropTypes from 'prop-types';
import React from 'react';
import {
  classSet,
  returnCustomString,
  returnCustomDataSource,
  checkDeleteFormulaChange,
  getBindFormula,
  getBindMoneyCn,
  showDeleteConfirmModal,
} from '../../utils/util';
import { DragSource, DropTarget } from 'react-dnd';
import { render, findDOMNode } from 'react-dom';
import config from '../../config';
import global from '../../config/globalConfig';
import _ from 'lodash';
import './dragDetailedOptions.less';
import Dropdown from './dropdown';
import { getSettingsModel } from '../settingsBox/settingsModels';
import MDDialog from 'src/components/mdDialog/dialog';
import Checkbox from './checkbox';

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

  state = {
    item: '',
    showDialog: false,
    formulaState: {
      formulaEdit: false,
    },
    controls: [],
  };

  handleChange(type) {
    let props = this.props;
    checkDeleteFormulaChange(props.item.id, [props.widget.data.controls], function () {
      const item = _.find(config.WIDGETS, widget => widget.type === parseInt(type, 10));
      item.id = -new Date() + '' + Math.random(1, 1000);
      props.changeValue(item, props.index);
    });
  }

  deleteOption() {
    let props = this.props;
    /* checkDeleteFormulaChange(props.item.id, [props.widget.data.controls], function () {
      props.deleteOption(props.index);
    });*/

    // 检查是否有关联的公式组件
    let formulars = getBindFormula(props.item.id, [props.widget.data.controls]);
    // 检查是否有关联的大写金额组件
    let moneyCns = getBindMoneyCn(props.item.id, [props.widget.data.controls]);
    if (formulars.influenceWidgets.length || moneyCns.influenceWidgets.length) {
      showDeleteConfirmModal(formulars.controlName, formulars.influenceWidgets.concat(moneyCns.influenceWidgets), () => {
        props.deleteOption(props.index);
      });
    } else {
      props.deleteOption(props.index);
    }
  }

  changeWidgetData(id, data) {
    // 限定长度
    if (data.controlName) {
      data.controlName = data.controlName.slice(0, 255);
    } else if (data.hint) {
      data.hint = data.hint.slice(0, 255);
    }
    let item = _.cloneDeep(this.state.item);

    Object.assign(item.data, data);
    this.setState({ item });
  }

  // 切换选中
  toggleCheckbox() {
    let controls = _.cloneDeep(this.props.widget.data.controls);
    controls[this.props.index].data.needEvaluate = !controls[this.props.index].data.needEvaluate;

    this.props.changeWidgetData(this.props.widget.id, {
      controls: controls,
    });
  }

  // 切换大写选中
  toggleUppercaseCheckbox() {
    let controls = _.cloneDeep(this.props.widget.data.controls);
    controls[this.props.index].data.enumDefault = controls[this.props.index].data.enumDefault ? 0 : 1;

    this.props.changeWidgetData(this.props.widget.id, {
      controls: controls,
    });
  }

  // 更新运算方法
  updateControlFormula = value => {
    let controls = _.cloneDeep(this.props.widget.data.controls);
    controls[this.props.index].data.enumDefault2 = parseInt(value, 10);

    this.props.changeWidgetData(this.props.widget.id, {
      controls: controls,
    });
  };

  // 编辑
  editOption() {
    this.setState({
      showDialog: true,
      item: this.props.item,
      formulaState: {
        formulaEdit: false,
      },
      controls: [this.props.widget.data.controls],
    });
  }

  /* 编辑只改变当前的状态 不需要更新数据 start */
  // 弹层上切换选中
  dialogToggleCheckbox() {
    let item = _.cloneDeep(this.state.item);
    item.data.needEvaluate = !item.data.needEvaluate;
    this.setState({ item });
  }

  dialogHandleChange(type) {
    let item = _.cloneDeep(this.state.item);
    item.data.enumDefault2 = parseInt(type, 10);
    this.setState({ item });
  }

  seleteWidgetHighlight(id, dataSource, isUpdate) {
    let controls = this.state.controls;
    controls.forEach(list =>
      list.forEach(widget => {
        if ((widget.type === 4 || widget.type === 5 || widget.type === 18 || widget.type === 19) && widget.id !== id) {
          if (dataSource.indexOf(widget.id) >= 0 && this.state.item.data.enumDefault > 1) {
            widget.highLight = true;
          } else {
            widget.highLight = false;
          }
        } else {
          widget.highLight = undefined;
        }
      })
    );

    this.setState({ controls });
    this.changeFormulaState(true);

    if (!global.alreadySaved || isUpdate) {
      global.alreadySaved = true;
      global.preDataSource = dataSource;
    }
  }

  selectFormula(id) {
    if (!this.state.item.data.enumDefault) {
      return;
    }

    if (this.state.item.data.enumDefault === 1) {
      this.seleteSingleWidghtCustomFormula(id);
    } else {
      this.seleteSingleWidghtFormula(id);
    }
  }

  seleteSingleWidghtFormula(id) {
    let item = this.state.item;
    let formulaName = _.find(config.formulaType, formula => formula.type === item.data.enumDefault).formulaName;
    let dataSource = [];
    let selectId = '$' + id + '$';
    if (item.data.dataSource && item.data.dataSource.replace(/\(|\)/g, '').replace(formulaName, '')) {
      dataSource = item.data.dataSource
        .replace(/\(|\)/g, '')
        .replace(formulaName, '')
        .split(',');
    }
    if (dataSource.indexOf(selectId) >= 0) {
      _.remove(dataSource, i => i === selectId);
    } else {
      dataSource.push(selectId);
    }

    if (dataSource.length) {
      item.data.dataSource = formulaName + '(' + dataSource.join(',') + ')';
    } else {
      item.data.dataSource = '';
    }

    this.setState({ item });
    this.seleteWidgetHighlight(this.state.item.id, item.data.dataSource);
  }

  seleteSingleWidghtCustomFormula(id) {
    let item = this.state.item;
    let dataSource = '';
    let leftContent = global.cursorContent.slice(0, global.caretPos);
    let rightContent = global.cursorContent.slice(global.caretPos);

    dataSource = returnCustomDataSource(returnCustomString(true));
    let currentData = dataSource[global.clickFormulaIndex];

    // 常用公式集合中添加
    if (
      currentData &&
      (currentData.indexOf('SUM') >= 0 ||
        currentData.indexOf('AVG') >= 0 ||
        currentData.indexOf('MIN') >= 0 ||
        currentData.indexOf('MAX') >= 0 ||
        currentData.indexOf('PRODUCT') >= 0)
    ) {
      let formulaName = currentData.match(/[\s\S]*?\(/)[0];
      let sing = currentData.replace(/[\s\S]*?\(|\)/gi, '');
      let formulaArray = sing ? sing.split(',') : [];
      formulaArray.push('$' + id + '$');
      dataSource[global.clickFormulaIndex] = formulaName + formulaArray.join(',') + ')';
    } else {
      dataSource.splice(global.clickFormulaIndex, 1, leftContent, '$' + id + '$', rightContent);
      if (leftContent) {
        global.clickFormulaIndex = global.clickFormulaIndex + 2;
      } else {
        global.clickFormulaIndex++;
      }
    }

    item.data.dataSource = dataSource.join('');
    this.setState({ item });
  }

  changeFormulaState(isEdit) {
    let formulaState = this.state.formulaState;
    formulaState.formulaEdit = isEdit;
    this.setState({ formulaState });
  }
  /* 编辑只改变当前的状态 不需要更新数据 end */

  toggleRequired = () => {
    let item = _.cloneDeep(this.state.item);
    item.required = !this.state.item.required;
    this.setState({ item });
  };

  render() {
    let formulaType = _.cloneDeep(config.formulaType);
    _.remove(formulaType, formula => formula.type === 1);
    let formulaDropdownData = _.map(formulaType, formula => {
      return {
        value: formula.type,
        name: formula.name,
      };
    });

    let { item, index, connectDragSource, connectDropTarget, connectDragPreview } = this.props;
    let SettingsModel = getSettingsModel(item.type);
    const _this = this;
    let settings = {
      width: item.type !== 18 ? 480 : 780,
      className: 'customWidget commonCustomWidget',
      container: {
        header: item.type !== 18 ? _l('设置%0', item.widgetName) : '',
        yesFn: () => {
          let controls = _.cloneDeep(_this.props.widget.data.controls);
          controls[index] = _this.state.item;
          _this.props.changeWidgetData(_this.props.widget.id, {
            controls: controls,
          });
        },
      },
      callback: () => {
        this.setState({ showDialog: false });
      },
    };

    const dropdownData = _.compact(
      config.detailWidgetTypes.map(
        key =>
          config.WIDGETS[key] && {
            value: config.WIDGETS[key].type,
            name: config.WIDGETS[key].widgetName,
          }
      )
    );

    // 生成拖拽preview
    if (!connectDropTarget) {
      return (
        <div className="dragDetailItem">
          <span className="icon-task_sort dragPreview" />
          <Dropdown data={dropdownData} value={item.type} onChange={this.handleChange.bind(this)} hint={item.data ? item.data.controlName : item.hint} />
          <span className="overflow_ellipsis dragDetailItemName">{item.data ? item.data.controlName : undefined}</span>
        </div>
      );
    }
    if (item === 'blank') {
      return (
        <div
          style={{
            width: '320px',
            height: '38px',
            backgroundColor: '#333',
            opacity: 0.25,
          }}
        />
      );
    }
    return connectDragPreview(
      connectDropTarget(
        <div className="dragDetailItem">
          <span className="dragDetailNum">{index + 1}</span>
          {connectDragSource(
            <span className="dragPreview canDragEl activeShow tip-top-right" data-tip={_l('拖拽可调整选项的顺序')}>
              <span className="icon-task_sort fontIcon" />
            </span>
          )}
          <Dropdown data={dropdownData} value={item.type} onChange={this.handleChange.bind(this)} hint={item.data ? item.data.controlName : item.hint} />
          <span className="overflow_ellipsis dragDetailItemName">{item.data ? item.data.controlName : undefined}</span>
          <div className="optionHandle activeShow">
            <span className={classSet({ Hidden: !item.data }, 'iconDetailEdit pointer tip-top-left')} data-tip={_l('编辑选项内容')}>
              <span className="icon-edit fontIcon Font18" onClick={this.editOption.bind(this)} />
            </span>
            <span className="iconDelete pointer tip-top-left" data-tip={_l('删除选项内容')}>
              <span className="icon-task-new-delete fontIcon Font18" onClick={this.deleteOption.bind(this)} />
            </span>
          </div>
          {item.type === 4 || item.type === 5 || item.type === 18 ? (
            <div className="dragDetailItemCheckBox">
              <Checkbox checked={item.data.needEvaluate} toggleCheckbox={this.toggleCheckbox.bind(this)} name={_l('统计运算')} />
              <span
                className="tip-top-right"
                data-tip={_l('统计结果呈现在任务详情内明细的最下方')}
                style={{
                  verticalAlign: 'middle',
                  marginTop: '-5px',
                  marginLeft: '4px',
                  display: 'inline-block',
                  opacity: 1,
                }}
              >
                <i
                  className="icon-novice-circle pointer"
                  style={{
                    color: '#b0b0b0',
                  }}
                />
              </span>
              {item.data.needEvaluate ? <Dropdown data={formulaDropdownData} value={item.data.enumDefault2} onChange={this.updateControlFormula} /> : null}
              {item.type === 5 ? (
                <span className="mLeft5">
                  <Checkbox checked={!!item.data.enumDefault} toggleCheckbox={this.toggleUppercaseCheckbox.bind(this)} name={_l('大写金额')} />
                </span>
              ) : null}
            </div>
          ) : (
            undefined
          )}
          {this.state.showDialog ? (
            <MDDialog {...settings}>
              <SettingsModel
                widget={this.state.item}
                editWidgets={this.state.controls}
                formulaState={this.state.formulaState}
                changeWidgetData={this.changeWidgetData.bind(this)}
                selectFormula={this.selectFormula.bind(this)}
                seleteSingleWidghtFormula={this.seleteSingleWidghtFormula.bind(this)}
                changeFormulaState={this.changeFormulaState.bind(this)}
                seleteWidgetHighlight={this.seleteWidgetHighlight.bind(this)}
                changeDragPreview={this.props.changeDragPreview.bind(this)}
                changeDragState={this.props.changeDragState.bind(this)}
                isDetail={true}
                toggleCheckbox={this.dialogToggleCheckbox.bind(this)}
                handleChange={this.dialogHandleChange.bind(this)}
              />
              {this.state.item.type !== 13 && // 附件
              this.state.item.type !== 18 && // 公式
              this.state.item.type !== 25 && // 大写金额
              this.state.item.type < 10000 ? ( // 非只读控件
                <div>
                  <Checkbox
                    toggleCheckbox={() => {
                      this.toggleRequired();
                    }}
                    optionKey="required"
                    checked={this.state.item.required}
                    name="必填项"
                  />
                </div>
              ) : null}
            </MDDialog>
          ) : (
            undefined
          )}
        </div>
      )
    );
  }
}

let DragItem = DragSource(sourceType, sourceSpec, sourceCollect)(DropTarget(targetType, targetSpec, targetCollect)(OptionItem));

class DragOptions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: _.cloneDeep(props.data),
    };
  }

  static propTypes = {
    widget: PropTypes.object.isRequired,
    data: PropTypes.array.isRequired,
    changeDragPreview: PropTypes.func.isRequired, // dispatch的拖拽预览方法
    changeDragState: PropTypes.func.isRequired, // dispatch改变拖拽状态的方法
    changeData: PropTypes.func.isRequired, // 改变控件data的方法
    addOption: PropTypes.func.isRequired, // 加选项
    changeWidgetData: PropTypes.func.isRequired, // 更新数据
  };

  componentWillReceiveProps(nexProps) {
    this.setState({
      data: _.cloneDeep(nexProps.data),
    });
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

  deleteOption(index) {
    let data = _.cloneDeep(this.state.data);
    data.splice(index, 1);
    this.props.changeData(data);
  }

  drop() {
    let data = _.cloneDeep(this.state.data);
    let dropIndex = 0;
    data = data.map((item, index) => {
      if (item === 'blank') {
        dropIndex = index;
        return this.dragItem;
      }
      return item;
    });
    this.props.changeData(data);
  }

  addOption() {
    this.props.addOption();
  }

  render() {
    return (
      <div className="dragDetailOptions">
        {this.state.data.map((item, index) => {
          return (
            <DragItem
              index={index}
              key={index}
              item={item}
              widget={this.props.widget}
              formulaState={this.props.formulaState}
              changeDragPreview={this.props.changeDragPreview}
              changeDragState={this.props.changeDragState}
              beginDrag={this.beginDrag.bind(this)}
              drop={this.drop.bind(this)}
              hover={this.hover.bind(this)}
              changeValue={this.changeValue.bind(this)}
              deleteOption={this.deleteOption.bind(this)}
              changeWidgetData={this.props.changeWidgetData}
            />
          );
        })}
        <span className="addOption ThemeColor3" onClick={this.addOption.bind(this)}>
          +增加明细项
        </span>
      </div>
    );
  }
}

export default DragOptions;
