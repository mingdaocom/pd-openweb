import React, { Fragment } from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import qs from 'query-string';
import cx from 'classnames';
import _ from 'lodash';
import Immutable from 'immutable';
import Icon from 'ming-ui/components/Icon';
import { mdNotification } from 'ming-ui/functions';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withHoverState from 'ming-ui/decorators/withHoverState';
import folderDg from 'src/components/kc/folderSelectDialog/folderSelectDialog';
import createUploader from 'src/library/plupload/createUploader';
import { humanFileSize } from '../../utils';
import { UPLOAD_STATUS, UPLOAD_ERROR, PICK_TYPE, MAX_FILE_COUNT } from '../../constant/enum';
import service from '../../api/service';
import { getClassNameByExt, getUrlByBucketName } from 'src/util';
import './uploadAssistant.css';

const HoverState = createDecoratedComponent(withHoverState);

class UploadProgress extends React.Component {
  static propTypes = {
    status: PropTypes.number,
    percentage: PropTypes.number, // 百分比，1 === 100%
    errorText: PropTypes.string,
  };

  render() {
    let percentage = (parseInt(this.props.percentage * 100, 10) || 0) + '%';
    let colorClass, text, icon;
    switch (this.props.status) {
      case UPLOAD_STATUS.COMPLETE:
        percentage = '100%';
        colorClass = 'bgSuccess';
        text = _l('上传成功');
        icon = <Icon className="uploadPercentageText fgSuccess" icon="ok" />;
        break;
      case UPLOAD_STATUS.ERROR:
        colorClass = 'bgError';
        text = this.props.errorText || '上传失败';
        icon = <Icon className="uploadPercentageText fgError" icon="delete" />;
        break;
      case UPLOAD_STATUS.UPLOADING:
        colorClass = 'ThemeBGColor3';
        text = percentage === '100%' ? _l('即将完成') : _l('上传中');
        icon = <span className="uploadPercentageText">{percentage}</span>;
        break;
      case UPLOAD_STATUS.QUEUE:
      default:
        colorClass = 'ThemeBGColor3';
        text = _l('排队中');
        icon = <span className="uploadPercentageText">{percentage}</span>;
        break;
    }
    return (
      <div className="uploadPercentage" title={text}>
        <div className="progressContainer">
          <div
            className={cx('progressBar', colorClass)}
            style={{ height: '100%', width: this.props.status === UPLOAD_STATUS.ERROR ? '100%' : percentage }}
          />
        </div>
        {icon}
        <div className="progressTitle">{text}</div>
      </div>
    );
  }
}

class UploadAction extends React.Component {
  static propTypes = {
    status: PropTypes.number,
    cancelUpload: PropTypes.func,
    retryUpload: PropTypes.func,
  };

  render() {
    let show = true;
    let icon, action, title;
    switch (this.props.status) {
      case UPLOAD_STATUS.ERROR:
        icon = <Icon icon="turnLeft" />;
        title = _l('重试');
        action = this.props.retryUpload;
        break;
      case UPLOAD_STATUS.QUEUE:
      case UPLOAD_STATUS.UPLOADING:
        icon = <span className="textIcon">×</span>;
        title = '取消';
        action = this.props.cancelUpload;
        break;
      case UPLOAD_STATUS.COMPLETE:
      default:
        show = false;
        break;
    }
    return (
      show && (
        <div className="fileListActionBtn Hand" title={title} icon={icon} onClick={action}>
          {icon}
        </div>
      )
    );
  }
}

