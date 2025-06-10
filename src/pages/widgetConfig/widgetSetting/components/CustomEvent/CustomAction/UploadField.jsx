import React, { Component, Fragment } from 'react';
import { Progress } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, Icon } from 'ming-ui';
import createUploader from 'src/library/plupload/createUploader';
import { formatFileSize } from 'src/utils/common';
import RegExpValidator from 'src/utils/expression';

const UploadWrap = styled.div`
  height: 390px;
  border: 1px dashed #dddddd;
  border-radius: 4px;
  .icon {
    color: #bdbdbd;
  }
  &.active,
  &:hover {
    border-color: #2196f3;
    background: #f8fcff;
    .icon {
      color: #2196f3;
    }
  }
`;

const UploadListWrap = styled.div`
  height: 390px;
  display: flex;
  flex-direction: column;
  .listContent {
    flex: 1;
    min-height: 1;
    overflow-y: auto;
  }
  .uploadItem {
    width: 100%;
    display: flex;
    line-height: 54px;
    border-bottom: 1px solid #ddd;
    .mp3Icon {
      width: 20px;
      height: 23px;
    }
    .deleteIcon {
      font-size: 14px;
      color: #9e9e9e;
      &:hover {
        color: #757575;
      }
    }
    .ant-progress {
      margin-left: 0px !important;
    }
  }
  .uploadFooter {
    margin-top: 20px;
    display: flex;
    margin: 0 0 0 auto;
    .footerBtn {
      padding: 8px 24px;
      cursor: pointer;
      border-radius: 3px;
    }
    .uploadBtn {
      border: 1px solid #2196f3;
      color: #2196f3;
      margin-right: 20px;
      &:hover {
        background: #2196f3;
        border-color: #2196f3;
        color: #fff;
      }
    }
    .submitBtn {
      background: #2196f3;
      color: #fff;
      &:hover {
        background: #1565c0;
      }
    }
  }
`;

export default class UploadFile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      isComplete: false,
    };
    this.deleteFileKey = [];
    this.cacheFile = [];
  }

  componentDidMount() {
    this.initUpload();
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.isComplete !== this.state.isComplete) {
      this.initUpload();
    }
  }

  initUpload() {
    this.uploader = createUploader({
      runtimes: 'html5',
      browse_button: this.uploadMp3,
      drop_element: 'uploadMp3',
      max_file_size: '10mb',
      max_file_count: 10,
      bucket: 3,
      filters: {
        mime_types: [{ extensions: 'mp3' }],
      },
      type: 0,
      init: {
        Error: (up, err, errTip) => {
          const {
            file: { name },
            code,
          } = err;
          if (RegExpValidator.getExtOfFileName(name) != 'mp3') {
            alert(_l('文件类型错误，仅支持mp3文件'), 3, 1000);
            return;
          }
          if (code === window.plupload.FILE_SIZE_ERROR) {
            alert(_l('文件过大，仅支持 10MB 以内的文件'), 3);
            return;
          }
        },
        FilesAdded: up => {
          up.setOption('auto_start', true);
        },
        UploadProgress: (uploader, file) => {
          let newFiles = _.unionBy(this.state.files.concat(uploader.files), 'key');
          newFiles = newFiles.filter(i => !_.includes(this.deleteFileKey, i.key));
          this.setState({ files: newFiles, dragOver: false });
        },
        FileUploaded: (up, file, info) => {
          this.cacheFile.push(info);

          if (this.cacheFile.length === up.files.length) {
            let newVal = _.unionBy(this.state.files.concat(up.files), 'key');
            newVal = newVal.filter(i => !_.includes(this.deleteFileKey, i.key));
            this.setState({ files: newVal, isComplete: true }, () => {
              up.splice(0, up.files.length);
              this.cacheFile = [];
              up.disableBrowse(false);
            });
          }
        },
      },
    });
  }

  render() {
    const { files = [], dragOver } = this.state;
    if (files.length) {
      return (
        <UploadListWrap>
          <div className="uploadItem Gray_9e">
            <div className="flex">{_l('文件')}</div>
            <div className="Width110">{_l('大小')}</div>
            <div className="Width250">{_l('状态')}</div>
            <div className="Width110">{_l('操作')}</div>
          </div>
          <div className="listContent">
            {files.map((file, index) => {
              return (
                <div className="uploadItem">
                  <div className="flex flexCenter flexRow overflow_ellipsis">
                    <div className="mRight20 fileIcon-mp3 mp3Icon" />
                    <span className="flex overflow_ellipsis pRight16">{file.name}</span>
                  </div>
                  <div className="Width110">{formatFileSize(file.size)}</div>
                  <div className="Width250 flexCenter">
                    <Progress
                      style={{ width: 196, marginLeft: '36px' }}
                      trailColor="#eaeaea"
                      strokeColor="#2196f3"
                      strokeWidth={4}
                      percent={Math.floor((file.loaded / (file.size || 0)) * 100)}
                    />
                  </div>
                  <div className="Width110">
                    <Icon
                      icon="delete"
                      className="deleteIcon Font16 pointer"
                      onClick={() => {
                        this.deleteFileKey.push(file.key);
                        const newFiles = files.filter((i, idx) => idx !== index);
                        this.setState({ files: newFiles }, () => {
                          if (_.isEmpty(newFiles)) {
                            this.setState({ isComplete: false });
                          }
                        });
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="uploadFooter">
            <div className="footerBtn uploadBtn" ref={node => (this.uploadMp3 = node)}>
              {_l('继续上传')}
            </div>
            <div
              className="footerBtn submitBtn"
              onClick={() => {
                this.props.fileUploaded(files);
              }}
            >
              {_l('确定')}
            </div>
          </div>
        </UploadListWrap>
      );
    }

    return (
      <UploadWrap className={dragOver ? 'active' : ''}>
        <div
          id="uploadMp3"
          onDragOver={() => this.setState({ dragOver: true })}
          onDragLeave={() => this.setState({ dragOver: false })}
          ref={node => (this.uploadMp3 = node)}
          className="h100 flexColumn justifyContentCenter alignItemsCenter Hand"
        >
          <Icon icon="upload_file" className="Font56 mBottom18" />
          <div className="Font14 mBottom12">{dragOver ? _l('松开鼠标开始上传') : _l('点击上传文件，或拖拽文件')}</div>
          <div className="Gray_9e">{_l('支持10MB以内的mp3文件')}</div>
        </div>
      </UploadWrap>
    );
  }
}
