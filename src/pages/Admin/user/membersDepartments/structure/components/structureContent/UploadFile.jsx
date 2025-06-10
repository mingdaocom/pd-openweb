import React, { Component } from 'react';
import { checkCertification } from 'src/components/checkCertification';
import createUploader from 'src/library/plupload/createUploader';
import RegExpValidator from 'src/utils/expression';

export default class UploadFile extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    this.uploadFile();
  }
  uploadFile() {
    const { needCheckCert, projectId } = this.props;
    let isUploading = false;
    const _this = this;

    createUploader({
      runtimes: 'html5',
      max_file_count: 1,
      browse_button: _this.con,
      drop_element: 'importExcelBox',
      multi_selection: false,
      max_file_size: '4mb',
      filters: [
        {
          title: 'File',
          extensions: 'xlsx,xls',
        },
      ],
      init: {
        Browse: function (up) {
          if (needCheckCert) {
            checkCertification({ projectId, checkSuccess: () => up.trigger('Browse') });
            return false; // 阻止文件选择弹层
          }
        },
        BeforeUpload: function (up, file) {
          // 导入过程进行锁定，文件上传功能失效
          if (isUploading) {
            up.stop();
            up.removeFile(file);
            alert(_l('数据导入中，请稍后使用该功能'), 3, 1000);
            return false;
          }

          if (
            RegExpValidator.getExtOfFileName(file.name) != 'xlsx' &&
            RegExpValidator.getExtOfFileName(file.name) != 'xls'
          ) {
            alert(_l('上传失败，文件错误，请下载专用模板'), 3, 1000);
            up.stop();
            up.removeFile(file);
            return false;
          }
          // 开始上传
          isUploading = true;
        },
        FileUploaded(up, file, info) {
          up.stop();
          _this.props.updateUploadInfo({
            fileName: file.name,
            fileUrl: md.global.FileStoreConfig.documentHost + info.response.key,
          });

          isUploading = false;
        },
        Error(up, error) {
          if (error.code === window.plupload.FILE_SIZE_ERROR) {
            alert(_l('单个文件大小超过4MB，无法支持上传'), 2);
          } else {
            alert(_l('上传失败，请稍后再试。'), 2);
          }
        },
      },
    });
  }
  render() {
    const { fileName } = this.props;
    return (
      <button
        id="upload_field"
        ref={con => (this.con = con)}
        type="button"
        className="ming Button uploadBtnStyle mTop30"
      >
        {fileName ? _l('重新上传') : _l('上传文件')}
      </button>
    );
  }
}
