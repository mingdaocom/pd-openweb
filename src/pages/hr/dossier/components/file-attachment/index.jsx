import PropTypes from 'prop-types';
import React, { Component } from 'react';

import UploadFiles from 'src/components/UploadFiles';
import UploadFilesTrigger from 'src/components/UploadFilesTrigger';
import { FormError } from '../lib';
import Icon from 'ming-ui/components/Icon';
import Button from 'ming-ui/components/Button';
import cx from 'classnames';
import './style.less';

class FileAttachment extends Component {
  constructor(props) {
    super(props);

    const files = this.parseFiles(props.value);

    this.state = {
      // 本地附件
      attachments: props.value.attachments || [],
      // 知识附件
      knowledgeAtts: props.value.knowledgeAtts || [],
      // 已保存的附件
      attachmentData: props.value.attachmentData || [],
      temporaryAttachments: [],
      temporaryKnowledgeAtts: [],
      // value error
      error: false,
      // dirty
      dirty: false,
      // show error
      showError: false,
      // 上传状态
      isComplete: false,
    };
  }

  componentDidMount() {
    // check init value
    this.checkValue(this.props.value);
  }

  componentWillReceiveProps(nextProps) {
    const fileData = {
      attachments: this.state.attachments,
      knowledgeAtts: this.state.knowledgeAtts,
      attachmentData: this.state.attachmentData,
    };
    if (!_.isEqual(fileData, nextProps.value) && nextProps.showError !== this.props.showError) {
      this.setState({
        attachments: nextProps.value.attachments || [],
        knowledgeAtts: nextProps.value.knowledgeAtts || [],
        attachmentData: nextProps.value.attachmentData || [],
        showError: this.state.dirty || nextProps.showError,
      });
    } else if (!_.isEqual(fileData, nextProps.value)) {
      this.setState({
        attachments: nextProps.value.attachments || [],
        knowledgeAtts: nextProps.value.knowledgeAtts || [],
        attachmentData: nextProps.value.attachmentData || [],
      });
    } else if (nextProps.showError !== this.props.showError) {
      this.setState({
        showError: this.state.dirty || nextProps.showError,
      });
    }
  }

  parseFiles = (value) => {
    const data = {
      // 本地附件
      attachments: [],
      // 知识附件
      knowledgeAtts: [],
      // 已保存的附件
      attachmentData: [],
    };

    if (value && value.map) {
      value.map((_file, i, list) => {
        if (_file.refType) {
          data.knowledgeAtts.push(_file);
        } else {
          data.attachments.push(_file);
        }

        data.attachmentData.push(_file);

        return null;
      });
    }

    return data;
  };

  uploadStatuChanged = (done) => {
    this.setState({ isComplete: done });
  };

  filesChanged = (files, key, event) => {
    const data = {};
    data[key] = files;

    const newValue = {
      attachments: this.state.attachments || [],
      knowledgeAtts: this.state.knowledgeAtts || [],
      attachmentData: this.state.attachmentData || [],
    };
    newValue[key] = files;

    this.checkValue(newValue, true);

    this.setState(data);

    if (this.props.onChange) {
      // fire onChange callback
      this.props.onChange(event, newValue, {
        prevValue: {
          attachments: this.state.attachments || [],
          knowledgeAtts: this.state.knowledgeAtts || [],
          attachmentData: this.state.attachmentData || [],
        },
      });
    }
  };

  /**
   * check value
   * @param {object} data - data
   * @param {bool} dirty - value ever changed
   */
  checkValue = (data, dirty) => {
    const error = {
      type: '',
      message: '',
      dirty,
    };
    // required
    if (
      this.props.required &&
      (!data.attachments || !data.attachments.length) &&
      (!data.knowledgeAtts || !data.knowledgeAtts.length) &&
      (!data.attachmentData || !data.attachmentData.length)
    ) {
      error.type = FormError.types.REQUIRED;
    }

    if (error.type) {
      // fire onError callback
      if (this.props.onError) {
        this.props.onError(error);
      }
    } else if (this.props.onValid) {
      // fire onValid callback
      this.props.onValid();
    }

    // update state.error
    this.setState({
      error: !!error.type,
      dirty,
      showError: dirty || this.props.showError,
    });
  };

  /**
   * 取消
   */
  onCancel = () => {
    const newValue = {
      attachments: [],
      knowledgeAtts: [],
      attachmentData: this.state.attachmentData,
    };

    this.setState(newValue);

    if (this.props.onChange) {
      this.props.onChange(event, newValue, {
        prevValue: newValue,
      });
    }
  }

  /**
   * 保存
   */
  onSave = () => {
    const { attachments, knowledgeAtts, isComplete } = this.state;

    if (!isComplete) {
      alert(_l('文件上传中，请稍候'), 3);
      return;
    }

    this.props.onSave({
      attachments,
      knowledgeAtts,
    });
  }

  /**
   * 清空临时存放的上传数据
   */
  onCancelTemporary = () => {
    this.setState({
      temporaryAttachments: [],
      temporaryKnowledgeAtts: [],
    });
  }

  /**
   * 保存确认层的上传数据
   */
  onSaveTemporary = () => {
    const { attachments, knowledgeAtts, temporaryAttachments, temporaryKnowledgeAtts } = this.state;
    new Promise((resolve) => {
      temporaryAttachments.length && this.filesChanged(attachments.concat(temporaryAttachments), 'attachments');
      resolve();
    }).then(() => {
      temporaryKnowledgeAtts.length && this.filesChanged(knowledgeAtts.concat(temporaryKnowledgeAtts), 'knowledgeAtts');
      this.onCancelTemporary();
    });
  }