class UploadAssistant extends React.Component {
  state = {
    uploadPath: _l('我的文件'),
    parentId: '',
    rootId: '',
    fileList: Immutable.OrderedMap(),
    supportDirectory: false,
  };

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    const comp = this;
    this.uploader = createUploader({
      runtimes: 'html5',
      max_file_count: MAX_FILE_COUNT,
      browse_button: 'selectFileTrigger',
      drop_element: 'uploadAssistant',
      error_callback(errorType, errorFiles) {
        switch (errorType) {
          case UPLOAD_ERROR.TOO_MANY_FILES:
            alert(_l('支持每次选择%0个文件，超过的请您分批次选择', MAX_FILE_COUNT));
            break;
          case UPLOAD_ERROR.INVALID_FILES:
            mdNotification.error({
              title: _l('上传发生错误'),
              description: _l('%0个文件不被支持，没有加入上传队列', errorFiles.length),
              duration: 3,
            });
            break;
          default:
            break;
        }
      },
      before_upload_check: (up, files) =>
        service.getUsage().then(usage => {
          if (usage.used + files.reduce((total, file) => total + (file.size || 0), 0) > usage.total) {
            return Promise.reject(_l('选择的文件超过本月上传流量上限'));
          }
        }),
      init: {
        PostInit() {
          if (!comp._isMounted) {
            return;
          }
          $(ReactDom.findDOMNode(comp)).on('change', '#selectDirectoryTrigger', evt => {
            if (evt.target.files.length > MAX_FILE_COUNT) {
              alert(_l('支持每次选择%0个文件，超过的请您分批次选择', MAX_FILE_COUNT));
              evt.target.value = null;
              return;
            }
            comp.uploader.addFile(
              Array.prototype.map.call(evt.target.files, file => {
                const mFile = new moxie.file.File(null, file);
                if (file.webkitRelativePath) {
                  mFile.relativePath = '/' + file.webkitRelativePath.replace(/^\//, '');
                }
                return mFile;
              }),
            );
            evt.target.value = null;
          });
        },
        FilesAdded(up, files) {
          function testFolder(nativeFile) {
            return new Promise((resolve, reject) => {
              if (nativeFile && nativeFile.size % 4096 == 0 && nativeFile.size <= 102400) {
                const reader = new FileReader();
                reader.onload = function () {
                  resolve();
                };
                reader.onerror = function () {
                  reject();
                };
                reader.readAsText(nativeFile);
              } else {
                resolve();
              }
            });
          }

          let { fileList } = comp.state;
          _.forEach(files, file => {
            let errorText;
            switch (file.mdUploadErrorType) {
              case UPLOAD_ERROR.INVALID_FILES:
                errorText = _l('文件格式不支持');
                break;
              default:
                break;
            }

            const nativeFile = file.getNative();
            testFolder(nativeFile).catch(() => {
              alert(_l('此浏览器不支持上传文件夹'), 3);
              up.removeFile(file);
            });

            fileList = fileList.set(file.id, {
              name: file.name,
              relativePath: file.getSource().relativePath,
              loaded: file.loaded,
              size: file.size,
              status: file.mdUploadErrorType ? UPLOAD_STATUS.ERROR : UPLOAD_STATUS.QUEUE,
              errorText,
              path: comp.state.uploadPath,
              parentId: comp.state.parentId,
              rootId: comp.state.rootId,
            });
          });
          comp._isMounted && comp.setState({ fileList });
        },
        FilesRemoved(up, files) {
          let { fileList } = comp.state;
          _.forEach(files, file => {
            fileList = fileList.delete(file.id);
          });
          comp._isMounted && comp.setState({ fileList });
        },
        Error(up, err, errTip) {
          if (errTip) {
            alert(errTip);
          }
          const fileList = comp.state.fileList.update(err.file.id, fileItem => {
            if (!fileItem) fileItem = {};
            fileItem.errorText = errTip;
            fileItem.status = UPLOAD_STATUS.ERROR;
            return fileItem;
          });
          comp._isMounted && comp.setState({ fileList });
        },
        UploadProgress(up, file) {
          const fileList = comp.state.fileList.update(file.id, fileItem => {
            if (!fileItem) fileItem = {};
            fileItem.loaded = file && file['loaded'];
            fileItem.status = UPLOAD_STATUS.UPLOADING;
            return fileItem;
          });
          comp._isMounted && comp.setState({ fileList });
        },
        FileUploaded(up, file, info) {
          const { bucket, key, fsize } = info.response;
          const item = comp.state.fileList.get(file.id);
          service
            .addFile({
              name: item.relativePath ? _.trimStart(item.relativePath, '/') : item.name,
              size: fsize,
              filePath: getUrlByBucketName(bucket) + key,
              parentId: item.parentId,
              rootId: item.rootId,
            })
            .then(res => {
              const fileList = comp.state.fileList.update(file.id, fileItem => {
                if (!fileItem) fileItem = {};
                if (res) {
                  fileItem.status = UPLOAD_STATUS.COMPLETE;
                  fileItem.name = res.name + (res.ext ? '.' : '') + res.ext;
                  fileItem.ext = res.ext;
                } else {
                  fileItem.status = UPLOAD_STATUS.ERROR;
                }
                return fileItem;
              });
              comp._isMounted && comp.setState({ fileList });

              if (
                location.search &&
                qs.parse(location.search.slice(1)).isMDClient &&
                typeof window.require !== 'undefined'
              ) {
                var ipcRenderer = window.require('electron').ipcRenderer;
                ipcRenderer.send('kc', {
                  rootId: item.rootId,
                  parentId: item.parentId,
                  fsize: parseInt(fsize, 10),
                });
              } else if (window.opener && window.opener.reloadNodeList) {
                window.opener.reloadNodeList(item.rootId, item.parentId, parseInt(fsize, 10));
              }
            })
            .catch(() => {
              const fileList = comp.state.fileList.update(file.id, fileItem => {
                fileItem.status = UPLOAD_STATUS.ERROR;
                return fileItem;
              });
              comp._isMounted && comp.setState({ fileList });
            });
        },
      },
    });

    window.setUploadLocation = ({ position, parentId, rootId }) => {
      const uploadPathPromise = position ? service.getReadablePosition(position) : _l('我的文件');
      Promise.all([uploadPathPromise]).then(([uploadPath]) => {
        this._isMounted && this.setState({ uploadPath, parentId, rootId });
      });
      return true;
    };
    if (!window.uploadLocation && window.location.search) {
      const strUploadLocation = qs.parse(window.location.search.substr(1)).uploadLocation;
      if (strUploadLocation) {
        window.uploadLocation = JSON.parse(decodeURIComponent(strUploadLocation));
      }
    }
    if (window.uploadLocation) {
      const uploadLocation = window.uploadLocation;
      window.setUploadLocation(uploadLocation);
      window.uploadLocation = '';
    }

    window.onbeforeunload = function () {
      if (comp.state.fileList.find(fileItem => fileItem.status === UPLOAD_STATUS.UPLOADING)) {
        return '有文件正在上传中，确定要放弃上传？';
      }
    };

    window.onresize = function () {
      comp.updateMarginRight();
    };

    this.selectFile();
  }

