import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Dialog from 'ming-ui/components/Dialog/Dialog';

export default class PrintOptDialog extends Component {
  static propTypes = {
    visible: PropTypes.any,
    reqInfo: PropTypes.any,
    printCheckAll: PropTypes.any,
    controlOption: PropTypes.any,
    changePrintVisible: PropTypes.any,
    processOption: PropTypes.any,
    worksheetId: PropTypes.string,
    hidePrintOptDialog: PropTypes.func,
    type: PropTypes.string,
    task: PropTypes.any,
    workflow: PropTypes.any,
    options: PropTypes.any,
  };
  constructor(props) {
    super(props);
    let controlOption = [];
    if (props.controlOption === 'all') {
      controlOption.splice(0, controlOption.length);
      const { reqInfo = {} } = props;
      const { controls = [], formControls = [] } = reqInfo;
      controls
        .filter(item => !item.printHide)
        .forEach((item, index) => {
          if (item && item.controlId) {
            controlOption.push(item.controlId);
          }
        });
      if (!this.props.worksheetId) {
        formControls.forEach(formControlItem => {
          if (formControlItem.tempControls.filter(item => item.needEvaluate).length > 0) {
            controlOption.push('formDetailEvaluate-' + formControlItem.formId);
          }
        });
      }
    } else {
      controlOption = props.controlOption;
    }
    this.state = {
      controlOption,
      options: props.options || {},
      printCheckAll: this.props.printCheckAll !== false,
      processOption: window.localStorage.getItem('hrPrintProcessOption') || 'all',
      reqInfo: props.reqInfo || {},
      task: props.task,
      workflow: props.workflow,
    };
  }
  toggleCheckItem = function (controlId) {
    const controlOption = this.state.controlOption;
    const index = controlOption.indexOf(controlId);
    let formDetailEvaluateLength = 0;
    const { reqInfo = {} } = this.state;
    if (reqInfo.formControls) {
      reqInfo.formControls.forEach(formControlItem => {
        if (formControlItem.tempControls.filter(item => item.needEvaluate).length > 0) {
          formDetailEvaluateLength++;
        }
      });
    }
    if (index > -1) {
      controlOption.splice(index, 1);
    } else {
      controlOption.push(controlId);
    }
    if (
      controlOption.length ===
      (reqInfo.controls || []).filter(item => !item.printHide).length + formDetailEvaluateLength
    ) {
      this.setState({ controlOption, printCheckAll: true });
    } else {
      this.setState({ controlOption, printCheckAll: false });
    }
  }.bind(this);
  toggleTaskCheckItem(key) {
    const { task } = this.state;
    const newTask = task.map(item => {
      if (item.key === key) {
        item.show = !item.show;
      }
      return item;
    });
    this.setState({
      task: newTask,
    });
  }
  toggleWorkflowCheckItem(key) {
    const { workflow } = this.state;
    const newWorkflow = workflow.map(item => {
      if (item.flowNode.id === key) {
        item.show = !item.show;
      }
      return item;
    });
    this.setState({
      workflow: newWorkflow,
    });
  }
  toggleCheckAll = function () {
    const controlOption = this.state.controlOption;
    if (this.state.printCheckAll) {
      // controlOption.splice(0, this.state.reqInfo.controls.filter(item => !item.printHide).length);
      this.setState({ controlOption: [], printCheckAll: false });
    } else {
      controlOption.splice(0, controlOption.length);
      this.state.reqInfo.controls
        .filter(item => !item.printHide)
        .forEach((item, index) => {
          if (item && item.controlId) {
            controlOption.push(item.controlId);
          }
        });
      if (this.state.reqInfo.formControls) {
        this.state.reqInfo.formControls.forEach(formControlItem => {
          if (formControlItem.tempControls.filter(item => item.needEvaluate).length > 0) {
            controlOption.push('formDetailEvaluate-' + formControlItem.formId);
          }
        });
      }
      this.setState({ controlOption, printCheckAll: true });
    }
  }.bind(this);
  renderApprovalFlow() {
    return (
      <div className="processOption">
        <span className="Block Font13 Gray_9e mBottom16">{_l('打印流程')}</span>
        <div
          className="processOptionItem mBottom6 pointer"
          onClick={() => {
            this.setState({ processOption: 'all' });
          }}
        >
          <input
            type="radio"
            className="mRight6 TxtMiddle"
            name="processOption"
            checked={this.state.processOption === 'all'}
          />
          <span className="Font13 Gray mRight10 TxtMiddle">{_l('完整模式')}</span>
          <span className="Font12 Gray_9e TxtMiddle">{_l('会保留完整的流程内容，包括"查看申请"等节点信息')}</span>
        </div>
        <div
          className="processOptionItem mBottom6 pointer"
          onClick={() => {
            this.setState({ processOption: 'some' });
          }}
        >
          <input
            type="radio"
            className="mRight6 TxtMiddle"
            name="processOption"
            checked={this.state.processOption === 'some'}
          />
          <span className="Font13 Gray TxtMiddle mRight10">{_l('精简模式')}</span>
          <span className="Font12 Gray_9e TxtMiddle">
            {_l('只会保留流程的关键内容，类似"通过审批"或"否决审批"等关键节点信息')}
          </span>
        </div>
        <div
          className="processOptionItem Pointer pointer"
          onClick={() => {
            this.setState({ processOption: 'no' });
          }}
        >
          <input
            type="radio"
            className="mRight6 TxtMiddle"
            name="processOption"
            checked={this.state.processOption === 'no'}
          />
          <span className="Font13 Gray TxtMiddle mRight10">{_l('不打印')}</span>
        </div>
      </div>
    );
  }
  renderWorkflow() {
    const { workflow } = this.state;
    return (
      <div className="controlOption mBottom32">
        <span className="Block Font13 Gray_9e mBottom16">{`${_l('流程中的节点内容')}`}</span>
        {workflow.map(item => (
          <div
            className="controlOptionItem mBottom15 InlineBlock pointer"
            key={item.flowNode.id}
            title={item.flowNode.name}
            onClick={() => {
              this.toggleWorkflowCheckItem(item.flowNode.id);
            }}
          >
            <input type="checkbox" onChange={() => {}} checked={item.show} className="TxtMiddle" />
            <span className="TxtMiddle">{item.flowNode.name}</span>
          </div>
        ))}
      </div>
    );
  }
  renderTask() {
    const { task } = this.state;
    return (
      <div className="controlOption mBottom32">
        <span className="Block Font13 Gray_9e mBottom16">{_l('任务')}</span>
        {task.map(item => (
          <div
            className="controlOptionItem mBottom15 InlineBlock pointer"
            key={item.key}
            title={item.name}
            onClick={() => {
              this.toggleTaskCheckItem(item.key);
            }}
          >
            <input type="checkbox" onChange={() => {}} checked={item.show} className="TxtMiddle" />
            <span className="TxtMiddle">{item.name}</span>
          </div>
        ))}
      </div>
    );
  }
  render() {
    const { options } = this.state;
    const { type } = this.props;
    return (
      <Dialog
        className="approvalPrintDialog"
        visible={this.props.visible}
        width={760}
        overlayClosable={false}
        title={_l('设置打印内容显隐')}
        okText={_l('确认')}
        onOk={() => {
          let controlOption = [];
          let formDetailEvaluateLength = 0;
          this.state.reqInfo.formControls &&
            this.state.reqInfo.formControls.forEach(formControlItem => {
              if (formControlItem.tempControls.filter(item => item.needEvaluate).length > 0) {
                formDetailEvaluateLength++;
              }
            });
          if (
            this.state.controlOption.length ===
            this.state.reqInfo.controls.filter(item => !item.printHide).length + formDetailEvaluateLength
          ) {
            controlOption = 'all';
          } else {
            controlOption = this.state.controlOption;
          }
          if (controlOption !== 'all' && controlOption.length === 0) {
            alert(_l('打印字段不可为空'), 3);
            return false;
          } else {
            safeLocalStorageSetItem('hrPrintProcessOption', this.state.processOption);
            this.props.changePrintVisible(
              this.state.processOption,
              this.state.printCheckAll,
              this.state.controlOption,
              options,
            );
          }
          if (type === 'task') {
            this.props.onUpdateTask(this.state.task);
          }
          if (type === 'workflow') {
            this.props.onUpdateWorkflow(this.state.workflow);
          }
          alert(_l('修改成功'));
        }}
        onCancel={() => {
          this.props.hidePrintOptDialog();
        }}
      >
        {this.props.type === 'task' && this.renderTask()}
        {this.state.reqInfo.controls.filter(item => !item.printHide).length > 0 && (
          <div className="controlOption mBottom32">
            <span className="Block Font13 Gray_9e mBottom16">{_l('自定义字段内容')}</span>
            {this.state.reqInfo.controls
              .sort((a, b) => {
                if (a.row === b.row) {
                  return a.col - b.col;
                } else {
                  return a.row - b.row;
                }
              })
              .map(
                (item, index) =>
                  !item.printHide && (
                    <div
                      className="controlOptionItem mBottom15 InlineBlock pointer"
                      key={index}
                      title={item.type === 22 ? _l('分段符') : item.controlName}
                      onClick={() => {
                        this.toggleCheckItem(item.controlId);
                      }}
                    >
                      <input
                        type="checkbox"
                        onChange={() => {}}
                        checked={this.state.controlOption.indexOf(item.controlId) > -1}
                        className="TxtMiddle"
                      />
                      <span className="TxtMiddle">
                        {item.type === 22 ? (item.controlName ? item.controlName : _l('分段符')) : item.controlName}
                      </span>
                    </div>
                  ),
              )}
            {this.props.worksheetId && (
              <div
                className="controlOptionItem mBottom15 InlineBlock pointer"
                onClick={() => {
                  this.setState({
                    options: Object.assign({}, options, {
                      showWorkflowQrCode: !options.showWorkflowQrCode,
                    }),
                  });
                }}
              >
                <input type="checkbox" onChange={() => {}} checked={options.showWorkflowQrCode} />
                <span className="TxtMiddle">{_l('二维码')}</span>
              </div>
            )}
            <div className="formDetailEvaluate">
              {this.state.reqInfo.formControls &&
                this.state.reqInfo.formControls.map(
                  (formControlItem, index) =>
                    formControlItem.tempControls.filter(item => item.needEvaluate).length > 0 &&
                    formControlItem.tempControls.filter(item => !item.printHide).length > 0 && (
                      <div
                        className="controlOptionItem mBottom15 InlineBlock pointer"
                        key={index}
                        title={
                          this.state.reqInfo.controls.filter(item => item.controlId === formControlItem.formId).length >
                            0 &&
                          this.state.reqInfo.controls.filter(item => item.controlId === formControlItem.formId)[0]
                            .controlName + '统计'
                        }
                        onClick={() => {
                          this.toggleCheckItem('formDetailEvaluate-' + formControlItem.formId);
                        }}
                      >
                        <input
                          type="checkbox"
                          onChange={() => {}}
                          checked={
                            this.state.controlOption.indexOf('formDetailEvaluate-' + formControlItem.formId) > -1
                          }
                          className="TxtMiddle"
                        />
                        <span className="TxtMiddle">
                          {this.state.reqInfo.controls.filter(item => item.controlId === formControlItem.formId)
                            .length > 0 &&
                            this.state.reqInfo.controls.filter(item => item.controlId === formControlItem.formId)[0]
                              .controlName + '统计'}
                        </span>
                      </div>
                    ),
                )}
            </div>
            {/*<div className="controlOptionItem allSelect pointer mTop10 Gray_9e" onClick={this.toggleCheckAll}>
              <input type="checkbox" className="TxtMiddle" checked={this.state.printCheckAll} />
              <span className="TxtMiddle">{_l('全部')}</span>
            </div>*/}
          </div>
        )}
        {this.props.type === 'hr' && this.renderApprovalFlow()}
        {this.props.type === 'workflow' && this.renderWorkflow()}
      </Dialog>
    );
  }
}
