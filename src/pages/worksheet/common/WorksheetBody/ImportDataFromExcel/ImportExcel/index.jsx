import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Immutable from 'immutable';
import { Button, Dialog, Support } from 'ming-ui';
import { createUploader } from 'src/pages/kc/utils/qiniuUpload';
import * as utils from 'src/pages/kc/utils';
import { UPLOAD_STATUS, UPLOAD_ERROR } from 'src/pages/kc/constant/enum';
import './index.less';
import UploadProgress from './UploadProgress';
import UploadAction from './UploadAction';

export default class ImportExcel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: Immutable.OrderedMap(),
      filePaths: [],
      loading: false,
    };
  }

  componentDidMount() {
    const comp = this;
    this.uploader = createUploader({
      runtimes: 'html5',
      max_file_count: 1,
      browse_button: 'selectFileTrigger',
      drop_element: 'uploadExcel',
      max_file_size: '10mb',
      bucket: 3,
      chunk_size: '10mb',
      filters: {
        mime_types: [{ title: 'Excel files', extensions: 'xlsx,xls,xlsm,csv' }],
        max_file_size: '10mb',
        prevent_duplicates: true,
      },
      error_callback(errorType, errorFiles) {
        if (errorType === UPLOAD_ERROR.TOO_MANY_FILES) {
          alert(_l('只允许上传单个文件'), 2);
        }
      },
      init: {
        FilesAdded(up, files) {
          let { fileList } = comp.state;
          _.forEach(files, file => {
            fileList = fileList.set(file.id, {
              name: file.name,
              relativePath: file.getSource().relativePath,
              loaded: file.loaded,
              size: file.size,
              status: file.mdUploadErrorType ? UPLOAD_STATUS.ERROR : UPLOAD_STATUS.QUEUE,
              errorText: '',
            });
          });

          comp.setState({ fileList });
        },
        FilesRemoved(up, files) {
          let { fileList } = comp.state;
          _.forEach(files, file => {
            fileList = fileList.delete(file.id);
          });

          comp.setState({ fileList });
        },
        Error(up, err, errTip) {
          if (err.code === window.plupload.FILE_SIZE_ERROR) {
            alert(_l('单个文件大小超过10mb，无法支持上传'), 2);
          } else {
            alert(_l('上传失败，请稍后再试。'), 2);
          }
          const fileList = comp.state.fileList.update(err.file.id, fileItem => {
            if (!fileItem) return fileItem;
            fileItem.errorText = errTip;
            fileItem.status = UPLOAD_STATUS.ERROR;
            return fileItem;
          });
          comp.setState({ fileList });
        },
        UploadProgress(up, file = {}) {
          const fileList = comp.state.fileList.update(file.id, fileItem => {
            fileItem.loaded = file.loaded;
            fileItem.status = UPLOAD_STATUS.UPLOADING;
            return fileItem;
          });

          comp.setState({ fileList });
        },
        FileUploaded(up, file, info) {
          const { key } = info.response;
          const filePaths = comp.state.filePaths.concat();
          filePaths.push({ id: md.global.FileStoreConfig.documentHost + key, type: 1, name: file.name });
          const fileList = comp.state.fileList.update(file.id, fileItem => {
            fileItem.status = UPLOAD_STATUS.COMPLETE;
            fileItem.name = file.name;
            fileItem.ext = file.name.split('.')[file.name.split('.').length - 1];
            fileItem.path = md.global.FileStoreConfig.documentHost + key;
            return fileItem;
          });

          comp.setState({ fileList, filePaths });
        },
      },
    });
  }

  cancelUpload = id => {
    if (this.uploader.removeFile(id)) {
      const fileList = this.state.fileList.remove(id);
      this.setState({ fileList });
    } else {
      alert(_l('取消失败'), 3);
    }
  };

  retryUpload = id => {
    const selectFile = this.state.fileList.get(id);
    if (!selectFile.isRef) {
      const up = this.uploader;
      const file = up.getFile(id);
      up.trigger('Retry', file);
    }
  };

  deleteFile = id => {
    const selectFile = this.state.fileList.get(id);
    const fileList = this.state.fileList.remove(id);
    let newFilePaths = this.state.filePaths.concat();
    if (selectFile.isRef) {
      newFilePaths = this.state.filePaths.filter(item => item.id !== id);
      this.setState({ fileList, filePaths: newFilePaths });
    } else {
      if (this.uploader.removeFile(id)) {
        newFilePaths = this.state.filePaths.filter(item => item.id !== selectFile.path);
        this.setState({ fileList, filePaths: newFilePaths });
      } else {
        alert(_l('删除失败'), 3);
      }
    }
  };

  onNext = () => {
    const { hideUploadExcel, worksheetId } = this.props;

    this.setState({ loading: true });

    $.ajax(md.global.Config.WorksheetDownUrl + '/ExportExcel/GetPreviewExcel', {
      data: {
        filePath: this.state.filePaths[0].type === 1 ? this.state.filePaths[0].id : '',
        fileId: this.state.filePaths[0].type === 2 ? this.state.filePaths[0].id : '',
        worksheetId,
      },
      beforeSend: xhr => {
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      },
      success: data => {
        const fileInfo = {
          filePath: this.state.filePaths[0].type === 1 ? this.state.filePaths[0].id : '',
          fileId: this.state.filePaths[0].type === 2 ? this.state.filePaths[0].id : '',
          fileName: this.state.filePaths[0].name,
        };
        hideUploadExcel(data.data, fileInfo, data.message);
      },
    });
  };

  render() {
    const { hideUploadExcel } = this.props;
    const { fileList } = this.state;
    const { worksheetExcelImportDataLimitCount } = md.global.SysSettings;

    return (
      <Dialog
        className="workSheetUploadExcel"
        visible={true}
        title={_l('数据导入 - 上传Excel（1/3）')}
        description={
          <div>
            {_l(
              '支持10MB以内的xls、xlsx、csv文件, 最大行数不超过%0行，列数不超过200列；导入多选类型的控件，请确保Excel字段内各个选项/人员用“，”隔开；导入地区控件，省市县之间以“/”隔开，如：江西省/上饶市/铅山县，如填写的地区格式没有“/”，则会按照名称精准匹配',
              worksheetExcelImportDataLimitCount
            )}
            <Support type={3} href="https://help.mingdao.com/operation3.html" text={_l('使用帮助')} />
          </div>
        }
        overlayClosable={false}
        width="960"
        anim={false}
        footer={null}
        onCancel={hideUploadExcel}
      >
        <div className="flexColumn h100">
          <div
            id="uploadExcel"
            className="uploadExcel flexColumn flex"
            onDragOver={() => this.setState({ dragOver: true })}
            onDragLeave={() => this.setState({ dragOver: false })}
            onDrop={() => this.setState({ dragOver: false })}
          >
            <div className="optionContent">
              <div
                className={cx(
                  'dropContainer ThemeBorderColor4',
                  this.state.dragOver ? 'ThemeBGColor5' : 'ThemeBGColor6',
                )}
              >
                <div
                  className={cx('uploadIcon icon-knowledge-cloud', this.state.dragOver ? 'ThemeColor3' : 'ThemeColor4')}
                />
                <div className="dropDesc">
                  {this.state.dragOver ? _l('松开鼠标开始上传') : _l('拖拽文件到这里上传')}
                </div>
              </div>
              <div className={cx('chooseBtnContainer', fileList.size > 0 && 'Hidden')}>
                <div
                  className="chooseBtn ThemeHoverBGColor2 ThemeBGColor3"
                  onClick={() => {
                    $('#selectFileTrigger').click();
                  }}
                >
                  {_l('选择文件')}
                </div>
                <input type="file" className="hide" id="selectFileTrigger" />
              </div>
            </div>
            {!!fileList.size && (
              <div>
                <div className="fileList fileListHeader">
                  <div className="fileListItem">
                    <div className="fileListName">{_l('文件')}</div>
                    <div className="fileListSize">{_l('大小')}</div>
                    <div className="fileListProgress">{_l('状态')}</div>
                    <div className="fileListAction">{_l('操作')}</div>
                  </div>
                </div>
              </div>
            )}
            {!!fileList.size && (
              <div className="fileList fileListBody">
                <ul>
                  {fileList
                    .map((file, id) => (
                      <li key={id} className="fileListItem">
                        <div className="fileListName" title={file.name}>
                          <span className="type fileIcon-excel" />
                          {file.name}
                        </div>
                        <div className="fileListSize">{utils.humanFileSize(file.size)}</div>
                        <div className="fileListProgress">
                          <UploadProgress
                            percentage={file.loaded / file.size}
                            status={file.status}
                            errorText={file.errorText}
                          />
                        </div>
                        <div className="fileListAction">
                          <UploadAction
                            status={file.status}
                            deleteFile={() => this.deleteFile(id)}
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
          {fileList.size > 0 && (
            <div className="buttons">
              <Button
                loading={
                  this.state.loading ||
                  fileList.filter(
                    item => item.status === UPLOAD_STATUS.UPLOADING || item.status === UPLOAD_STATUS.QUEUE,
                  ).size > 0
                }
                disabled={fileList.filter(item => item.status === UPLOAD_STATUS.ERROR).size > 0}
                onClick={this.onNext}
              >
                {_l('下一步')}
              </Button>
            </div>
          )}
        </div>
      </Dialog>
    );
  }
}
