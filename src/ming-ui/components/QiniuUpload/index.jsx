import React from 'react';
import PropTypes from 'prop-types';
import { createUploader } from 'src/pages/kc/utils/qiniuUpload';
import _ from 'lodash';

export default class QiniuUpload extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    bucket: PropTypes.number,
    options: PropTypes.shape({}),
    children: PropTypes.element,
    onInit: PropTypes.func,
    onAdd: PropTypes.func,
    onUploaded: PropTypes.func,
    onUploadProgress: PropTypes.func,
    onBeforeUpload: PropTypes.func,
    onError: PropTypes.func,
  };

  componentDidMount() {
    const {
      options,
      onInit = () => {},
      onAdd = () => {},
      onUploaded = () => {},
      onUploadProgress = () => {},
      onBeforeUpload = () => {},
      onError = () => {},
      bucket,
    } = this.props;

    if (this.upload) {
      this.uploader = createUploader(
        _.assign(
          {},
          {
            browse_button: this.upload,
            bucket,
            init: {
              FileUploaded: (up, file, info) => {
                const response = info.response;

                // 处理分片上传之后返回值少了的问题
                if (!response.serverName || response.serverName === 'null') {
                  response.fileExt = `.${File.GetExt(file.name)}`;
                  response.fileName = File.GetName(file.name);
                  response.filePath = file.key.replace(new RegExp(file.fileName), '');
                  response.originalFileName = File.GetName(file.name);
                  response.serverName = file.serverName;
                } else {
                  response.originalFileName = decodeURIComponent(response.originalFileName);
                }

                onUploaded(up, file, response);
              },
              BeforeUpload: (up, file) => {
                const fileExt = `.${File.GetExt(file.name)}`;
                up.settings.multipart_params = { token: file.token };
                up.settings.multipart_params.key = file.key;
                up.settings.multipart_params['x:serverName'] = file.serverName;
                up.settings.multipart_params['x:filePath'] = file.key.replace(file.fileName, '');
                up.settings.multipart_params['x:fileName'] = file.fileName.replace(/\.[^\.]*$/, '');
                up.settings.multipart_params['x:originalFileName'] = encodeURIComponent(
                  file.name.indexOf('.') > -1 ? file.name.split('.').slice(0, -1).join('.') : file.name,
                );
                up.settings.multipart_params['x:fileExt'] = fileExt;
                onBeforeUpload(up, file);
              },
              UploadProgress: (uploader, file) => {
                onUploadProgress(uploader, file);
              },
              FilesAdded: (up, files) => {
                onAdd(up, files);
              },
              Error: (...args) => {
                onError(...args);
              },
              Init: onInit,
            },
          },
          options,
        ),
      );
    }
  }

  componentWillUnmount() {
    if (this.uploader) {
      this.uploader.destroy();
    }
  }

  render() {
    const { className, children } = this.props;
    return (
      <div className={`InlineBlock ${className || ''}`} ref={con => (this.upload = con)}>
        {children}
      </div>
    );
  }
}
