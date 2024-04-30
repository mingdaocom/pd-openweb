import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import Icon from 'ming-ui/components/Icon';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import Progress from 'ming-ui/components/Progress';
import kcService from 'src/pages/kc/api/service';
import attachmentAjax from 'src/api/attachment';
import folderDg from 'src/components/kc/folderSelectDialog/folderSelectDialog';
import { getFileExtends, isDocument, formatTime } from './utils';
import { formatFileSize, downloadFile, getClassNameByExt } from 'src/util';
import saveToKnowledge from 'src/components/saveToKnowledge/saveToKnowledge';
import { addLinkFile } from 'ming-ui/functions';
import _ from 'lodash';
import RegExp from 'src/util/expression';

const vertical = {
  WebkitBoxOrient: 'vertical',
};

export default class FileComponent extends Component {
  static propTypes = {
    onReplaceAttachment: PropTypes.func,
  };
  static default = {};
  constructor(props) {
    super(props);
    this.state = {
      isEdit: false,
      menuVisible: false,
      penelVisible: false,
      moreVisible: false,
      imageSrc: false,
      imageWidth: false,
      viewImage: true,
      isDelete: false,
    };
    this.deleteFn = null;
  }
  componentDidMount() {
    let { UploadFile } = this;
    let { width } = UploadFile.getBoundingClientRect();
  }
  handleEdit = event => {
    event.stopPropagation();
    let { isEdit } = this.state;
    setTimeout(
      () => {
        this.setState(
          {
            isEdit: !isEdit,
          },
          () => {
            if (this.editInput) {
              this.editInput.focus();
              this.editInput.selectionStart = 100;
              this.editInput.selectionEnd = 100;
            }

            if (isEdit) {
              this.setState({
                penelVisible: false,
              });
            }
          },
        );
      },
      isEdit ? 200 : 0,
    );
  };
  handleKeyDown = (event, id) => {
    if (event.which === 13) {
      this.props.resetFileName(id, event.target.value);
      this.handleEdit(event);
    }
  };
  handleDownload = (event, isDownload, url) => {
    event.stopPropagation();
    if (!isDownload) {
      alert(_l('您权限不足，无法下载，请联系管理员或文件上传者'), 3);
    } else {
      window.open(downloadFile(url));
    }
  };
  handleOpenNewPage = event => {
    const { handleOpenControlAttachmentInNewTab } = this.props;
    event.stopPropagation();
    this.setState({
      menuVisible: false,
    });
    handleOpenControlAttachmentInNewTab();
  };
  handleShare = (event, isDownload) => {
    event.stopPropagation();

    if (!md.global.Account.accountId) {
      this.setState({
        menuVisible: false,
      });
      window.open(`${md.global.Config.WebUrl}login?ReturnUrl=${location.href}`);
      return;
    }

    if (!isDownload) {
      alert(_l('您权限不足，无法分享，请联系管理员或文件上传者'), 3);
      return;
    }

    const { data } = this.props;
    let attachment = {};
    let attachmentType = 1;

    if (data.refId) {
      // 知识文件
      attachmentType = 2;
      attachment = {
        id: data.refId,
        name: data.originalFilename,
        ext: getFileExtends(data.ext),
        size: data.filesize,
        path: `${data.filepath}${data.filename}`,
        previewUrl: data.previewUrl,
        viewUrl: data.viewUrl,
      };
    } else {
      attachment = {
        id: data.fileID,
        name: data.originalFilename || File.GetName(data.filename),
        ext: getFileExtends(data.ext),
        size: data.filesize,
        path: `${data.filepath}${data.filename}`,
        previewUrl: data.previewUrl,
        viewUrl: data.viewUrl,
      };
    }

    import('src/components/shareAttachment/shareAttachment').then(share => {
      const params = {
        attachmentType,
      };
      const isPicture = File.isPicture('.' + attachment.ext.slice(attachment.ext.indexOf('.') + 1));
      params.id = attachment.id;
      params.name = attachment.name;
      params.ext = `.${attachment.ext}`;
      params.size = attachment.size || 0; // 临时
      params.imgSrc = isPicture
        ? `${attachment.previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/2/w/490')}`
        : undefined;
      params.qiniuPath = attachment.path;
      params.isKcFolder = data.attachmentType === 5;
      // params.node = attachment;

      share.default(params, {
        performUpdateItem: visibleType => {
          if (visibleType) {
          }
        },
      });
    });
  };
  handleSaveToKc = (event, isDownload) => {
    event.stopPropagation();

    if (!md.global.Account.accountId) {
      this.setState({
        menuVisible: false,
      });
      window.open(`${md.global.Config.WebUrl}login?ReturnUrl=${location.href}`);
      return;
    }

    if (!isDownload) {
      alert(_l('您权限不足，无法保存，请联系管理员或文件上传者'), 3);
      return;
    }

    const { data } = this.props;
    let nodeType = 0;
    let sourceData = {};
    if (data.refId) {
      nodeType = 2;
      sourceData.nodeId = data.refId;
      sourceData.isShareFolder = data.attachmentType === 5;
    } else {
      nodeType = 1;
      sourceData.fileID = data.fileID;
    }

    folderDg({
      dialogTitle: _l('选择路径'),
      isFolderNode: 1,
      selectedItems: null,
      zIndex: 9999,
    })
      .then(result => {
        saveToKnowledge(nodeType, sourceData)
          .save(result)
          .then(function () {
            alert(_l('保存成功'));
          })
          .catch(function () {
            alert(_l('保存失败'), 2);
          });
      })
      .catch(() => {});
  };
  handleEditLink = () => {
    const _this = this;
    const { data } = this.props;

    addLinkFile({
      isEdit: true,
      data: {
        name: data.originalFilename,
        originLinkUrl: data.originLinkUrl,
      },
      callback: link => {
        const { linkName, linkContent } = link;
        let updatePromise;
        if (data.refId) {
          updatePromise = kcService.updateNode({
            id: data.refId,
            name: linkName + '.url',
            newLinkUrl: linkContent,
          });
        } else {
          updatePromise = attachmentAjax.editLinkAttachment({
            fileId: data.fileID,
            title: linkName,
            originLinkUrl: linkContent,
          });
        }
        updatePromise
          .then(() => {
            alert(_l('修改成功'));
            data.originalFilename = linkName;
            data.shortLinkUrl = linkContent;
            data.originLinkUrl = linkContent;
            _this.props.onReplaceAttachment(data);
          })
          .catch(err => {
            alert(_l('修改失败'), 3);
          });
      },
    });
  };
  handleOpenMenu = event => {
    event.stopPropagation();
    this.setState({ menuVisible: true });
  };
  handleConfirmDelete(fn) {
    this.setState({
      isDelete: true,
    });
    this.deleteFn = fn;
  }
  handleDelete = event => {
    event.stopPropagation();
    this.deleteFn && this.deleteFn();
    this.handleCancel(event);
  };
  handleCancel = event => {
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    this.setState({
      isDelete: false,
    });
  };
  renderPreview(fileResponse, fileClassName, isDoc, isVid, isKc) {
    return isDoc ? (
      <Fragment>
        <div className={cx(fileClassName, 'UploadFiles-fileIcon', 'UploadFiles-previewIcon')} />
        {this.renderFileImage(fileResponse.previewUrl)}
        <div className="UploadFiles-fileName UploadFiles-previewFileName">
          <span>
            {fileResponse.originalFilename}
            {fileResponse.ext}
          </span>
        </div>
      </Fragment>
    ) : (
      <Fragment>
        {isKc && (
          <div className="UploadFiles-video-kcIcon">
            <i className="icon icon-knowledge1" />
          </div>
        )}
        {this.renderFileImage(fileResponse.previewUrl)}
        <div className="UploadFiles-video">
          <i className="icon icon-video2" />
          {formatTime(fileResponse.duration)}
        </div>
      </Fragment>
    );
  }
  renderFileImage(url) {
    let { imageSrc, imageWidth } = this.state;
    let _this = this;
    if (!imageSrc) {
      let image = new Image();
      image.onload = function () {
        _this.setState({
          imageSrc: true,
          imageWidth: this.width,
        });
      };
      image.onerror = () => {
        // 图片加载错误，把 viewImage 设为 false，表示作为附件预览
        _this.setState({
          imageSrc: true,
          viewImage: false,
        });
      };
      image.src = url;
    }
    return imageSrc ? (
      <div className="UploadFiles-fileImage" style={{ backgroundImage: `url(${url})` }} />
    ) : (
      <div className="UploadFiles-mask" />
    );
  }
  renderTwiceView(fileResponse) {
    let isKc = !!fileResponse.refId;
    let fileClassName = getClassNameByExt(fileResponse.type === 1 ? false : fileResponse.fileExt);
    let isPicture = File.isPicture(fileResponse.fileExt);
    let { twice = {} } = fileResponse;

    return isPicture ? (
      <Fragment>
        {isKc && (
          <div className="UploadFiles-kcIcon">
            <i className="icon icon-knowledge1" />
          </div>
        )}
        {this.renderFileImage(twice.previewUrl ? twice.previewUrl : `${fileResponse.viewUrl}|imageView2/1/w/200/h/140`)}
      </Fragment>
    ) : (
      <div className="UploadFiles-fileAccessory">
        {isKc && (
          <div className="UploadFiles-kcIcon">
            <i className="icon icon-knowledge1" />
          </div>
        )}
        <div className="UploadFiles-fileIconWrapper">
          <div className={cx(fileClassName, 'UploadFiles-fileIcon')} />
        </div>
        <div className="UploadFiles-fileName">
          <span>
            {fileResponse.originalFileName}
            {fileResponse.fileExt}
          </span>
        </div>
      </div>
    );
  }
  renderTwicePenel(fileResponse, index) {
    let isKc = !!fileResponse.refId;
    let { isEdit, penelVisible } = this.state;
    let isPicture = File.isPicture(fileResponse.fileExt);
    let penelClass = cx(
      'UploadFiles-filePanel',
      isPicture ? 'UploadFiles-filePanel-image' : 'UploadFiles-filePanel-accessory',
    );
    let fileSize = formatFileSize(fileResponse.fileSize);
    let textClass = cx('UploadFiles-panelTextName', {
      ThemeColor3: !isPicture,
    });

    let handleOpen = (event, isEdit) => {
      event.stopPropagation();
      if (!isEdit) {
        isKc
          ? this.props.onKcTwicePreview(fileResponse.fileID, index, event)
          : this.props.onPreview(fileResponse.fileID, index, event);
      }
    };

    return (
      <div
        style={{ opacity: penelVisible ? 1 : 0 }}
        className={penelClass}
        onClick={event => {
          handleOpen(event);
        }}
        onMouseEnter={() => {
          this.setState({ penelVisible: true });
        }}
        onMouseLeave={() => {
          this.setState({ penelVisible: !!isEdit }),
            this.editInput && this.props.resetFileName(fileResponse.fileID, this.editInput.value);
        }}
      >
        <div className="UploadFiles-panelText">
          {isEdit ? (
            <input
              ref={editInput => {
                this.editInput = editInput;
              }}
              type="text"
              className="UploadFiles-editInput"
              defaultValue={fileResponse.originalFileName}
              onBlur={event => {
                this.handleEdit(event);
              }}
              onKeyDown={event => {
                this.handleKeyDown(event, fileResponse.fileID);
              }}
            />
          ) : (
            <div className={textClass} title={`${fileResponse.originalFileName}${fileResponse.fileExt}`}>
              <span style={vertical}>{`${fileResponse.originalFileName}${fileResponse.fileExt}`}</span>
            </div>
          )}
          {!!fileResponse.refId && (
            <div className="UploadFiles-kcFileName" style={vertical}>
              <span>{_l('来自知识')}</span>
              {fileResponse.twice.attachmentType !== 4 ? <span>{fileSize}</span> : undefined}
            </div>
          )}
        </div>
        <div className="UploadFiles-panelBtns">
          <div />
          {isKc ? (
            this.props.isDeleteKcFile && (
              <div>
                <div
                  onClick={event => {
                    event.nativeEvent.stopImmediatePropagation();
                    event.stopPropagation();
                    this.handleConfirmDelete(this.props.onDeleteKcFile.bind(this, fileResponse.refId, event));
                  }}
                  className="UploadFiles-panelBtn UploadFiles-panelBtn-delete"
                  data-tip={_l('删除')}
                >
                  <i className="icon-task-new-delete" />
                </div>
              </div>
            )
          ) : (
            <div>
              <div
                onClick={event => {
                  const { onDeleteFile } = this.props;
                  event.nativeEvent.stopImmediatePropagation();
                  event.stopPropagation();
                  onDeleteFile && onDeleteFile(fileResponse.fileID, event);
                }}
                className="UploadFiles-panelBtn UploadFiles-panelBtn-delete"
                data-tip={_l('删除')}
              >
                <i className="icon-task-new-delete" />
              </div>
              <div
                onClick={event => {
                  this.handleEdit(event);
                }}
                className="UploadFiles-panelBtn UploadFiles-panelBtn-edit"
                data-tip={_l('重命名')}
              >
                <i className="ThemeHoverColor3 icon-new_mail" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  renderView(fileResponse, isKc) {
    let fileClassName = getClassNameByExt(fileResponse.fileExt);
    let isPicture = File.isPicture(fileResponse.fileExt);
    let isMDLink = fileResponse.viewType === 5;
    const url = fileResponse.previewUrl || fileResponse.url || '';

    return isPicture ? (
      <Fragment>
        {isKc ? (
          <div className="UploadFiles-kcIcon">
            <i className="icon icon-knowledge1" />
          </div>
        ) : null}
        {this.renderFileImage(
          isKc
            ? fileResponse.viewUrl
            : `${
                url.indexOf('imageView2') > -1
                  ? url.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/1/w/200/h/140')
                  : url + '&imageView2/1/w/200/h/140'
              }`,
        )}
      </Fragment>
    ) : (
      <div className="UploadFiles-fileAccessory">
        {isKc && (
          <div className="UploadFiles-kcIcon">
            <i className="icon icon-knowledge1" />
          </div>
        )}
        <div
          className="UploadFiles-fileIconWrapper"
          ref={con => {
            this.linkCon = isMDLink && con;
          }}
        >
          <div className={cx(fileClassName, 'UploadFiles-fileIcon')} />
        </div>
        <div className="UploadFiles-fileName">
          <span>
            {fileResponse.originalFileName}
            {fileResponse.fileExt}
          </span>
        </div>
      </div>
    );
  }
  renderPenel(fileResponse, index, isKc) {
    let { isEdit, penelVisible } = this.state;
    let isPicture = File.isPicture(fileResponse.fileExt);
    let penelClass = cx(
      'UploadFiles-filePanel',
      isPicture ? 'UploadFiles-filePanel-image' : 'UploadFiles-filePanel-accessory',
    );
    let fileSize = formatFileSize(fileResponse.fileSize);
    let textClass = cx('UploadFiles-panelTextName', {
      ThemeColor3: !isPicture,
    });

    let handleOpen = (event, isEdit) => {
      event.stopPropagation();
      if (!isEdit) {
        this.props.onPreview(fileResponse.fileID, index, event);
      }
    };

    return (
      <div
        style={{ opacity: penelVisible ? 1 : 0 }}
        className={penelClass}
        onClick={event => {
          handleOpen(event, isEdit);
        }}
        onMouseEnter={() => {
          this.setState({ penelVisible: true });
        }}
        onMouseLeave={() => {
          this.setState({ penelVisible: !!isEdit, menuVisible: false }),
            this.editInput && this.props.resetFileName(fileResponse.fileID, this.editInput.value);
        }}
      >
        <div className="UploadFiles-panelText">
          {isEdit ? (
            <input
              ref={editInput => {
                this.editInput = editInput;
              }}
              type="text"
              className="UploadFiles-editInput"
              defaultValue={fileResponse.originalFileName}
              onBlur={event => {
                this.handleEdit(event);
              }}
              onKeyDown={event => {
                this.handleKeyDown(event, fileResponse.fileID);
              }}
            />
          ) : (
            <div className={textClass} title={`${fileResponse.originalFileName}${fileResponse.fileExt}`}>
              <span style={vertical}>{`${fileResponse.originalFileName}${fileResponse.fileExt}`}</span>
            </div>
          )}
          {!!fileResponse.refId && (
            <div className="UploadFiles-kcFileName" style={vertical}>
              <span>{_l('来自知识')}</span>
              {fileResponse.attachmentType !== 4 ? <span>{fileSize}</span> : undefined}
            </div>
          )}
        </div>
        <div className="UploadFiles-panelBtns">
          <div />
          {isKc ? (
            <div>
              <div
                onClick={event => {
                  event.nativeEvent.stopImmediatePropagation();
                  event.stopPropagation();
                  // this.handleConfirmDelete(this.props.onDeleteKcFile.bind(this, fileResponse.refId, event));
                  this.props.onDeleteKcFile(fileResponse.refId, event);
                }}
                className="UploadFiles-panelBtn UploadFiles-panelBtn-delete"
                data-tip={_l('删除')}
              >
                <i className="icon-task-new-delete" />
              </div>
            </div>
          ) : (
            <div>
              <div
                onClick={event => {
                  const { onDeleteFile } = this.props;
                  event.nativeEvent.stopImmediatePropagation();
                  event.stopPropagation();
                  onDeleteFile && onDeleteFile(fileResponse.fileID, event);
                }}
                className="UploadFiles-panelBtn UploadFiles-panelBtn-delete"
                data-tip={_l('删除')}
              >
                <i className="icon-task-new-delete" />
              </div>
              <div
                onClick={event => {
                  this.handleEdit(event);
                }}
                className="UploadFiles-panelBtn UploadFiles-panelBtn-edit"
                data-tip={_l('重命名')}
              >
                <i className="ThemeHoverColor3 icon-new_mail" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  renderMDView(fileResponse) {
    // fileResponse.shareUrl = false;
    let browse = true;
    let { viewImage } = this.state;
    let fileClassName = getClassNameByExt(fileResponse.attachmentType === 5 ? false : fileResponse.ext);
    let isPicture = File.isPicture(fileResponse.ext);
    let isKc = !!fileResponse.refId;
    let isMDLink = fileResponse.viewType === 5;
    // fileResponse.previewUrl = "https://www.mingdao.com/api/file/owa?id=0efdb627-a3bf-486b-b27c-e9cf3c486e38&pst=1&type=preview";
    // 如果是文档，显示文档的缩略图，previewUrl 字段
    let isDoc = isDocument(fileResponse.ext);
    let isVid = RegExp.isVideo(fileResponse.ext);

    // 如果没有 shareUrl 字段，表示权限不能浏览
    if (isKc && !fileResponse.shareUrl) {
      isPicture = false;
      browse = false;
    }
    // 知识视频
    if (isKc && isVid) {
      fileResponse.previewUrl = fileResponse.thumbnailPath;
    }

    return isPicture && viewImage ? (
      <Fragment>
        {isKc ? (
          <div className="UploadFiles-kcIcon">
            <i className="icon icon-knowledge1" />
          </div>
        ) : null}
        {this.renderFileImage(
          `${fileResponse.previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, `imageView2/1/w/200/h/140`)}`,
        )}
      </Fragment>
    ) : (isDoc || isVid) && fileResponse.previewUrl && viewImage ? (
      this.renderPreview(fileResponse, fileClassName, isDoc, isVid, isKc)
    ) : (
      <div className="UploadFiles-fileAccessory">
        {isKc && (
          <div className="UploadFiles-kcIcon">
            <i className="icon icon-knowledge1" />
          </div>
        )}
        <div
          className="UploadFiles-fileIconWrapper"
          ref={con => {
            this.linkCon = isMDLink && con;
          }}
        >
          <div className={cx(fileClassName, 'UploadFiles-fileIcon')} />
        </div>
        {browse ? (
          <div className="UploadFiles-fileName">
            <span>
              {fileResponse.originalFilename}
              {fileResponse.ext}
            </span>
          </div>
        ) : (
          <div className="UploadFiles-fileName">
            <div className="UploadFiles-forbidFileName">{_l('已经删除或无权查看')}</div>
          </div>
        )}
      </div>
    );
  }
  renderMDPenel(fileResponse, index) {
    const { hideDownload = false, handleOpenControlAttachmentInNewTab } = this.props;
    let browse = true;
    let { penelVisible, moreVisible, isDelete } = this.state;
    let { isUpload } = this.props;
    let isKc = !!fileResponse.refId;
    let isPicture = File.isPicture(fileResponse.ext) || (RegExp.isVideo(fileResponse.ext) && fileResponse.previewUrl);
    let fileSize = formatFileSize(fileResponse.filesize);
    let isMDLink = fileResponse.viewType === 5;

    let isDownload = false;
    if (isKc) {
      isDownload = fileResponse.allowDown === 'ok';
    } else if (fileResponse.accountId === md.global.Account.accountId || isPicture || fileResponse.allowDown === 'ok') {
      isDownload = true;
    }

    let downloadUrl = false;
    if (fileResponse.downloadUrl) {
      downloadUrl =
        fileResponse.attachmentType == 5
          ? `${fileResponse.downloadUrl}&shareFolderId=${fileResponse.refId}`
          : fileResponse.downloadUrl;
    } else {
      downloadUrl = `${md.global.Config.AjaxApiUrl}file/downDocument?fileID=${fileResponse.fileID}`;
    }

    // 如果没有 shareUrl 字段，表示权限不能浏览
    if (isKc && !fileResponse.shareUrl) {
      isPicture = false;
      browse = false;
    }

    let penelClass = cx(
      'UploadFiles-filePanel',
      isPicture ? 'UploadFiles-filePanel-image' : 'UploadFiles-filePanel-accessory',
    );
    let textClass = cx('UploadFiles-panelTextName', {
      ThemeColor3: !isPicture,
    });

    return (
      <div
        style={{ opacity: penelVisible ? 1 : 0 }}
        className={penelClass}
        onClick={event => {
          event.stopPropagation();
          browse
            ? this.props.onPreview(fileResponse.fileID, index, event)
            : alert(_l('您权限不足，无法预览，请联系管理员或文件上传者'), 3);
        }}
        onMouseEnter={() => {
          this.setState({ penelVisible: true });
        }}
        onMouseLeave={() => {
          this.setState({ penelVisible: false, menuVisible: false });
        }}
      >
        <div className="UploadFiles-panelText">
          <div className={textClass} title={`${fileResponse.originalFilename}${fileResponse.ext}`}>
            <span style={vertical}>{`${fileResponse.originalFilename}${fileResponse.ext}`}</span>
          </div>
          {fileResponse.refId ? (
            <div className="UploadFiles-kcFileName" style={vertical}>
              <span>{_l('来自知识')}</span>
              {fileResponse.attachmentType !== 4 ? <span>{fileSize}</span> : undefined}
            </div>
          ) : (
            <div className="UploadFiles-kcFileName" style={vertical}>
              <span>{isMDLink ? '' : fileSize}</span>
            </div>
          )}
        </div>
        {isDelete ? (
          <div className="flexRow UploadFiles-filePanel-confirm">
            <div className="delete" onClick={this.handleDelete}>
              {_l('删除')}
            </div>
            <div className="cancel" onClick={this.handleCancel}>
              {_l('取消')}
            </div>
          </div>
        ) : (
          <div className="UploadFiles-panelBtns">
            <div>
              {this.props.isDeleteFile && (
                <div
                  onClick={event => {
                    event.nativeEvent.stopImmediatePropagation();
                    event.stopPropagation();
                    this.handleConfirmDelete(this.props.onDeleteMDFile.bind(this, fileResponse, event));
                  }}
                  className="UploadFiles-panelBtn UploadFiles-panelBtn-delete"
                  data-tip={_l('删除')}
                >
                  <i className="icon-task-new-delete" />
                </div>
              )}
            </div>
            <div className={cx({ hide: !browse })}>
              {/* 是否不可下载 */}
              {!hideDownload && (
                <div
                  onClick={event => {
                    this.handleDownload(event, isDownload, downloadUrl);
                  }}
                  className="UploadFiles-panelBtn"
                  data-tip={_l('下载')}
                >
                  <i className="ThemeHoverColor3 icon-download" />
                </div>
              )}
              {((!isMDLink && !hideDownload) ||
                !hideDownload ||
                (isMDLink && fileResponse.accountId === md.global.Account.accountId)) &&
                !md.global.Account.isPortal &&
                !_.get(window, 'shareState.shareId') && (
                  <div
                    className="UploadFiles-panelBtn"
                    onClick={event => {
                      this.handleOpenMenu(event);
                    }}
                  >
                    <i className={cx('icon-task-point-more', { ThemeColor3: !!moreVisible })} />
                    <div
                      className="UploadFiles-panelBtnMask"
                      data-tip={_l('更多')}
                      onMouseEnter={() => {
                        this.setState({ moreVisible: true });
                      }}
                      onMouseLeave={() => {
                        this.setState({ moreVisible: false });
                      }}
                    />
                    <Menu
                      style={{ width: 120, right: 0, top: 0, zIndex: 100 }}
                      className={cx('UploadFiles-menuWrapper', { Hidden: !this.state.menuVisible })}
                      onClickAway={() => this.setState({ menuVisible: false })}
                    >
                      {handleOpenControlAttachmentInNewTab && _.isEmpty(window.shareState) && (
                        <MenuItem
                          onClick={event => {
                            this.handleOpenNewPage(event);
                          }}
                        >
                          <Icon icon="launch" />
                          <span className="UploadFiles-menuWrapper-text">{_l('新页面打开')}</span>
                        </MenuItem>
                      )}
                      {/* 是否不可下载 且 不可保存到知识和分享 */}
                      {!isMDLink && !hideDownload && (
                        <MenuItem
                          onClick={event => {
                            this.handleShare(event, isDownload);
                          }}
                        >
                          <Icon icon="share" />
                          <span className="UploadFiles-menuWrapper-text">{_l('分享')}</span>
                        </MenuItem>
                      )}
                      {/* 是否不可下载 且 不可保存到知识和分享 */}
                      {!hideDownload && (
                        <MenuItem
                          onClick={event => {
                            this.handleSaveToKc(event, isDownload);
                          }}
                        >
                          <Icon icon="knowledge-cloud" />
                          <span className="UploadFiles-menuWrapper-text">{_l('保存到知识')}</span>
                        </MenuItem>
                      )}
                      {isMDLink && fileResponse.accountId === md.global.Account.accountId && (
                        <MenuItem onClick={this.handleEditLink}>
                          <Icon icon="hr_edit" />
                          <span className="UploadFiles-menuWrapper-text">{_l('编辑')}</span>
                        </MenuItem>
                      )}
                    </Menu>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    );
  }
  render() {
    let { data, style, index, isUpload } = this.props;
    let { progress, base, accountId, sourceID, twice } = data;

    return (
      <div
        className="UploadFiles-file-wrapper"
        ref={UploadFile => {
          this.UploadFile = UploadFile;
        }}
        style={style}
      >
        <div className="UploadFiles-file">
          {twice
            ? this.renderTwiceView(data)
            : accountId || sourceID
            ? this.renderMDView(data)
            : data.refId
            ? this.renderView(data, true)
            : data.fileID && this.renderView(data)}
          {twice
            ? this.renderTwicePenel(data, index)
            : accountId || sourceID
            ? this.renderMDPenel(data, index)
            : data.refId
            ? this.renderPenel(data, index, true)
            : data.fileID && this.renderPenel(data, index)}
          {!!progress && (
            <div className="UploadFiles-loadfileWrapper">
              <div>
                <Progress.Circle
                  key="text"
                  isAnimation={false}
                  isRound={false}
                  strokeWidth={3}
                  diameter={58}
                  foregroundColor="#BDBDBD"
                  backgroundColor="#fff"
                  percent={parseInt(progress)}
                />
              </div>
              <div className="UploadFiles-panelTextName" style={{ display: base.isPic ? 'none' : '' }}>
                <span style={vertical}>{`${base.fileName}${base.fileExt}`}</span>
              </div>
              <div
                className={cx('UploadFiles-loadfileClose', {
                  //  Hidden: !parseInt(progress)
                })}
                data-tip={_l('取消上传')}
                onClick={() => {
                  this.props.removeUploadingFile(base.id);
                }}
              >
                <i className="ThemeHoverColor3 icon-close" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
