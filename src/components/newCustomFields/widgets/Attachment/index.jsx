import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { Icon } from 'ming-ui';
import UploadFiles from 'src/components/UploadFiles';
import UploadFilesTrigger from 'src/components/UploadFilesTrigger';
import cx from 'classnames';
import AttachmentFiles, { UploadFileWrapper } from 'src/pages/Mobile/Discuss/AttachmentFiles';
import { getAttachmentToList } from 'src/api/attachment';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { browserIsMobile } from 'src/util';

export default class Widgets extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    value: PropTypes.any,
    from: PropTypes.number,
    enumDefault2: PropTypes.number,
    onChange: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      loading: this.checkFileNeedLoad(props.value),
      temporaryAttachments: [],
      temporaryKnowledgeAtts: [],
      isComplete: null,
      uploadStart: false,
    };
  }

  componentDidMount() {
    if (this.state.loading) {
      this.loadAttachments();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      if (this.checkFileNeedLoad(nextProps.value)) {
        this.loadAttachments(nextProps);
      } else {
        this.setState({ value: nextProps.value });
      }
    }
  }

  checkFileNeedLoad(value) {
    if (!value) {
      return false;
    }
    try {
      const file = JSON.parse(value)[0];
      if (!file) {
        return false;
      } else {
        return file.fileId && !file.updateTime && !file.createUserName;
      }
    } catch (err) {}
    return false;
  }

  loadAttachments(props) {
    const { value } = props || this.props;
    let fileIds = [];
    try {
      fileIds = JSON.parse(value).map(f => f.fileId);
    } catch (err) {
      this.setState({ loading: false, value: '' });
    }
    const args = { fileIds };
    if (window.shareState && window.shareState.shareId) {
      args.shareId = window.shareState.shareId;
      args.type = window.shareState.isRecordShare ? 3 : window.shareState.isPublicQuery ? 11 : 14;
    }
    getAttachmentToList(args)
      .then(data => {
        this.setState({ loading: false, value: JSON.stringify(data) });
      })
      .fail(err => {
        this.setState({ loading: false, value: '' });
      });
  }

  id = +new Date();

  filesChanged = (files, key) => {
    const value = JSON.parse(this.state.value || '[]');
    const isArray = _.isArray(value);

    const newValue = {
      attachments: isArray ? [] : value.attachments,
      knowledgeAtts: isArray ? [] : value.knowledgeAtts,
      attachmentData: isArray ? value : value.attachmentData,
    };

    newValue[key] = files;
    this.props.onChange(
      newValue.attachments.length + newValue.knowledgeAtts.length + newValue.attachmentData.length === 0
        ? ''
        : JSON.stringify(newValue),
    );
  };

  /**
   * 清空临时存放的上传数据
   */
  onCancelTemporary = () => {
    this.setState({
      temporaryAttachments: [],
      temporaryKnowledgeAtts: [],
      isComplete: null,
      uploadStart: false,
    });
  };

  /**
   * 保存确认层的上传数据
   */
  onSaveTemporary = () => {
    const value = JSON.parse(this.state.value || '[]');
    const { temporaryAttachments, temporaryKnowledgeAtts, isComplete } = this.state;
    let attachments = [];
    let knowledgeAtts = [];

    if (!isComplete) {
      return;
    }

    if (!_.isArray(value)) {
      attachments = value.attachments;
      knowledgeAtts = value.knowledgeAtts;
    }

    new Promise(resolve => {
      temporaryAttachments.length && this.filesChanged(attachments.concat(temporaryAttachments), 'attachments');
      resolve();
    }).then(() => {
      temporaryKnowledgeAtts.length && this.filesChanged(knowledgeAtts.concat(temporaryKnowledgeAtts), 'knowledgeAtts');
      this.onCancelTemporary();
    });
  };

  /**
   * 获取上传组件的父级
   */
  getPopupContainer = () => {
    return $(this.fileBox).closest('.customFieldsContainer')[0];
  };

  render() {
    const {
      from,
      sheetSwitchPermit = [],
      strDefault = '10',
      projectId,
      viewIdForPermit = '',
      enumDefault2,
    } = this.props;
    let { disabled } = this.props;
    const isOnlyAllowMobile = strDefault.split('')[1] === '1';
    const { loading, value, temporaryAttachments, temporaryKnowledgeAtts, isComplete, uploadStart } = this.state;

    if (!value && isOnlyAllowMobile && !browserIsMobile()) {
      return (
        <div className={cx('customFormControlBox Gray_bd')}>
          <div className="Gray_9e" style={{ height: 34, lineHeight: '34px' }}>
            {_l('请在移动端拍摄后上传')}
          </div>
        </div>
      );
    }

    if (loading) {
      return null;
    }

    const $dom = $(`#UploadFilesTriggerPanel${this.id}`);
    let attachments;
    let knowledgeAtts;
    let attachmentData;

    if (value && _.isArray(JSON.parse(value))) {
      attachmentData = JSON.parse(value);
    } else {
      const data = JSON.parse(value || '{}');
      attachments = data.attachments;
      knowledgeAtts = data.knowledgeAtts;
      attachmentData = data.attachmentData;
    }

    if (browserIsMobile()) {
      return (
        <div
          className={cx('customFormControlBox customFormFileBox', { controlDisabled: disabled })}
          style={{ height: 'auto' }}
        >
          {!_.isEmpty(attachmentData) && (
            <AttachmentFiles
              from={from}
              width="49%"
              isRemove={!disabled}
              attachments={attachmentData || []}
              onChange={res => {
                this.filesChanged(res, 'attachmentData');
              }}
            />
          )}
          {!_.isEmpty(attachments) && (
            <AttachmentFiles
              from={from}
              width="49%"
              isRemove={true}
              attachments={attachments || []}
              onChange={res => {
                this.filesChanged(res, 'attachments');
              }}
            />
          )}
          {!disabled && (
            <UploadFileWrapper
              from={from}
              className="Block"
              inputType={enumDefault2}
              disabledGallery={strDefault.split('')[0] === '1'}
              files={attachments || []}
              onChange={(files, isComplete = false) => {
                this.setState({
                  isComplete,
                });
                this.filesChanged(files, 'attachments');
              }}
            >
              <Icon icon="attachment" />
              <span className="Gray_75 mLeft5">{_l('上传附件')}</span>
            </UploadFileWrapper>
          )}
        </div>
      );
    }
    // 下载附件权限
    const recordAttachmentSwitch = !!viewIdForPermit
      ? isOpenPermit(permitList.recordAttachmentSwitch, sheetSwitchPermit, viewIdForPermit)
      : true;
    let hideDownload = !recordAttachmentSwitch;

    disabled = disabled || isOnlyAllowMobile;

    return (
      <div
        className={cx('customFormControlBox', { controlDisabled: disabled })}
        style={{ height: 'auto' }}
        ref={fileBox => {
          this.fileBox = fileBox;
        }}
      >
        {!disabled && (
          <UploadFilesTrigger
            noTotal={!!(md.global.Account.projects && md.global.Account.projects.length)}
            id={this.id}
            from={from}
            projectId={projectId}
            offset={[-12, 2]}
            canAddLink={false}
            minWidth={130}
            showAttInfo={false}
            attachmentData={[]}
            onUploadComplete={isComplete => {
              this.setState({ isComplete }, () => {
                if (!$dom.is(':visible') && uploadStart) {
                  this.onSaveTemporary();
                }
              });

              setTimeout(() => this.setState({ uploadStart: true }), 200);
            }}
            temporaryData={temporaryAttachments}
            onTemporaryDataUpdate={res => this.setState({ temporaryAttachments: res })}
            kcAttachmentData={temporaryKnowledgeAtts}
            onKcAttachmentDataUpdate={res => this.setState({ temporaryKnowledgeAtts: res })}
            getPopupContainer={this.getPopupContainer}
            onCancel={this.onCancelTemporary}
            onOk={this.onSaveTemporary}
          >
            <div
              className="ThemeHoverColor3 pointer flexRow Font13 Gray_75"
              style={{ height: 34, alignItems: 'center' }}
            >
              <Icon icon="attachment" className="Font16" />
              <span className="mLeft5">{_l('添加附件')}</span>
              {isComplete === false && uploadStart && (
                <span className="mLeft5 ThemeColor3">
                  {_l(
                    '(%0/%1个附件上传中...)',
                    $dom.find('.UploadFiles-file-wrapper:not(.UploadFiles-fileEmpty)').length -
                      $dom.find('.Progress--circle').length,
                    $dom.find('.UploadFiles-file-wrapper:not(.UploadFiles-fileEmpty)').length,
                  )}
                </span>
              )}
            </div>
          </UploadFilesTrigger>
        )}

        <UploadFiles
          projectId={projectId}
          from={from}
          hideDownload={hideDownload}
          className="UploadFiles-exhibition"
          canAddLink={false}
          minWidth={130}
          showAttInfo={false}
          attachmentData={[]}
          onUploadComplete={isComplete => this.setState({ isComplete })}
          temporaryData={attachments || []}
          onTemporaryDataUpdate={res => this.filesChanged(res, 'attachments')}
          kcAttachmentData={knowledgeAtts || []}
          onKcAttachmentDataUpdate={res => this.filesChanged(res, 'knowledgeAtts')}
        />

        <UploadFiles
          projectId={projectId}
          hideDownload={hideDownload}
          from={from}
          isDeleteFile={!disabled}
          removeDeleteFilesFn={true}
          showAttInfo={false}
          isUpload={false}
          attachmentData={attachmentData || []}
          onDeleteAttachmentData={res => this.filesChanged(res, 'attachmentData')}
        />
      </div>
    );
  }
}
