import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import { defaultWpsPreview, isWpsPreview, validateFileName } from '../../../utils';
import {
  changePreviewService,
  renameFile,
  replaceAttachment,
  saveToKnowlwdge,
  updateAllowDownload,
} from '../actions/action';
import { LOADED_STATUS, PREVIEW_TYPE } from '../constant/enum';
import * as previewUtil from '../constant/util';
import CommonHeader from './CommonHeader';
import 'rc-trigger/assets/index.css';

class PreviewHeader extends React.Component {
  static propTypes = {
    attachment: PropTypes.object,
    onClose: PropTypes.func,
    renameFile: PropTypes.func,
    saveToKnowlwdge: PropTypes.func,
    replaceAttachment: PropTypes.func,
    index: PropTypes.number,
    performUpdateItem: PropTypes.func,
    performRemoveItems: PropTypes.func,
    updateAllowDownload: PropTypes.func,
    className: PropTypes.string,
    hideFunctions: PropTypes.array,
    fromType: PropTypes.number,
    error: PropTypes.bool,
    changePreviewService: PropTypes.func,
  };

  state = {
    attachment: this.props.attachment,
  };

  componentDidMount() {
    this.props.changePreviewService('original');
  }

  handleShareNode = attachment => {
    const attachmentType =
      attachment.previewAttachmentType === 'KC' ? 2 : attachment.previewAttachmentType === 'QINIU' ? 0 : 1;
    import('src/components/shareAttachment/shareAttachment').then(share => {
      const params = {
        attachmentType,
      };
      const sourceNode = attachment.sourceNode;
      const isPicture = attachment.previewType === PREVIEW_TYPE.PICTURE;
      if (attachment.previewAttachmentType === 'KC') {
        params.id = sourceNode.id;
        params.name = sourceNode.name;
        params.ext = '.' + sourceNode.ext;
        params.size = sourceNode.size;
        params.imgSrc = isPicture ? `${attachment.viewUrl}|imageView2/2/w/490` : undefined;
        params.node = sourceNode;
      } else if (attachment.previewAttachmentType === 'COMMON') {
        params.id = sourceNode.fileID;
        params.name = sourceNode.originalFilename;
        params.ext = sourceNode.ext;
        params.size = sourceNode.filesize;
        params.imgSrc = isPicture ? `${attachment.viewUrl}|imageView2/2/w/490` : undefined;
        params.node = '';
      } else if (attachment.previewAttachmentType === 'QINIU') {
        params.name = attachment.name;
        params.ext = attachment.ext;
        params.size = sourceNode.size || 0;
        params.imgSrc = isPicture ? `${attachment.viewUrl}|imageView2/2/w/490` : undefined;
        params.qiniuPath = sourceNode.path;
        params.node = sourceNode;
      }
      share.default(params, {
        performUpdateItem: visibleType => {
          if (visibleType) {
            sourceNode.visibleType = visibleType;
            this.props.performUpdateItem(sourceNode);
          }
        },
      });
    });
  };

  downloadAttachment = () => {
    const { attachment, logExtend } = this.props;
    const { canDownload } = previewUtil.getPermission(attachment, {
      hideFunctions: this.props.hideFunctions,
      fromType: this.props.fromType,
    });
    if (canDownload) {
      window.open(previewUtil.getDownloadUrl(attachment, { ...this.props.extra, logExtend }));
    } else {
      alert(_l('您权限不足，无法下载或保存。请联系文件夹管理员或文件上传者'), 3);
    }
  };

