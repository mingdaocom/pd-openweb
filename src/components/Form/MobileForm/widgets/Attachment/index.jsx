import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { Icon } from 'ming-ui';
import attachmentApi from 'src/api/attachment';
import worksheetApi from 'src/api/worksheet';
import { UploadFileWrapper } from 'mobile/components/AttachmentFiles';
import { getRowGetType } from 'src/utils/common';
import RegExpValidator from 'src/utils/expression';
import { compatibleMDJS } from 'src/utils/project';
import Files from '../../../components/Files';
import { permitList } from '../../../core/enum';
import { checkValueByFilterRegex, controlState } from '../../../core/formUtils';
import { isOpenPermit } from '../../tools/utils';
import './index.less';

export default class Widgets extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    advancedSetting: PropTypes.object,
    flag: PropTypes.string,
    value: PropTypes.any,
    from: PropTypes.number,
    projectId: PropTypes.string,
    appId: PropTypes.string,
    worksheetId: PropTypes.string,
    viewId: PropTypes.string,
    recordId: PropTypes.string,
    controlId: PropTypes.string,
    controlName: PropTypes.string,
    isDraft: PropTypes.bool,
    formData: PropTypes.array,
    enumDefault: PropTypes.number,
    enumDefault2: PropTypes.number,
    strDefault: PropTypes.string,
    hint: PropTypes.string,
    otherSheetControlType: PropTypes.number,
    onChange: PropTypes.func,
  };

  constructor(props) {
    super(props);
    const showtype = _.get(props, 'advancedSetting.showtype') || '1';
    this.state = {
      value: props.value,
      loading: this.checkFileNeedLoad(props.value),
      isComplete: null,
      uploadStart: false,
      downloadAllLoading: false,
      showType: showtype === '0' ? '1' : showtype,
      mingdaoAppUploading: 0,
      mingdaoAppError: 0,
      mobileFiles: [],
      mobileCameraFiles: [],
      mobileCamcorderFiles: [],
    };
    this.mobileFileRef = {};
  }

  componentDidMount() {
    if (this.state.loading) {
      this.loadAttachments();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      if (this.props.flag !== nextProps.flag) {
        const initMobileFiles = { mobileFiles: [], mobileCamcorderFiles: [], mobileCameraFiles: [] };
        this.setState({ value: nextProps.value, ...initMobileFiles });
      }
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
    const { value, worksheetId, recordId, controlId, isDraft } = props || this.props;
    let fileIds = [];
    try {
      fileIds = JSON.parse(value).map(f => f.fileId);
    } catch (err) {
      this.setState({ loading: false, value: '' });
    }
    const args = { fileIds, worksheetId, rowId: recordId, controlId };
    if (window.shareState && window.shareState.shareId) {
      args.shareId = window.shareState.shareId;
      args.type = window.shareState.isPublicRecord
        ? 3
        : _.get(window, 'shareState.isPublicForm') || _.get(window, 'shareState.isPublicForm')
          ? 11
          : 14;
    }
    if (isDraft) {
      args.type = 21;
    }
    attachmentApi
      .getAttachmentToList(args)
      .then(data => {
        this.setState({ loading: false, value: JSON.stringify(data) });
      })
      .catch(err => {
        this.setState({ loading: false, value: '' });
      });
  }

  id = uuidv4();

  filesChanged = (files, key) => {
    const enumDefault = this.props.enumDefault || 3;
    const value = JSON.parse(this.state.value || '[]');
    const isArray = _.isArray(value);

    const newValue = {
      attachments: isArray ? [] : value.attachments,
      knowledgeAtts: isArray ? [] : value.knowledgeAtts,
      attachmentData: isArray ? value : value.attachmentData,
    };

    newValue[key] = files;

    // 补充 index
    if ([2, 3].includes(enumDefault)) {
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

  checkValueByFilterRegex = name => {
    const { advancedSetting, formData, recordId } = this.props;
    return checkValueByFilterRegex({ advancedSetting }, RegExpValidator.getNameOfFileName(name), formData, recordId);
  };

  /**
   * 编辑明道附件名称
   */

  handleAttachmentName = (id, newName, data) => {
    const value = JSON.parse(this.state.value || '[]');
    const isArray = _.isArray(value);
    const error = this.checkValueByFilterRegex(newName);

    if (error) {
      alert(error, 2);
      return;
    }

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
        getType: data.workId ? 9 : getRowGetType(from),
      })
      .then(data => {
        if (data.resultCode !== 1) {
          alert(_l('修改失败'), 2);
        }
      });
  };

  mingDaoAppChooseImage = () => {
    const { mingdaoAppError } = this.state;
    const { projectId, appId, worksheetId, controlId, formData, advancedSetting } = this.props;
    const control = _.find(formData, { controlId }) || {};
    let h5watermark = '';
    if (!mingdaoAppError && advancedSetting.h5watermark) {
      const h5watermarkArr = advancedSetting.h5watermark.split('$');
      const data = formData.filter(v => _.includes([2, 3, 4, 5, 6, 8, 15, 16, 46], v.type));

      h5watermark = h5watermarkArr
        .map(item => {
          const c = _.find(data, v => v.controlId === item);
          return _.includes(['user', 'time', 'address', 'xy'], item) ? `$${item}$` : c ? c.value : item;
        })
        .join('');
    }

    compatibleMDJS(
      mingdaoAppError ? 'showUploadingImage' : 'chooseImage',
      mingdaoAppError
        ? {
            sessionId: this.sessionId,
          }
        : {
            sessionId: this.sessionId,
            knowledge: false,
            worksheetId,
            appId,
            projectId,
            control,
            watermark: advancedSetting.watermark,
            h5watermark,
            checkValueByFilterRegex: this.checkValueByFilterRegex,
            success: res => {
              // 传入的sessionId 为空时, 由App随机生成, 每个sessionId 对应App中一个文件管理器
              this.sessionId = res.sessionId;
              const { error, uploading, completed } = res;
              // 上传中数量
              this.setState({ mingdaoAppUploading: uploading });
              // 出错数量
              this.setState({ mingdaoAppError: error });
              // 有成功上传的文件就会返回
              if (completed) {
                this.setState(
                  {
                    mobileFiles: _.uniqBy(this.state.mobileFiles.concat(completed), 'fileName'),
                  },
                  () => {
                    this.handleMobileChangeFiles();
                  },
                );
              }
            },
            cancel: function (res) {},
          },
    );
  };

  handleMobileChangeFiles = () => {
    const { mobileFiles, mobileCameraFiles, mobileCamcorderFiles } = this.state;
    const value = JSON.parse(this.state.value || '[]');
    const isArray = _.isArray(value);
    const attachments = isArray ? [] : value.attachments;
    const files = [...mobileFiles, ...mobileCameraFiles, ...mobileCamcorderFiles, ...attachments];
    if (!files.length) return;
    this.filesChanged(_.uniqBy(files, 'fileID'), 'attachments');
  };

  handleCheckMobileFiles = deletedFile => {
    if (deletedFile) {
      this.setState({
        mobileFiles: this.state.mobileFiles.filter(n =>
          n.progress ? n.id !== deletedFile.id : n.fileID !== deletedFile.fileID,
        ),
        mobileCameraFiles: this.state.mobileCameraFiles.filter(n =>
          n.progress ? n.id !== deletedFile.id : n.fileID !== deletedFile.fileID,
        ),
        mobileCamcorderFiles: this.state.mobileCamcorderFiles.filter(n =>
          n.progress ? n.id !== deletedFile.id : n.fileID !== deletedFile.fileID,
        ),
      });
    }
  };

  renderMobileUploadTrigger = ({
    className,
    originCount,
    customHint,
    customUploadType,
    icon,
    iconClass,
    styles = {},
    type,
  }) => {
    const { from, appId, worksheetId, projectId, enumDefault2, advancedSetting, strDefault = '10', hint } = this.props;
    const { isComplete, uploadStart, mingdaoAppUploading, mingdaoAppError } = this.state;
    const addFileName = customHint ? customHint : hint || _l('添加附件');

    const Content = (
      <Fragment>
        <Icon className={cx('Gray_9e TxtMiddle', { iconClass })} icon={icon ? icon : 'attachment'} />
        <span className="Gray Font13 mLeft5 addFileName overflow_ellipsis flex">{addFileName}</span>
        {!!mingdaoAppUploading && (
          <span className="mLeft5 ThemeColor3 fileUpdateLoading Font13">
            {_l('%0个附件正在上传', mingdaoAppUploading)}
          </span>
        )}
        {!!mingdaoAppError && (
          <span className="mLeft5 Red fileUpdateLoading Font13">{_l('%0个附件上传失败', mingdaoAppError)}</span>
        )}
        {isComplete === false && uploadStart && <span className="mLeft5 ThemeColor3 fileUpdateLoading"></span>}
      </Fragment>
    );

    if (window.isMingDaoApp) {
      return (
        <div
          className={cx('triggerTraget mobile', className)}
          style={{ height: 40, ...styles }}
          onClick={this.mingDaoAppChooseImage}
        >
          {Content}
        </div>
      );
    }

    return (
      <div className={cx('triggerTraget mobile', className)} style={{ height: 40, ...styles }}>
        <UploadFileWrapper
          controlName={this.props.controlName}
          customUploadType={customUploadType}
          from={from}
          projectId={projectId}
          appId={appId}
          worksheetId={worksheetId}
          className="flexRow alignItemsCenter"
          inputType={enumDefault2}
          advancedSetting={advancedSetting}
          originCount={originCount}
          disabledGallery={strDefault.split('')[0] === '1'}
          files={[]}
          formData={this.props.formData}
          onChange={(files, isComplete = false) => {
            this.setState({
              isComplete,
              uploadStart: isComplete ? false : true,
            });
            if (type === 'file') {
              this.setState(
                {
                  mobileFiles: _.uniqBy(
                    [...this.state.mobileFiles, ...files].filter(n => !('progress' in n)),
                    'fileName',
                  ),
                },
                () => {
                  this.handleMobileChangeFiles();
                },
              );
            }
            if (type === 'camera') {
              this.setState(
                {
                  mobileCameraFiles: _.uniqBy(
                    [...this.state.mobileCameraFiles, ...files].filter(n => !('progress' in n)),
                    'fileName',
                  ),
                },
                () => {
                  this.handleMobileChangeFiles();
                },
              );
            }
            if (type === 'camcorder') {
              this.setState(
                {
                  mobileCamcorderFiles: _.uniqBy(
                    [...this.state.mobileCamcorderFiles, ...files].filter(n => !('progress' in n)),
                    'fileName',
                  ),
                },
                () => {
                  this.handleMobileChangeFiles();
                },
              );
            }
            if (isComplete) {
              this.mobileFileRef[type].setState({
                files: [],
              });
            }
          }}
          ref={mobileFileRef => {
            this.mobileFileRef[type] = mobileFileRef;
          }}
          checkValueByFilterRegex={this.checkValueByFilterRegex}
        >
          {Content}
        </UploadFileWrapper>
      </div>
    );
  };

  render() {
    const {
      from,
      worksheetId,
      recordId,
      sheetSwitchPermit = [],
      strDefault = '10',
      controlId,
      otherSheetControlType,
      projectId,
      viewIdForPermit = '',
      enumDefault2,
      advancedSetting,
      disabled,
      flag,
      masterData,
      isDraft,
      sourceControlId,
    } = this.props;
    const { loading, value, showType } = this.state;
    const allowUpload = (advancedSetting.allowupload || '1') === '1';
    const allowDelete = (advancedSetting.allowdelete || '1') === '1';
    const allowDownload = (advancedSetting.allowdownload || '1') === '1';
    const mobileDisabled = !allowUpload || disabled;

    if (loading) {
      return null;
    }

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

    const filesProps = {
      recordBaseInfo: {
        worksheetId,
        recordId,
      },
      flag,
      projectId,
      showType,
      coverType,
      controlId,
      sourceControlId,
      controlType: otherSheetControlType,
      viewMore: !!recordId,
      allowDownload: allowDownload && (!!_.get(window, 'shareState.shareId') || recordAttachmentSwitch),
      allowShare: allowDownload && !_.get(window, 'shareState.shareId') && !md.global.Account.isPortal,
      allowSort: false,
      allowEditName: allowUpload && controlState(this.props, from).editable && !_.get(window, 'shareState.shareId'),
      allowEditOnline: controlState(this.props, from).editable,
      isDraft,
      masterData,
      advancedSetting,
      attachments,
      knowledgeAtts,
      attachmentData,
      checkValueByFilterRegex: this.checkValueByFilterRegex,
      onAttachmentName: this.handleAttachmentName,
      onChangedAllFiles: this.filesChangedAll,
      onChangeAttachments: res => this.filesChanged(res, 'attachments'),
      onChangeKnowledgeAtts: res => this.filesChanged(res, 'knowledgeAtts'),
      onChangeAttachmentData: res => this.filesChanged(res, 'attachmentData'),
      onRemoveFile: file => {
        this.handleCheckMobileFiles(file);
      },
    };

    const disabledGallery = strDefault.split('')[0] === '1'; // 禁用相册
    const showFile = !disabledGallery;
    const showCamera = _.includes([1, 3], enumDefault2);
    const showCamcorder = _.includes([2, 3], enumDefault2);

    const styles = {
      maxWidth:
        showCamera && showCamcorder && showFile
          ? 'calc(100% - 172px)'
          : (showCamera || showCamcorder) && showFile
            ? 'calc(100% - 86px)'
            : '100%',
    };

    return (
      <div
        className={cx('customFormFileBox customFormAttachmentBox', { controlDisabled: mobileDisabled })}
        style={{ height: 'auto' }}
      >
        {!mobileDisabled ? (
          <div className="flexRow">
            {window.isMingDaoApp ? (
              <Fragment>
                {this.renderMobileUploadTrigger({ originCount, strDefault, attachments, styles, type: 'file' })}
              </Fragment>
            ) : (
              <Fragment>
                {showFile &&
                  this.renderMobileUploadTrigger({
                    originCount,
                    strDefault,
                    attachments,
                    styles,
                    type: 'file',
                    iconClass: 'Font16',
                  })}
                {showCamera &&
                  this.renderMobileUploadTrigger({
                    originCount,
                    strDefault,
                    attachments,
                    customHint: _l('拍照'),
                    customUploadType: 'camara',
                    className: cx({ mLeft6: showFile }),
                    icon: 'camera_alt',
                    iconClass: 'Font18',
                    type: 'camera',
                  })}
                {showCamcorder &&
                  this.renderMobileUploadTrigger({
                    originCount,
                    strDefault,
                    attachments,
                    customHint: _l('拍摄'),
                    customUploadType: 'camcorder',
                    className: cx({ mLeft6: showFile || showCamera }),
                    icon: 'video2',
                    iconClass: 'Font20',
                    type: 'camcorder',
                  })}
              </Fragment>
            )}
          </div>
        ) : (
          !attachmentData.length && <div className="customFormNull" />
        )}
        <Files
          {...filesProps}
          showType={['3'].includes(showType) ? '2' : !disabled && showType === '4' ? '1' : showType}
          isDeleteFile={allowDelete && !disabled}
          from={from}
          removeUploadingFile={data => {
            this.setState({ isComplete: true });
            if (showFile) {
              const { currentFile, state } = this.mobileFileRef['file'];
              currentFile && currentFile.removeFile({ id: data.id });
              if (_.find(state.files, { id: data.id })) {
                this.mobileFileRef['file'].setState({
                  files: state.files.filter(n => n.id !== data.id),
                });
              }
            }
            if (showCamera) {
              const { currentFile, state } = this.mobileFileRef['camera'];
              currentFile && currentFile.removeFile({ id: data.id });
              if (_.find(state.files, { id: data.id })) {
                this.mobileFileRef['camera'].setState({
                  files: state.files.filter(n => n.id !== data.id),
                });
              }
            }
            if (showCamcorder) {
              const { currentFile, state } = this.mobileFileRef['camcorder'];
              currentFile && currentFile.removeFile({ id: data.id });
              if (_.find(state.files, { id: data.id })) {
                this.mobileFileRef['camcorder'].setState({
                  files: state.files.filter(n => n.id !== data.id),
                });
              }
            }
            this.handleCheckMobileFiles(_.find(attachments, { id: data.id }));
            this.filesChanged(
              attachments.filter(item => item.id !== data.id),
              'attachments',
            );
          }}
        />
      </div>
    );
  }
}
