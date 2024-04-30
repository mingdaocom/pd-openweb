import React, { Component, Fragment } from 'react';
import { Icon, Dialog } from 'ming-ui';
import { Progress } from 'antd';
import createUploader from 'src/library/plupload/createUploader';
import { formatFileSize } from 'src/util';
import styled from 'styled-components';

const UploadWrap = styled.div`
  height: 390px;
  border: 1px dashed #dddddd;
  border-radius: 4px;
  .icon {
    color: #bdbdbd;
  }
  &:hover {
    border-color: #2196f3;
    background: #f8fcff;
    .icon {
      color: #2196f3;
    }
  }
`;

const UploadSuccess = styled.div`
  height: 390px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .icon {
    color: #ff40b6;
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
    this.uploader = createUploader({
      runtimes: 'html5',
      browse_button: this.uplaodaExcel,
      drop_element: 'uploadExcel',
      max_file_size: '10mb',
      max_file_count: 1,
      bucket: 3,
      filters: {
        mime_types: [{ extensions: 'mp3' }],
      },
      type: 8,
      init: {
        Error: (up, err, errTip) => {
          const {
            file: { name },
            code,
          } = err;
          if (File.GetExt(name) != 'mp3') {
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
          this.setState({ file });
        },
        FileUploaded: (up, file, info) => {
          this.setState({ file });
          this.props.fileUploaded({ ...file, key: info.response.key });
        },
      },
    });
  }
  render() {
    const { style } = this.props;
    const { file = {} } = this.state;
    return file.name ? (
      <UploadSuccess style={style}>
        <Icon icon="new_excel" className="excelIcon mBottom18 Font56" />
        <div className="Font14">{file.name}</div>
        <Progress
          style={{ width: 196, marginLeft: '36px' }}
          trailColor="#eaeaea"
          strokeColor="#2196f3"
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
          <Icon icon="upload_file" className="Font56 mBottom18" />
          <div className="Font14 mBottom12">{_l('点击上传文件，或拖拽文件')}</div>
          <div className="Gray_9e">{_l('支持10MB以内的mp3文件')}</div>
        </div>
      </UploadWrap>
    );
  }
}
