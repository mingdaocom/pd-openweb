import React, { Component } from 'react';
import { Modal } from 'ming-ui/antd-components';
import UploadFile from './UploadFile';
import './index.less';

const UPLOAD_MODAL_STYLES = {
  container: { height: 426 },
};

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
      <Modal
        width={544}
        styles={UPLOAD_MODAL_STYLES}
        title={_l('上传Excel文件')}
        open={visible}
        onCancel={() => this.props.onCancel()}
      >
        <UploadFile onCancel={this.props.onCancel} fileUploaded={this.fileUploaded} />
      </Modal>
    );
  }
}
