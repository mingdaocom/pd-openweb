import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import DocumentTitle from 'react-document-title';
import postController from 'src/api/post';
import LoadDiv from 'ming-ui/components/LoadDiv';
import Button from 'ming-ui/components/Button';

import ExtIcon from '../../components/ExtIcon';

import { PREVIEW_TYPE, LOADED_STATUS } from './constant/enum';
import * as Actions from './actions/action';
import * as previewUtil from './constant/util';
import VideoPlayer from './VideoPlayer';
import ImageViewer from './imageViewer/imageViewer';
import CodeViewer from './codeViewer/codeViewer';
import ThumbnailGuide from './thumbnailGuide';
import AttachmentInfo from './attachmentInfo';
import PreviewHeader from './previewHeader/previewHeader';
import AttachmentsLoading from './attachmentsLoading';
import { formatFileSize, getClassNameByExt, addToken } from 'src/util';
import { isWpsPreview, defaultWpsPreview } from '../../utils';
import './attachmentsPreview.less';
import { getPssId } from 'src/util/pssId';
import _ from 'lodash';

class AttachmentsPreview extends React.Component {
  static propTypes = {
    showTitle: PropTypes.bool,
    attachments: PropTypes.array,
    actions: PropTypes.object,
    onClose: PropTypes.func,
    options: PropTypes.object,
    extra: PropTypes.object,
    performUpdateItem: PropTypes.func,
    index: PropTypes.number,
    loading: PropTypes.bool,
    error: PropTypes.any,
    showAttInfo: PropTypes.bool,
    fullscreen: PropTypes.bool,
  };

  state = {
    style: { opacity: 0 },
    attInfoFolded: true,
    showThumbnail: false,
  };

