import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Modal } from 'ming-ui/antd-components';

export default class PrintOptDialog extends Component {
  static propTypes = {
    visible: PropTypes.any,
    reqInfo: PropTypes.any,
    printCheckAll: PropTypes.any,
    controlOption: PropTypes.any,
    changePrintVisible: PropTypes.any,
    hidePrintOptDialog: PropTypes.func,
    type: PropTypes.string,
    task: PropTypes.any,
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
        .forEach(item => {
          if (item && item.controlId) {
            controlOption.push(item.controlId);
          }
        });

      formControls.forEach(formControlItem => {
        if (formControlItem.tempControls.filter(item => item.needEvaluate).length > 0) {
          controlOption.push('formDetailEvaluate-' + formControlItem.formId);
        }
      });
    } else {
      controlOption = props.controlOption;
    }

    this.state = {
      controlOption,
      printCheckAll: this.props.printCheckAll !== false,
      reqInfo: props.reqInfo || {},
      task: props.task,
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

  renderTask() {
    const { task } = this.state;
    return (
      <div className="controlOption mBottom32">
        <span className="Block Font13 textTertiary mBottom16">{_l('任务')}</span>
        {task.map(item => (
          <Checkbox
            className="controlOptionItem mBottom15"
            key={item.key}
            checked={item.show}
            onChange={() => {
              this.toggleTaskCheckItem(item.key);
            }}
          >
            {item.name}
          </Checkbox>
        ))}
      </div>
    );
  }
  render() {
    const { type } = this.props;
    return (
      <Modal
        rootClassName="approvalPrintDialog"
        open={this.props.visible}
        mask={{ closable: false }}
        keyboard
        width={760}
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
            this.props.changePrintVisible(this.state.printCheckAll, this.state.controlOption);
          }

          if (type === 'task') {
            this.props.onUpdateTask(this.state.task);
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
            <span className="Block Font13 textTertiary mBottom16">{_l('自定义字段内容')}</span>
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
                    <Checkbox
                      className="controlOptionItem mBottom15"
                      key={index}
                      checked={this.state.controlOption.indexOf(item.controlId) > -1}
                      onChange={() => {
                        this.toggleCheckItem(item.controlId);
                      }}
                    >
                      {item.type === 22 ? (item.controlName ? item.controlName : _l('分段')) : item.controlName}
                    </Checkbox>
                  ),
              )}
            <div className="formDetailEvaluate">
              {this.state.reqInfo.formControls &&
                this.state.reqInfo.formControls.map(
                  (formControlItem, index) =>
                    formControlItem.tempControls.filter(item => item.needEvaluate).length > 0 &&
                    formControlItem.tempControls.filter(item => !item.printHide).length > 0 && (
                      <Checkbox
                        className="controlOptionItem mBottom15"
                        key={index}
                        checked={this.state.controlOption.indexOf('formDetailEvaluate-' + formControlItem.formId) > -1}
                        onChange={() => {
                          this.toggleCheckItem('formDetailEvaluate-' + formControlItem.formId);
                        }}
                      >
                        {this.state.reqInfo.controls.filter(item => item.controlId === formControlItem.formId).length >
                          0 &&
                          _l(
                            '%0统计',
                            this.state.reqInfo.controls.filter(item => item.controlId === formControlItem.formId)[0]
                              .controlName,
                          )}
                      </Checkbox>
                    ),
                )}
            </div>
          </div>
        )}
      </Modal>
    );
  }
}
