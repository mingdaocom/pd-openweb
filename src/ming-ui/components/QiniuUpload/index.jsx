import React from 'react';
import PropTypes from 'prop-types';
import { createUploader } from 'src/pages/kc/utils/qiniuUpload';

export default class QiniuUpload extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    bucket: PropTypes.number,
    options: PropTypes.shape({}),
    children: PropTypes.element,
    onAdd: PropTypes.func,
    onUploaded: PropTypes.func,
    onError: PropTypes.func,
  };

  componentDidMount() {
    const { options, onAdd, onUploaded, onError, bucket } = this.props;

    if (this.upload) {
      this.uploader = createUploader(
        _.assign(
          {},
          {
            browse_button: this.upload,
            bucket,
            init: {
              FileUploaded: (up, file, info) => {
                onUploaded(up, file, info.response);
              },
              BeforeUpload: (up, file) => {
                const fileExt = `.${File.GetExt(file.name)}`;
                up.settings.multipart_params = { token: file.token };
                up.settings.multipart_params.key = file.key;
                up.settings.multipart_params['x:serverName'] = file.serverName;
                up.settings.multipart_params['x:filePath'] = file.key.replace(file.fileName, '');;
                up.settings.multipart_params['x:fileName'] = file.fileName.replace(/\.[^\.]*$/, '');;
                up.settings.multipart_params['x:originalFileName'] = encodeURIComponent(
                  file.name.indexOf('.') > -1 ? file.name.split('.').slice(0, -1).join('.') : file.name,
                );
                up.settings.multipart_params['x:fileExt'] = fileExt;
              },
              FilesAdded: (up, files) => {
                onAdd(up, files);
              },
              Error: args => {
                onError(...args);
              },
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
