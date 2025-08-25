import React, { Component } from 'react';
import { Dialog } from 'ming-ui';
import UploadFile from './UploadFile';
import './index.less';

export default class DialogUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  fileUploaded = file => {
    this.props.fileUploaded(file);
  };
  render() {
    const { visible } = this.props;
    return (
      <Dialog
        width={544}
        height={426}
        title={<span className="Bold">{_l('上传Excel文件')}</span>}
        visible={visible}
        footer={null}
        onCancel={() => this.props.onCancel()}
      >
        <UploadFile onCancel={this.props.onCancel} fileUploaded={this.fileUploaded} />
      </Dialog>
    );
  }
}
