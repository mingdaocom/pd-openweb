import React, { Component } from 'react';
import { ConfigProvider, Modal, Button, Input } from 'antd';
import { Icon } from 'ming-ui';

export default class RenameModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rename: props.rename,
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.rename !== this.props.rename) {
      this.setState({
        rename: nextProps.rename
      });
    }
  }
  handleSave = () => {
    const { rename } = this.state;
    this.props.onChangeRename(rename);
    this.props.onHideDialogVisible(false);
  }
  renderFooter() {
    return (
      <div className="mTop20 mBottom10 pRight8">
        <ConfigProvider autoInsertSpaceInButton={false}>
          <Button type="link" onClick={() => { this.props.onHideDialogVisible(false) }}>{_l('取消')}</Button>
          <Button type="primary" onClick={this.handleSave}>{_l('确认')}</Button>
        </ConfigProvider>
      </div>
    );
  }
  render() {
    const { dialogVisible } = this.props;
    const { rename } = this.state;
    return (
      <Modal
        title={_l('重命名')}
        width={480}
        className="chartModal"
        visible={dialogVisible}
        destroyOnClose={true}
        centered={true}
        closeIcon={<Icon icon="close" className="Font20 pointer Gray_9e"/>}
        footer={this.renderFooter()}
        onCancel={() => {
          this.props.onHideDialogVisible(false);
        }}
      >
        <Input
          autoFocus={true}
          className="chartInput"
          value={rename}
          onChange={event => {
            this.setState({
              rename: event.target.value
            });
          }}
        />
      </Modal>
    );
  }
}