  /**
   * 获取不同模块下上传组件的父级
   */
  getPopupContainer = () => {
    let { moduleType } = this.props;
    let popupContainerEl = null;
    if (moduleType === 'task') {
      popupContainerEl = document.querySelector('.taskDetailContent .nano-content');
    } else if (moduleType === 'workSheet' || moduleType === 'workflow') {
      popupContainerEl = $(this.filecon).closest('.mui-formcontainer')[0];
    }
    return popupContainerEl || document.querySelector('body');
  }

  render() {
    const { temporaryAttachments, temporaryKnowledgeAtts, attachments, knowledgeAtts, attachmentData } = this.state;
    const { moduleType } = this.props;
    return (
      <div className={cx('mui-fileattachment', { 'mui-fileattachment-top': this.props.disabled, 'disabled': this.props.disabled })} ref={filecon => (this.filecon = filecon)}>
        {
          moduleType === 'task' ? (
            <UploadFilesTrigger
              canAddLink={!moduleType === 'workSheet'}
              minWidth={130}
              isUpload={!this.props.disabled}
              showAttInfo={false}
              attachmentData={[]}
              onUploadComplete={(done) => {
                this.uploadStatuChanged(done);
              }}
              temporaryData={attachments}
              onTemporaryDataUpdate={(res) => {
                this.filesChanged(res, 'attachments');
              }}
              kcAttachmentData={knowledgeAtts}
              onKcAttachmentDataUpdate={(res) => {
                this.filesChanged(res, 'knowledgeAtts');
              }}
              getPopupContainer={this.getPopupContainer}
              onCancel={this.onCancel}
              onOk={this.onSave}
            >
              {!this.props.disabled && (
                <div className="ThemeHoverColor3 pointer mTop10 mBottom10 Font13 Gray_75">
                  <Icon icon="attachment" className="Font17"/>
                  <span className="mLeft5">{_l('添加附件')}</span>
                </div>
              )}
            </UploadFilesTrigger>
          ) : (
            <div>
              <UploadFilesTrigger
                canAddLink={!moduleType === 'workSheet'}
                minWidth={130}
                isUpload={!this.props.disabled}
                showAttInfo={false}
                attachmentData={[]}
                onUploadComplete={(done) => {
                  this.uploadStatuChanged(done);
                }}
                temporaryData={temporaryAttachments}
                onTemporaryDataUpdate={(res) => {
                  this.setState({
                    temporaryAttachments: res,
                  });
                }}
                kcAttachmentData={temporaryKnowledgeAtts}
                onKcAttachmentDataUpdate={(res) => {
                  this.setState({
                    temporaryKnowledgeAtts: res,
                  });
                }}
                getPopupContainer={this.getPopupContainer}
                onCancel={this.onCancelTemporary}
                onOk={this.onSaveTemporary}
              >
                {
                  !this.props.disabled && (
                    <div className="ThemeHoverColor3 pointer mTop10 mBottom10 Font13 Gray_75">
                      <Icon icon="attachment" className="Font17"/>
                      <span className="mLeft5">{_l('添加附件')}</span>
                    </div>
                  )
                }
              </UploadFilesTrigger>
              <UploadFiles
                className="UploadFiles-exhibition"
                canAddLink={!moduleType === 'workSheet'}
                minWidth={130}
                isUpload={!this.props.disabled}
                showAttInfo={false}
                attachmentData={[]}
                onUploadComplete={(done) => {
                  this.uploadStatuChanged(done);
                }}
                temporaryData={attachments}
                onTemporaryDataUpdate={(res) => {
                  this.filesChanged(res, 'attachments');
                }}
                kcAttachmentData={knowledgeAtts}
                onKcAttachmentDataUpdate={(res) => {
                  this.filesChanged(res, 'knowledgeAtts');
                }}
              />
            </div>
          )
        }

        <UploadFiles
          isDeleteFile
          showAttInfo={false}
          isUpload={false}
          attachmentData={attachmentData}
          onDeleteAttachmentData={(res) => {
            this.filesChanged(res, 'attachmentData');
          }}
        />
      </div>
    );
  }
}

FileAttachment.propTypes = {
  /**
   * 当前附件列表
   */
  value: PropTypes.any,
  /**
   * 是否必填
   */
  required: PropTypes.bool,
  /**
   * 是否禁用
   */
  disabled: PropTypes.bool,
  /**
   * 显示错误（忽略 error.dirty）
   */
  showError: PropTypes.bool,
  /**
   * 【回调】内容发生改变
   * @param {Event} event - 触发事件
   * @param {string} value - 当前值
   * @param {object} data - 其他数据
   * data.prevValue - 之前的值
   */
  onChange: PropTypes.func,
  /**
   * 【回调】发生错误
   * @param {Error} error - 错误
   * error.type - 错误类型
   * error.dirty - 值是否发生过改变
   */
  onError: PropTypes.func,
  /**
   * 【回调】值有效（与 onError 相反）
   */
  onValid: PropTypes.func,
  onSave: PropTypes.func,
};

FileAttachment.defaultProps = {
  value: [],
  required: false,
  disabled: false,
  showError: false,
  onChange: (event, prevValue, currentValue) => {
    //
  },
  onError: (error) => {
    //
  },
  onValid: () => {
    //
  },
  onSave: (value) => {},
};

export default FileAttachment;
