import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { Icon } from 'ming-ui';
import { Tooltip } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import UploadFiles from 'src/components/UploadFiles';
import UploadFilesTrigger from 'src/components/UploadFilesTrigger';
import cx from 'classnames';
import { UploadFileWrapper } from 'mobile/Discuss/AttachmentFiles';
import { getRowGetType } from 'worksheet/util';
import Files from './Files';
import FileEditModal from './Files/FileEditModal';
import attachmentApi from 'src/api/attachment';
import downloadApi from 'src/api/download';
import worksheetApi from 'src/api/worksheet';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';
import './index.less';

const isMobile = browserIsMobile();

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
    const showtype = _.get(props, 'advancedSetting.showtype') || '1';
    this.state = {
      value: props.value,
      loading: this.checkFileNeedLoad(props.value),
      temporaryAttachments: [],
      temporaryKnowledgeAtts: [],
      isComplete: null,
      uploadStart: false,
      downloadAllLoading: false,
      fileEditModalVisible: false,
      showType: showtype === '0' ? '1' : showtype,
      filesVisible: true,
    };
  }

  componentDidMount() {
    if (this.state.loading) {
      this.loadAttachments();
    }
    if (_.get(this.props, 'advancedSetting.showtype') === '3') {
      this.detectionShowType();
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
    if (_.get(nextProps, 'advancedSetting.showtype') === '3' && nextProps.formWidth !== this.props.formWidth) {
      this.detectionShowType();
    }
  }

  detectionShowType = () => {
    this.setState({ filesVisible: false });
    setTimeout(() => {
      if (this.fileBox) {
        const { clientWidth } = this.fileBox;
        this.setState({ showType: clientWidth <= 560 ? '2' : '3', filesVisible: true });
      } else {
        this.setState({ filesVisible: true });
      }
    }, 0);
  };

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
      args.type = window.shareState.isPublicRecord
        ? 3
        : _.get(window, 'shareState.isPublicForm') || _.get(window, 'shareState.isPublicForm')
        ? 11
        : 14;
    }
    attachmentApi
      .getAttachmentToList(args)
      .then(data => {
        this.setState({ loading: false, value: JSON.stringify(data) });
      })
      .fail(err => {
        this.setState({ loading: false, value: '' });
      });
  }

  id = uuidv4();

  filesChanged = (files, key) => {
    const value = JSON.parse(this.state.value || '[]');
    const isArray = _.isArray(value);

    const newValue = {
      attachments: isArray ? [] : value.attachments,
      knowledgeAtts: isArray ? [] : value.knowledgeAtts,
      attachmentData: isArray ? value : value.attachmentData,
    };

    newValue[key] = files;

    // 补充 index
    if ([2, 3].includes(this.props.enumDefault)) {
      // 旧的在前
      newValue.attachmentData.forEach((data, index) => {
        data.index = index;
      });
      newValue.attachments.forEach((data, index) => {
        data.index = newValue.attachmentData.length + index;
      });
      newValue.knowledgeAtts.forEach((data, index) => {
        data.index = newValue.attachmentData.length + newValue.attachments.length + index;
      });
    } else {
      // 新的在前
      newValue.attachments.forEach((data, index) => {
        data.index = index;
      });
      newValue.knowledgeAtts.forEach((data, index) => {
        data.index = newValue.attachments.length + index;
      });
      newValue.attachmentData.forEach((data, index) => {
        data.index = newValue.attachments.length + newValue.knowledgeAtts.length + index;
      });
    }

    this.props.onChange(
      newValue.attachments.length + newValue.knowledgeAtts.length + newValue.attachmentData.length === 0
        ? ''
        : JSON.stringify(newValue),
    );
  };

  filesChangedAll = files => {
    const value = JSON.parse(this.state.value || '[]');
    const { attachments, knowledgeAtts, attachmentData } = files;
    const newValue = {};

    newValue.attachments = attachments;
    newValue.knowledgeAtts = knowledgeAtts;
    newValue.attachmentData = attachmentData;

    this.props.onChange(
      newValue.attachments.length + newValue.knowledgeAtts.length + newValue.attachmentData.length === 0
        ? ''
        : JSON.stringify(newValue),
    );
  };

  /**
   * 排序明道附件
   */
  handleSortAttachment = attachmentData => {
    const { worksheetId, viewId, recordId, controlId } = this.props;
    const value = JSON.parse(this.state.value || '[]');
    worksheetApi
      .sortAttachment({
        worksheetId,
        viewId,
        rowId: recordId,
        controlId,
        fileIds: attachmentData.map(f => f.fileID),
      })
      .then(data => {
        if (data.resultCode === 1) {
          const newValue = {
            attachmentData,
            attachments: value.attachments || [],
            knowledgeAtts: value.knowledgeAtts || [],
          };
          this.setState({
            value: JSON.stringify(newValue),
          });
        }
      });
  };

  /**
   * 编辑明道附件名称
   */

  handleAttachmentName = (id, newName, data) => {
    const value = JSON.parse(this.state.value || '[]');
    const isArray = _.isArray(value);

    const newValue = {
      attachments: isArray ? [] : value.attachments,
      knowledgeAtts: isArray ? [] : value.knowledgeAtts,
      attachmentData: isArray ? value : value.attachmentData,
    };

    const files = newValue.attachmentData.map(item => {
      if (item.fileID === id) {
        item.originalFilename = newName;
      }
      return item;
    });

    newValue.attachmentData = files;

    this.setState({
      value: JSON.stringify(newValue),
    });

    const { appId, worksheetId, viewId, recordId, controlId, from } = this.props;

    worksheetApi
      .editAttachmentName({
        ...data,
        fileId: id,
        fileName: newName,
        appId,
        worksheetId,
        viewId,
        controlId,
        rowId: recordId,
        checkView: true,
        getType: getRowGetType(from),
      })
      .then(data => {
        if (data.resultCode !== 1) {
          alert(_l('修改失败'), 2);
        }
      });
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

  handleDownloadAll = () => {
    const { downloadAllLoading } = this.state;
    const { appId, worksheetId, viewId, recordId, controlId, from } = this.props;

    if (downloadAllLoading) return;

    this.setState({ downloadAllLoading: true });
    downloadApi
      .rowAttachments({
        appId,
        worksheetId,
        viewId,
        rowId: recordId,
        controlId,
        checkView: true,
        getType: from === 21 ? from : 1,
      })
      .always(() => {
        this.setState({ downloadAllLoading: false });
      });
  };

  render() {
    const {
      from,
      appId,
      worksheetId,
      recordId,
      sheetSwitchPermit = [],
      strDefault = '10',
      controlId,
      projectId,
      viewIdForPermit = '',
      enumDefault,
      enumDefault2,
      advancedSetting,
      isSubList,
      disabled,
      hint,
      flag,
    } = this.props;
    const isOnlyAllowMobile = strDefault.split('')[1] === '1';
    const {
      loading,
      value,
      showType,
      temporaryAttachments,
      temporaryKnowledgeAtts,
      isComplete,
      uploadStart,
      filesVisible,
      fileEditModalVisible,
    } = this.state;
    const pcDisabled = disabled || isOnlyAllowMobile;
    const mobileDisabled = disabled;
    const addFileName = hint || _l('添加附件');

    if (!value && isOnlyAllowMobile && !isMobile) {
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
    let attachments = [];
    let knowledgeAtts = [];
    let attachmentData = [];

    if (value && _.isArray(JSON.parse(value))) {
      attachmentData = JSON.parse(value);
    } else {
      const data = JSON.parse(value || '{}');
      attachments = data.attachments || [];
      knowledgeAtts = data.knowledgeAtts || [];
      attachmentData = data.attachmentData || [];
    }

    // 已上传附件总数
    const originCount = attachments.length + knowledgeAtts.length + attachmentData.length;

    // 下载附件权限
    const recordAttachmentSwitch = isOpenPermit(permitList.recordAttachmentSwitch, sheetSwitchPermit, viewIdForPermit);

    const coverType = advancedSetting.covertype || '0';
    const allAownload =
      advancedSetting.alldownload !== '0' && recordAttachmentSwitch && !_.get(window, 'shareState.shareId');

    const filesProps = {
      flag,
      showType,
      coverType,
      controlId,
      viewMore: !!recordId,
      allowDownload: !!_.get(window, 'shareState.shareId') || recordAttachmentSwitch,
      allowSort: enumDefault === 3 && (isMobile ? false : !pcDisabled),
      allowEditName: isMobile ? false : !pcDisabled,
      attachments,
      knowledgeAtts,
      attachmentData,
      onSortAttachment: this.handleSortAttachment,
      onAttachmentName: this.handleAttachmentName,
      onChangedAllFiles: this.filesChangedAll,
      onChangeAttachments: res => this.filesChanged(res, 'attachments'),
      onChangeKnowledgeAtts: res => this.filesChanged(res, 'knowledgeAtts'),
      onChangeAttachmentData: res => this.filesChanged(res, 'attachmentData'),
    };

    if (isMobile) {
      return (
        <div
          className={cx('customFormFileBox customFormAttachmentBox', { controlDisabled: mobileDisabled })}
          style={{ height: 'auto' }}
        >
          {!mobileDisabled && (
            <div className="triggerTraget mobile" style={{ height: 34 }}>
              <UploadFileWrapper
                from={from}
                projectId={projectId}
                appId={appId}
                worksheetId={worksheetId}
                className="Block"
                inputType={enumDefault2}
                advancedSetting={advancedSetting}
                originCount={originCount}
                disabledGallery={strDefault.split('')[0] === '1'}
                files={attachments || []}
                onChange={(files, isComplete = false) => {
                  this.setState({
                    isComplete,
                    uploadStart: isComplete ? false : true,
                  });
                  this.filesChanged(files, 'attachments');
                }}
                ref={mobileFileBox => {
                  this.mobileFileBox = mobileFileBox;
                }}
              >
                <Icon className="Gray_9e" icon="attachment" />
                <span className="Gray Font13 mLeft5 addFileName overflow_ellipsis">{addFileName}</span>
                {isComplete === false && uploadStart && <span className="mLeft5 ThemeColor3 fileUpdateLoading"></span>}
              </UploadFileWrapper>
            </div>
          )}
          <Files
            {...filesProps}
            showType={['3'].includes(showType) ? '2' : !disabled && showType === '4' ? '1' : showType}
            isDeleteFile={!mobileDisabled}
            from={from}
            removeUploadingFile={data => {
              if (this.mobileFileBox) {
                this.setState({ isComplete: true });
                this.mobileFileBox.currentFile.removeFile({ id: data.id });
                this.filesChanged(
                  attachments.filter(item => item.id !== data.id),
                  'attachments',
                );
              }
            }}
          />
        </div>
      );
    }

    return (
      <div
        className={cx('customFormControlBox customFormControlScore customFormAttachmentBox', {
          controlDisabled: pcDisabled,
        })}
        style={{ height: 'auto' }}
        ref={fileBox => {
          this.fileBox = fileBox;
        }}
      >
        <div className="flexRow valignWrapper spaceBetween">
          {!pcDisabled ? (
            <UploadFilesTrigger
              noTotal={!!(md.global.Account.projects && md.global.Account.projects.length)}
              id={this.id}
              from={from}
              projectId={projectId}
              appId={appId}
              worksheetId={worksheetId}
              offset={[0, 2]}
              canAddLink={false}
              minWidth={130}
              showAttInfo={false}
              advancedSetting={advancedSetting}
              originCount={originCount}
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
              <div className="pointer flexRow Font13 Gray_9e alignItemsCenter" style={{ height: 34 }}>
                <Icon icon="attachment" className="Font16" />
                <span className="mLeft5 Gray addFileName overflow_ellipsis">{addFileName}</span>
                {isComplete === false && uploadStart && (
                  <span className="mLeft5 ThemeColor3 fileUpdateLoading">
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
          ) : (
            <div className="flex" />
          )}
          <div className="valignWrapper">
            {showType === '4' && (
              <Fragment>
                <Tooltip title={_l('管理附件')} placement="bottom">
                  <Icon
                    className="handleBtn Gray_9e Font18 pointer"
                    icon="application_custom"
                    onClick={() => this.setState({ fileEditModalVisible: true })}
                  />
                </Tooltip>
                <FileEditModal
                  visible={fileEditModalVisible}
                  onCancel={() => this.setState({ fileEditModalVisible: false })}
                  filesProps={filesProps}
                  pcDisabled={pcDisabled}
                  from={from}
                />
              </Fragment>
            )}
            {allAownload && !_.isEmpty(attachmentData) && (
              <div className="flexRow valignWrapper">
                <Tooltip title={_l('全部下载')} placement="bottom">
                  <Icon className="handleBtn Gray_9e Font18 pointer" icon="download" onClick={this.handleDownloadAll} />
                </Tooltip>
              </div>
            )}
          </div>
        </div>
        {filesVisible && <Files {...filesProps} isDeleteFile={!pcDisabled} from={from} />}
      </div>
    );
  }
}
