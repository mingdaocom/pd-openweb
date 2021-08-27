import React from 'react';
import PropTypes from 'prop-types';
import { createUploader } from 'src/pages/kc/utils/qiniuUpload';
import uuid from 'uuid';

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
    const serverNames = {
      2: md.global.FileStoreConfig.pubHost,
      3: md.global.FileStoreConfig.documentHost,
      4: md.global.FileStoreConfig.pictureHost,
      5: md.global.FileStoreConfig.uploadHost,
    };

    if (this.upload) {
      this.uploader = createUploader(
        _.assign(
          {},
          {
            browse_button: this.upload,
            bucket,
            init: {
              FileUploaded: (up, file, info) => {
                const { key, serverName } = info.response;
                onUploaded(up, file, serverName + key, info.response);
              },
              BeforeUpload: (up, file) => {
                const filePath = `pic/${moment().format('YYYYMM')}/${moment().format('DD')}/`;
                const newFilename = uuid();
                const fileExt = `.${File.GetExt(file.name)}`;
                const isPic = File.isPicture(fileExt);

                up.settings.multipart_params.key = filePath + newFilename + fileExt;
                up.settings.multipart_params['x:serverName'] = serverNames[bucket || (isPic ? 4 : 3)];
                up.settings.multipart_params['x:filePath'] = filePath;
                up.settings.multipart_params['x:fileName'] = newFilename;
                up.settings.multipart_params['x:originalFileName'] = encodeURIComponent(
                  file.name.indexOf('.') > -1
                    ? file.name
                        .split('.')
                        .slice(0, -1)
                        .join('.')
                    : file.name,
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