  componentDidMount() {
    const options = _.assign({}, this.props.options, {
      onClose: this.props.onClose,
    });
    const extra = this.props.extra || {};
    this.props.actions.init(options, extra);
    if (window.closeFns) {
      window.closeindex = (window.closeindex || 0) + 1;
      this.id = Math.random() && Math.random();
      window.closeFns[this.id] = {
        id: this.id,
        index: window.closeindex,
        fn: this.props.onClose,
      };
    }
    setTimeout(
      () =>
        this.setState({
          style: { opacity: 1 },
        }),
      0,
    );
    $(document).on('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    this.props.actions.loading();
    $(document).off('keydown', this.handleKeyDown);
    if (window.closeFns) {
      delete window.closeFns[this.id];
    }
  }

  onWheel = evt => {
    // 浏览PDF时，禁止滚动
    const { index, attachments } = this.props;
    const { ext } = attachments[index];
    if (ext == 'pdf') return;

    // 滚动切换文件预览
    evt = _.assign({}, evt);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (evt.deltaY > 0) {
        if (this.btnNext) {
          this.btnNext.click();
        }
      } else if (this.btnPrev) {
        this.btnPrev.click();
      }
    }, 250);
  };

  handleKeyDown = evt => {
    if (evt.key === 'Escape' && _.isEmpty(window.closeFns)) {
      if (typeof this.props.onClose === 'function') {
        this.props.onClose();
        return;
      }
    }
    if (evt.keyCode === 27 && this.props.fullscreen) {
      // TODO 全屏处理
      this.props.actions.toggleFullScreen();
    }
    if (evt.keyCode === 37) {
      if (this.btnPrev) {
        this.btnPrev.click();
      }
    }
    if (evt.keyCode === 39) {
      if (this.btnNext) {
        this.btnNext.click();
      }
    }
    if (evt.keyCode === 38 || evt.keyCode === 40) {
      evt.preventDefault();
    }
  };

  smallit = () => {
    this.refImageViewer && this.refImageViewer.smallit();
  };

  fitit = () => {
    this.refImageViewer && this.refImageViewer.fitit();
  };

  rotate = ({ reverse } = {}) => {
    this.refImageViewer && this.refImageViewer.rotate(reverse ? 90 : -90);
  };

  bigit = () => {
    this.refImageViewer && this.refImageViewer.bigit();
  };

  toggleThumbnail = status => {
    this.setState({
      showThumbnail: status,
    });
  };

  render() {
    if (!this.props.attachments.length) {
      return <LoadDiv />;
    }
    const {
      showTitle,
      attachments,
      index,
      showAttInfo,
      hideFunctions,
      extra,
      error,
      options = {},
      previewService,
    } = this.props;
    const currentAttachment = attachments[index];
    const { ext, name, previewAttachmentType } = currentAttachment;
    let { previewType } = currentAttachment;
    let { viewUrl = '' } = currentAttachment;
    let { canDownload, showDownload } = previewUtil.getPermission(currentAttachment, { hideFunctions });

    if (error && error.status === LOADED_STATUS.DELETED) {
      canDownload = false;
    }

    if (ext === 'txt') {
      previewType = PREVIEW_TYPE.TXT;
    }

    if (
      _.includes(
        [
          'md',
          'js',
          'ts',
          'java',
          'py',
          'rb',
          'cpp',
          'c',
          'html',
          'css',
          'php',
          'swift',
          'go',
          'rust',
          'lua',
          'sql',
          'pl',
          'sh',
          'md',
          'json',
          'xml',
          'cs',
          'vb',
          'scala',
          'perl',
          'r',
          'matlab',
          'groovy',
          'jsp',
          'jsx',
          'tsx',
          'sass',
          'less',
          'scss',
          'coffee',
          'asm',
          'bat',
          'powershell',
          'h',
          'hpp',
          'm',
          'mm',
          'd',
          'kt',
          'groovy',
          'ini',
          'yml',
        ],
        ext,
      ) &&
      previewType !== PREVIEW_TYPE.MARKDOWN &&
      previewAttachmentType === 'QINIU' &&
      _.get(currentAttachment, 'sourceNode.path')
    ) {
      previewType = ext === 'md' ? PREVIEW_TYPE.MARKDOWN : PREVIEW_TYPE.CODE;
      viewUrl = _.get(currentAttachment, 'sourceNode.path');
    }

    if (!currentAttachment.msg && getClassNameByExt(ext) === 'fileIcon-mp3') {
      previewType = PREVIEW_TYPE.VIDEO;
    }

    if (previewService === 'wps' && previewType === PREVIEW_TYPE.WPS) {
      previewType = PREVIEW_TYPE.IFRAME;
    }

    const isFullScreen = this.props.fullscreen; // ***** TODO 全屏

    return (
      <div
        className={cx('attachmentsPreview flexColumn', options.theme, { fullscreen: isFullScreen })}
        style={this.state.style}
        onWheel={this.onWheel}
      >
        {showTitle && <DocumentTitle title={name + '.' + ext} />}
        <PreviewHeader onClose={this.props.onClose} />
        <div className="previewPanel" style={!this.state.attInfoFolded && showAttInfo ? { right: 328 } : {}}>
          <div
            className="previewContainer"
            ref={previewCon => {
              this.refPreviewCon = previewCon;
            }}
            style={{
              bottom: this.state.showThumbnail ? '143px' : '50px',
            }}
          >
            <div className="ctrlCon">
              {this.props.index > 0 && (
                <span
                  className="prev"
                  ref={prev => {
                    this.btnPrev = prev;
                  }}
                  onClick={() => {
                    this.props.actions.prev({
                      recordId: options.recordId,
                      worksheetId: options.worksheetId,
                      controlId: options.controlId,
                    });
                  }}
                >
                  <i className="icon-arrow-left-border" />
                </span>
              )}
              {this.props.index < this.props.attachments.length - 1 && (
                <span
                  className="next"
                  ref={next => {
                    this.btnNext = next;
                  }}
                  onClick={() => {
                    this.props.actions.next({
                      recordId: options.recordId,
                      worksheetId: options.worksheetId,
                      controlId: options.controlId,
                    });
                  }}
                >
                  <i className="icon-arrow-right-border" />
                </span>
              )}
            </div>
            {this.props.loading ? (
              <AttachmentsLoading />
            ) : (
              (() => {
                if (error) {
                  const errorText = error.text;
                  return (
                    <div className="canNotView">
                      <span className={'canNotViewIcon ' + getClassNameByExt('.' + ext)} />
                      <p className="fileName">
                        <span className="ellipsis">{name}</span>
                        {ext ? '.' + ext : ''}
                      </p>
                      <p className="detail">预览失败{typeof error === 'boolean' ? '' : ', ' + errorText}</p>
                      {canDownload && showDownload && (
                        <Button
                          className="downloadBtn"
                          onClick={() => {
                            window.open(previewUtil.getDownloadUrl(currentAttachment, this.props.extra));
                          }}
                        >
                          下载
                        </Button>
                      )}
                    </div>
                  );
                }
                switch (previewType) {
                  case PREVIEW_TYPE.PICTURE: {
                    return (
                      <ImageViewer
                        className="fileViewer imageViewer"
                        ref={imageViewer => {
                          this.refImageViewer = imageViewer;
                        }}
                        canDownload={showDownload && canDownload}
                        src={viewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/0')}
                        con={this.refPreviewCon}
                        toggleFullscreen={this.props.actions.toggleFullScreen}
                        fullscreen={isFullScreen}
                        onClose={this.props.onClose}
                        onError={() => {
                          this.props.actions.error();
                        }}
                        showThumbnail={this.state.showThumbnail}
                      />
                    );
                  }
                  case PREVIEW_TYPE.IFRAME:
                    {
                      /*if ((ext || '').toLocaleLowerCase() === 'pdf' && !window.isDingTalk) {
                      return (
                        <iframe
                          width="100%"
                          height="100%"
                          frameborder="0"
                          src={`/preview/pdf/web/viewer.html?url=${currentAttachment.sourceNode.privateDownloadUrl}&showDownload=${showDownload}`}
                        />
                      );
                    }
                    */
                    }
                    if (previewAttachmentType === 'KC' && extra && extra.shareFolderId) {
                      viewUrl = previewUtil.urlAddParams(viewUrl, { shareFolderId: extra.shareFolderId });
                    }

                    if (previewService === 'wps' && (isWpsPreview(ext) || defaultWpsPreview(ext))) {
                      const url = addToken(currentAttachment.viewUrl, false);
                      viewUrl = `${md.global.Config.WpsUrl}/view?url=${encodeURIComponent(
                        url,
                      )}&attname=${encodeURIComponent(
                        currentAttachment.name || currentAttachment.sourceNode.originalFilename,
                      )}.${ext}`;
                    } else {
                      viewUrl = addToken(viewUrl, false);
                    }

                    return (
                      <iframe
                        className="fileViewer iframeViewer"
                        src={viewUrl}
                        sandbox="allow-forms allow-scripts allow-same-origin allow-modals"
                      />
                    );
                  case PREVIEW_TYPE.TXT:
                  case PREVIEW_TYPE.CODE:
                  case PREVIEW_TYPE.MARKDOWN:
                    return (
                      <CodeViewer
                        className="fileViewer"
                        src={viewUrl}
                        type={previewType}
                        onError={() => {
                          this.props.actions.error();
                        }}
                      />
                    );
                  case PREVIEW_TYPE.LINK:
                    return (
                      <div className="linkPreview">
                        <a
                          className="linkIconCon"
                          ref={iconCon => {
                            this.refIconCon = iconCon;
                          }}
                          rel="noopener noreferrer"
                          target="_blank"
                          href={currentAttachment.sourceNode.shortLinkUrl}
                        >
                          <span className="fileIcon-link linkIcon" />
                        </a>
                        <p className="fileName">
                          <span className="ellipsis">{currentAttachment.name}</span>
                          <span>.url</span>
                        </p>
                        <a
                          className="detail ellipsis"
                          rel="noopener noreferrer"
                          target="_blank"
                          href={currentAttachment.sourceNode.shortLinkUrl}
                        >
                          {currentAttachment.sourceNode.originLinkUrl}
                        </a>
                        <Button
                          className="downloadBtn boderRadAll_3 ThemeBGColor3"
                          rel="noopener noreferrer"
                          target="_blank"
                          onClick={() => {
                            window.open(currentAttachment.sourceNode.shortLinkUrl);
                          }}
                        >
                          打开链接
                        </Button>
                      </div>
                    );
                  case PREVIEW_TYPE.VIDEO:
                    return (
                      <VideoPlayer
                        src={currentAttachment.viewUrl || _.get(currentAttachment, 'sourceNode.path')}
                        attachment={currentAttachment}
                        canDownload={showDownload && canDownload}
                      />
                    );
                  case PREVIEW_TYPE.NEW_PAGE:
                  case PREVIEW_TYPE.OTHER:
                  default:
                    return (
                      <div className="canNotView">
                        {getClassNameByExt(ext) === 'fileIcon-doc' ? (
                          <ExtIcon ext={ext} />
                        ) : (
                          <span className={'canNotViewIcon ' + getClassNameByExt(ext)} />
                        )}

                        <p className="fileName">
                          <span className="ellipsis">{name}</span>
                          {ext ? '.' + ext : ''}
                        </p>
                        {currentAttachment.msg && <div className="msg">{currentAttachment.msg}</div>}
                        {(() => {
                          if (previewType === PREVIEW_TYPE.NEW_PAGE && viewUrl) {
                            return (
                              <Button
                                className="downloadBtn"
                                onClick={() => {
                                  window.open(viewUrl);
                                }}
                              >
                                预览
                              </Button>
                            );
                          } else if (canDownload && showDownload) {
                            return (
                              <Button
                                className="downloadBtn"
                                onClick={() => {
                                  window.open(previewUtil.getDownloadUrl(currentAttachment, this.props.extra));
                                }}
                              >
                                下载
                              </Button>
                            );
                          }
                        })()}
                        <p className="detail">
                          大小：{formatFileSize(currentAttachment.size || currentAttachment.filesize)}
                        </p>
                      </div>
                    );
                }
              })()
            )}
          </div>
          {previewType === PREVIEW_TYPE.PICTURE ? (
            <ThumbnailGuide
              canDownload={canDownload && showDownload}
              bigit={this.bigit}
              smallit={this.smallit}
              rotate={this.rotate}
              fitit={this.fitit}
              toggleThumbnail={this.toggleThumbnail}
            />
          ) : (
            <ThumbnailGuide toggleThumbnail={this.toggleThumbnail} />
          )}
        </div>
        {showAttInfo && (
          <AttachmentInfo
            toggleInfo={flag => {
              this.setState({
                attInfoFolded: !flag,
              });
            }}
            visible={!this.state.attInfoFolded}
          />
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    data: state,
    attachments: state.attachments,
    hideFunctions: state.hideFunctions,
    loading: state.loading,
    index: state.index,
    error: state.error,
    showAttInfo: state.showAttInfo,
    previewService: state.previewService,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Actions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AttachmentsPreview);
