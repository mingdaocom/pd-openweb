import React from 'react';
import { Input, Modal } from 'ming-ui/antd-components';

class DoubleConfirmDialog extends React.Component {
  state = {
    doubleConfirm: this.props.doubleConfirm || {
      confirmMsg: _l('你确认对记录执行此操作吗？'),
      cancelName: _l('取消'),
      sureName: _l('确认'),
    },
    showDoubleConfirmDialog: this.props.showDoubleConfirmDialog,
  };

  render() {
    return (
      <Modal
        title={_l('二次确认')}
        okText={_l('保存')}
        cancelText={_l('取消')}
        className="doubleConfirmDialog"
        width={560}
        onCancel={() => {
          this.props.setValue({
            ...this.props,
            showDoubleConfirmDialog: false,
          });
        }}
        onOk={() => {
          const { doubleConfirm = {} } = this.state;
          const { confirmMsg = '', sureName = '', cancelName = '' } = doubleConfirm;
          this.props.setValue({
            doubleConfirm: {
              confirmMsg: confirmMsg.trim(),
              sureName: sureName.trim(),
              cancelName: cancelName.trim(),
            },
            showDoubleConfirmDialog: false,
          });
        }}
        open={this.props.showDoubleConfirmDialog}
      >
        <p className="mTop10 mBottom10">{_l('提示文字')}</p>
        <textarea
          type="textarea"
          value={this.state.doubleConfirm.confirmMsg}
          onChange={event => {
            this.setState({
              doubleConfirm: {
                ...this.state.doubleConfirm,
                confirmMsg: event.target.value,
              },
            });
          }}
        />
        <p className="mTop10 mBottom10">{_l('确认按钮文字')}</p>
        <Input
          value={this.state.doubleConfirm.sureName}
          onChange={event => {
            this.setState({
              doubleConfirm: {
                ...this.state.doubleConfirm,
                sureName: event.target.value,
              },
            });
          }}
        />
        <p className="mTop10 mBottom10">{_l('取消按钮文字')}</p>
        <Input
          value={this.state.doubleConfirm.cancelName}
          onChange={event => {
            this.setState({
              doubleConfirm: {
                ...this.state.doubleConfirm,
                cancelName: event.target.value,
              },
            });
          }}
        />
      </Modal>
    );
  }
}

export default DoubleConfirmDialog;
