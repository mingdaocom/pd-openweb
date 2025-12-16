import React, { Component } from 'react';
import { Progress } from 'antd';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import createUploader from 'src/library/plupload/createUploader';
import { formatFileSize } from 'src/utils/common';
import RegExpValidator from 'src/utils/expression';

const UploadWrap = styled.div`
  height: 340px;
  border: 1px dashed #e0e0e0;
  .icon {
    color: #bdbdbd;
  }
  &:hover {
    border: 1px dashed #1677ff;
    .icon {
      color: #1677ff;
    }
  }
`;

const UploadSuccess = styled.div`
  height: 340px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .icon {
    color: #58b84c;
  }
`;

export default class UploadFile extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.initUpload();
  }

  initUpload() {
    const { fileUploaded = () => {}, onFilesAdded = () => {}, type = 8 } = this.props;
    this.uploader = createUploader({
      runtimes: 'html5',
      browse_button: this.uplaodaExcel,
      drop_element: 'uploadExcel',
      max_file_size: '20mb',
      max_file_count: 1,
      bucket: 3,
      filters: {
        mime_types: [{ extensions: 'xlsx,xls,csv' }],
      },
      type,
      init: {
        Error: (up, err) => {
          const {
            file: { name },
            code,
          } = err;
          if (
            RegExpValidator.getExtOfFileName(name) != 'xlsx' &&
            RegExpValidator.getExtOfFileName(name) != 'xls' &&
            RegExpValidator.getExtOfFileName(name) != 'csv'
          ) {
            alert(_l('文件类型错误，仅支持xls、xlsx、csv文件'), 3);
            return;
          }
          if (code === window.plupload.FILE_SIZE_ERROR) {
            alert(_l('文件过大，仅支持 20MB 以内的文件'), 3);
            return;
          }
        },
        FilesAdded: up => {
          up.setOption('auto_start', true);
          onFilesAdded(up);
        },
        UploadProgress: (uploader, file) => {
          this.setState({ file });
        },
        FileUploaded: (up, file, info) => {
          this.setState({ file });
          fileUploaded({ ...file, key: info.response.key });
        },
      },
    });
  }
  render() {
    const { style } = this.props;
    const { file = {} } = this.state;
    return file.name ? (
      <UploadSuccess style={style}>
        <Icon icon="new_excel" className="excelIcon mBottom18 Font50" />
        <div className="Font14">{file.name}</div>
        <Progress
          style={{ width: 196, marginLeft: '36px' }}
          trailColor="#eaeaea"
          strokeColor="#1677ff"
          strokeWidth={8}
          percent={Math.floor((file.loaded / (file.size || 0)) * 100)}
        />
        <div className="Gray_9e">{formatFileSize(file.size)}</div>
      </UploadSuccess>
    ) : (
      <UploadWrap style={style}>
        <div
          id="uploadExcel"
          ref={node => (this.uplaodaExcel = node)}
          className="h100 flexColumn justifyContentCenter alignItemsCenter Hand"
        >
          <Icon icon="upload_file" className="Font48 mBottom18" />
          <div className="Font14 mBottom12">{_l('点击上传文件，或拖拽文件')}</div>
          <div className="Gray_9e">{_l('支持 20MB 以内的 xls、xlsx、csv 文件')}</div>
        </div>
      </UploadWrap>
    );
  }
}