  componentDidUpdate() {
    this.updateMarginRight();
  }

  componentWillUnmount() {
    if (this.uploader) {
      this.uploader.destroy();
    }
    delete window.setUploadLocation;
    this._isMounted = false;
  }

  /* 存在滚动条时头部需要加右边距*/
  updateMarginRight = () => {
    const domHeight = $('.uploadAssistant .fileListBody').height();
    const elementHeight = $('.uploadAssistant .fileListBody').children('ul').height();
    let rightM = 0;
    /* 存在滚动条*/
    if (domHeight < elementHeight) {
      rightM = window.isChrome ? 5 : 17;
    }

    $('.fileListHeader .fileListAction').css('marginRight', rightM);
  };

  // componentDidUpdate(prevProps, prevState) {
  //   if(!this.resized && prevState.fileList.size === 0 && this.state.fileList.size !== 0) {
  //     this.resized = true;
  //     if(document.body.clientWidth < 620 || document.body.clientHeight < 620) {
  //       window.resizeTo(620, 620);
  //     }
  //   }
  // },
  cancelUpload = id => {
    if (this.uploader.removeFile(id)) {
      const fileList = this.state.fileList.remove(id);
      this.setState({ fileList });
    } else {
      alert(_l('取消失败'), 2);
    }
  };

  retryUpload = id => {
    const up = this.uploader;
    const file = up.getFile(id);
    up.trigger('Retry', file);
  };

  changeUploadPath = () => {
    // if(document.body.clientWidth < 620 || document.body.clientHeight < 620) {
    //   window.resizeTo(620, 700);
    // }
    folderDg({
      dialogTitle: _l('上传到'),
      isFolderNode: 1,
    }).then(result => {
      let uploadPathPromise, rootId, parentId;
      switch (result.type) {
        case PICK_TYPE.NODE:
          uploadPathPromise = service.getReadablePosition(result.node.position);
          rootId = result.node.rootId;
          parentId = result.node.id;
          break;
        case PICK_TYPE.ROOT:
          uploadPathPromise = service.getReadablePosition('/' + result.node.id);
          rootId = parentId = result.node.id;
          break;
        case PICK_TYPE.MY:
        default:
          uploadPathPromise = _l('我的文件');
          rootId = parentId = '';
          break;
      }
      Promise.all([uploadPathPromise]).then(([uploadPath]) => {
        this._isMounted && this.setState({ uploadPath, rootId, parentId });
      });
    });
  };

  isSupportDirectory = () => {
    const tmpInput = document.createElement('input');
    return 'webkitdirectory' in tmpInput && !('nwdirectory' in tmpInput);
  };

