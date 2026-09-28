import React, { Component } from 'react';
import { Icon } from 'ming-ui';
import { Input, Modal } from 'ming-ui/antd-components';

export default class RenameModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rename: props.rename,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.rename !== prevProps.rename) {
        this.setState({
          rename: this.props.rename,
        });
      }
    }
  }
  handleSave = () => {
    const { rename } = this.state;
    this.props.onChangeRename(rename);
    this.props.onHideDialogVisible(false);
  };
  render() {
    const { dialogVisible } = this.props;
    const { rename } = this.state;
    return (
      <Modal
        title={_l('重命名')}
        width={480}
        className="chartModal"
        open={dialogVisible}
        centered={true}
        closeIcon={<Icon icon="close" className="Font20 pointer textTertiary" />}
        onOk={this.handleSave}
        onCancel={() => {
          this.props.onHideDialogVisible(false);
        }}
      >
        <Input
          autoFocus={true}
          value={rename}
          onChange={event => {
            this.setState({
              rename: event.target.value,
            });
          }}
        />
      </Modal>
    );
  }
}