  render() {
    const {
      attachment,
      fromType,
      hideFunctions,
      className,
      error,
      extra,
      previewService,
      projectId,
      isDraft,
      wpsEditUrl,
      allowEdit,
    } = this.props;
    const { name, ext } = attachment;
    const deleted = error.status === LOADED_STATUS.DELETED;
    const {
      canEditFileName,
      showSaveToKnowlege,
      showShare,
      canSaveToKnowlege,
      canDownload,
      showDownload,
      showKcVersionPanel,
    } = deleted
      ? {}
      : previewUtil.getPermission(attachment, {
          deleteFunction: extra.deleteFunction,
          hideFunctions,
          fromType,
        });
    const isWps = previewService === 'wps';
    const featureType = getFeatureStatus(projectId, VersionProductType.editAttachment);
    const isRecordFileNewTab =
      location.pathname.indexOf('recordfile') > -1 || location.pathname.indexOf('rowfile') > -1; // 记录内附件新开页
    const showEdit =
      md.global.Config.EnableDocEdit &&
      allowEdit &&
      (featureType || isRecordFileNewTab) &&
      wpsEditUrl &&
      isWpsPreview(ext, true) &&
      !isDraft; // （编辑授权指标||新开页）&可编辑权限&可编辑文档类型&非草稿箱

    return (
      <CommonHeader
        className={className}
        editNameInfo={{
          name,
          ext,
          canEditFileName,
          changeEditName: value => this.props.renameFile(value),
          validateFileName: value => validateFileName(value, true, {}, { extLength: ext.length }),
        }}
        showKcVersionPanel={showKcVersionPanel}
        attachment={attachment}
        historyPanelInfo={{
          performRemoveItems: this.props.performRemoveItems,
          downloadAttachment: this.downloadAttachment,
          callback: item => this.props.replaceAttachment(item, this.props.index, 'kc'),
          replaceAttachment: (item, outerItem) => {
            this.props.replaceAttachment(item, this.props.index, 'kc');
            if (outerItem) {
              this.props.performUpdateItem(outerItem);
            }
          },
        }}
        attachmentActionInfo={{
          cauUseWpsPreview: isWpsPreview(ext) || defaultWpsPreview(ext),
          userWps: isWps,
          showEdit,
          changePreview: type => this.props.changePreviewService(type),
          clickEdit: () => {
            if (featureType === '2') {
              buriedUpgradeVersionDialog(projectId, VersionProductType.editAttachment);
              return;
            }
            if (this.props.onClose) {
              this.props.onClose();
              window.open(wpsEditUrl);
            } else {
              location.href = wpsEditUrl;
            }
          },
        }}
        uploadNewVersion={item => {
          this.props.replaceAttachment(item, this.props.index, 'kc');
          this.props.performUpdateItem(item);
          const mdReplaceAttachment = this.props.extra.mdReplaceAttachment;
          if (typeof mdReplaceAttachment === 'function') {
            const originAttachment = this.props.originAttachments[this.props.index];
            if (originAttachment) {
              mdReplaceAttachment(
                Object.assign({}, originAttachment, {
                  originalFilename: item.name,
                  filesize: item.size,
                  downloadUrl: item.downloadUrl,
                }),
              );
            }
          }
        }}
        clickShare={() => this.handleShareNode(attachment)}
        addKc={
          showSaveToKnowlege &&
          md.global.Account.accountId &&
          !md.global.Account.isPortal &&
          !_.get(window, 'shareState.shareId')
        }
        canSaveToKnowlege={canSaveToKnowlege}
        saveToKnowlwdge={type => this.props.saveToKnowlwdge(type)}
        showOpenNewPage={
          _.isFunction(extra.openControlAttachmentInNewTab) &&
          attachment.previewAttachmentType !== 'QINIU' &&
          canDownload &&
          showDownload &&
          ((attachment.originNode || attachment.sourceNode || {}).fileID ||
            (attachment.originNode || attachment.sourceNode || {}).fileId) &&
          !_.get(window, 'shareState.shareId') &&
          !(
            _.get(window, 'shareState.isPublicQuery') ||
            _.get(window, 'shareState.isPublicForm') ||
            _.get(window, 'shareState.isPublicView') ||
            _.get(window, 'shareState.isPublicPage') ||
            _.get(window, 'shareState.isPublicRecord') ||
            _.get(window, 'shareState.isPublicWorkflowRecord')
          )
        }
        clickOpenNewPage={() => {
          extra.openControlAttachmentInNewTab(
            (attachment.originNode || attachment.sourceNode).fileID ||
              (attachment.originNode || attachment.sourceNode).fileId,
            this.props,
          );
        }}
        showShare={
          canDownload &&
          showShare &&
          !md.global.Account.isPortal &&
          !_.get(window, 'shareState.shareId') &&
          !_.get(window, 'shareState.isPublicForm') &&
          !_.get(window, 'shareState.isPublicQuery') &&
          !_.get(window, 'shareState.isPublicWorkflowRecord')
        }
        showDownload={!deleted && showDownload && !window.isMiniProgram && !_.get(window, 'shareState.isPublicForm')}
        clickDownLoad={this.downloadAttachment}
        onClose={this.props.onClose}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    attachment: state.attachments[state.index],
    originAttachments: state.originAttachments,
    index: state.index,
    error: state.error,
    extra: state.extra,
    performUpdateItem: state.extra.performUpdateItem || (() => {}),
    performRemoveItems: state.performRemoveItems,
    hideFunctions: state.hideFunctions,
    fromType: state.fromType,
    previewService: state.previewService,
    wpsEditUrl: state.wpsEditUrl,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    renameFile: bindActionCreators(renameFile, dispatch),
    saveToKnowlwdge: bindActionCreators(saveToKnowlwdge, dispatch),
    replaceAttachment: bindActionCreators(replaceAttachment, dispatch),
    updateAllowDownload: bindActionCreators(updateAllowDownload, dispatch),
    changePreviewService: bindActionCreators(changePreviewService, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PreviewHeader);
