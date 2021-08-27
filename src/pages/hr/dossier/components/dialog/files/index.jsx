import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Dialog from 'ming-ui/components/Dialog';
import LoadDiv from 'ming-ui/components/LoadDiv';
import UploadFiles from 'src/components/UploadFiles';
import { formatTemporaryData, formatKcAttachmentData } from 'src/components/UploadFiles/utils';

import ApiEmployee from '../../../api/employee';

class DialogFiles extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // 本地附件
      attachments: [],
      // 知识附件
      knowledgeAtt: [],
      // 已保存的附件
      attachmentData: [],
      /**
       * 是否显示文件上传控件
       */
      showUploader: false,
    };

    /**
     * 是否在上传状态
     */
    this.uploading = false;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.employeeId && nextProps.type && nextProps.visible) {
      const data = {
        // 本地附件
        attachments: [],
        // 知识附件
        knowledgeAtt: [],
        // 已保存的附件
        attachmentData: [],
      };

      const knowledgeAtt = [];
      const attachments = [];

      ApiEmployee.getEmployeeAttachment({
        employeeId: nextProps.employeeId,
        typeId: nextProps.type,
      }).then((res) => {
        res.data.map((_file, i, list) => {
          if (_file.refType) {
            knowledgeAtt.push(_file);
          } else {
            attachments.push(_file);
          }

          return null;
        });

        data.knowledgeAtt = knowledgeAtt;
        data.attachments = formatTemporaryData(attachments);

        data.showUploader = true;
        this.setState(data);
      });
    }
  }

  onOk = () => {
    if (!this.props.editable) {
      return;
    }

    if (this.uploading) {
      alert(_l('文件上传中，请稍候'), 2);
      return false;
    }

    ApiEmployee.addEmployeeAttachment({
      employeeId: this.props.employeeId,
      typeId: this.props.type,
      attachments: this.state.attachments,
      knowledgeAtt: this.state.knowledgeAtt,
    }).then(() => {
      const fileLength = this.state.attachments.length + this.state.knowledgeAtt.length;

      if (this.props.onOk) {
        this.props.onOk(fileLength);
      }
    });

    this.setState({
      showUploader: false,
    });
  };

  onCancel = () => {
    this.setState({
      attachments: [],
      knowledgeAtt: [],
      attachmentData: [],
      showUploader: false,
    });

    if (this.props.onCancel) {
      this.props.onCancel();
    }
  };

  /**
   * 上传状态发生变化
   */
  uploadStatuChanged = (done) => {
    this.uploading = !done;
  };

  /**
   * 上传文件发生变化
   */
  filesChanged = (files, key) => {
    const data = {
      attachments: this.state.attachments,
      knowledgeAtt: this.state.knowledgeAtt,
    };

    data[key] = files;

    if (this.props.limit) {
      const fileLength = data.attachments.length + data.knowledgeAtt.length;
      if (fileLength > this.props.limit) {
        alert(_l('文件数量不能大于') + ' ' + this.props.limit, 2);
        return;
      }
    }

    const newData = {};
    newData[key] = files;

    this.setState(newData);
  };

  render() {
    let uploader = <LoadDiv />;
    if (this.state.showUploader) {
      uploader = (
        <UploadFiles
          isUpload={this.props.editable}
          attachmentData={this.state.attachmentData}
          onUploadComplete={(done) => {
            this.uploadStatuChanged(done);
          }}
          temporaryData={this.state.attachments}
          onTemporaryDataUpdate={(res) => {
            this.filesChanged(res, 'attachments');
          }}
          kcAttachmentData={this.state.knowledgeAtt}
          onKcAttachmentDataUpdate={(res) => {
            this.filesChanged(res, 'knowledgeAtt');
          }}
        />
      );
    }
    return (
      <Dialog
        visible={this.props.visible}
        title={this.props.title}
        width="640"
        onOk={() => {
          this.onOk();
        }}
        onCancel={() => {
          this.onCancel();
        }}
      >
        <div>{uploader}</div>
      </Dialog>
    );
  }
}

DialogFiles.propTypes = {
  /**
   * 是否可见
   */
  visible: PropTypes.bool,
  /**
   * 是否为编辑模式
   */
  editable: PropTypes.bool,
  /**
   * 标题
   */
  title: PropTypes.string,
  /**
   * 附件类型
   */
  type: PropTypes.string,
  /**
   * 员工 ID
   */
  employeeId: PropTypes.string,
  /**
   * 数量限制
   */
  limit: PropTypes.number,
  /**
   * 【回调】确定
   */
  onOk: PropTypes.func,
  /**
   * 【回调】取消
   */
  onCancel: PropTypes.func,
};

DialogFiles.defaultProps = {
  visible: false,
  editable: true,
  title: '',
  type: '',
  employeeId: '',
  limit: 0,
  onOk: () => {
    //
  },
  onCancel: () => {
    //
  },
};

export default DialogFiles;