  selectFile = (evt = null) => {
    if (evt) {
      evt.stopPropagation();
    }
    $('#selectFileTrigger').click();
    this.setState({ hoverChooseBtn: false });
  };

  selectDirectory = (evt = null) => {
    if (evt) {
      evt.stopPropagation();
    }
    if (this.isSupportDirectory()) {
      $('#selectDirectoryTrigger').click();
    } else {
      alert(_l('仅支持 Chrome 内核浏览器'), 3);
    }
    this.setState({ hoverChooseBtn: false });
  };

  render() {
    return (
      <div
        id="uploadAssistant"
        className="uploadAssistant flexColumn"
        onDragOver={() => this.setState({ dragOver: true })}
        onDragLeave={() => this.setState({ dragOver: false })}
        onDrop={() => this.setState({ dragOver: false })}
      >
        <div className="optionContent">
          <div
            className={cx('dropContainer ThemeBorderColor4', this.state.dragOver ? 'ThemeBGColor5' : 'ThemeBGColor6')}
          >
            <div
              className={cx('uploadIcon icon-knowledge-cloud', this.state.dragOver ? 'ThemeColor3' : 'ThemeColor4')}
            />
            <div className="dropDesc">{this.state.dragOver ? _l('松开鼠标开始上传') : _l('拖拽文件到这里上传')}</div>
          </div>
          <div className="chooseBtnContainer">
            <HoverState
              id="selectFileTrigger"
              thisArg={this}
              hoverStateName="hoverChooseBtn"
              className="chooseBtn ThemeHoverBGColor2 ThemeBGColor3"
            >
              <span className="chooseBtnText">{_l('选择文件')}</span>
            </HoverState>

            {!window.isMDClient && (
              <HoverState
                thisArg={this}
                onClick={this.selectDirectory}
                hoverStateName="hoverChooseBtn"
                className="chooseBtn ThemeHoverBGColor2 ThemeBGColor3 mLeft20"
              >
                <span className="chooseBtnText">{_l('选择文件夹')}</span>
              </HoverState>
            )}
            <div
              className="hide"
              dangerouslySetInnerHTML={{
                __html: '<input id="selectDirectoryTrigger" type="file" webkitdirectory="" directory="" />',
              }}
            />
          </div>
          <div className="uploadPathBlock">
            <span>{_l('文件上传到:')}</span>
            {this.state.uploadPath.split('/').map((part, i) => {
              if (i === 0 || i > this.state.uploadPath.split('/').length - 4) {
                return (
                  <span key={i}>
                    <span className="uploadPath">{part}</span>
                    {i === this.state.uploadPath.split('/').length - 1 ? '' : '/'}
                  </span>
                );
              } else if (i === 1) {
                return (
                  <span key={i} className="uploadPath">
                    .../
                  </span>
                );
              }
              return null;
            })}
            <span className="changeUploadPath ThemeColor3 Hand" onClick={this.changeUploadPath}>
              {_l('更改')}
            </span>
          </div>
        </div>
        {!!this.state.fileList.size && (
          <div>
            <div className="fileList fileListHeader">
              <div className="fileListItem">
                <div className="fileListName">{_l('文件')}</div>
                <div className="fileListSize">{_l('大小')}</div>
                <div className="fileListProgress">{_l('状态')}</div>
                <div className="fileListPosition">{_l('位置')}</div>
                <div className="fileListAction">{_l('操作')}</div>
              </div>
            </div>
          </div>
        )}
        {!!this.state.fileList.size && (
          <div className="fileList fileListBody flex">
            <ul>
              {this.state.fileList
                .map((file, id) => (
                  <li key={id} className="fileListItem">
                    <div className="fileListName" title={file.name}>
                      <span className={cx('type', getClassNameByExt(file.ext))} />
                      {file.name}
                    </div>
                    <div className="fileListSize">{humanFileSize(file.size)}</div>
                    <div className="fileListProgress">
                      <UploadProgress
                        percentage={file.loaded / file.size}
                        status={file.status}
                        errorText={file.errorText}
                      />
                    </div>
                    <div className="fileListPosition" title={file.path}>
                      {file.path}
                    </div>
                    <div className="fileListAction">
                      <UploadAction
                        status={file.status}
                        cancelUpload={() => this.cancelUpload(id)}
                        retryUpload={() => this.retryUpload(id)}
                      />
                    </div>
                  </li>
                ))
                .toArray()}
            </ul>
          </div>
        )}
      </div>
    );
  }
}

export default UploadAssistant;
