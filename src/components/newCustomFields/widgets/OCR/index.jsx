import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { Icon, QiniuUpload } from 'ming-ui';
import ajax from 'src/api/worksheet';

export default class Widgets extends Component {
  static propTypes = {
    worksheetId: PropTypes.string,
    controlId: PropTypes.string,
    enumDefault: PropTypes.number,
    onChange: PropTypes.func,
    advancedSetting: PropTypes.object,
  };

  state = {
    isUploading: false,
  };

  componentDidMount() {
    this.width = this.file.upload.offsetWidth;
  }

  handleUploaded = (up, file, info) => {
    const { worksheetId, controlId, advancedSetting, onChange } = this.props;

    ajax.ocr({ worksheetId, controlId, url: file.serverName + file.key, type: 1 }).then(result => {
      if (result.code === 1) {
        const ocrmap = JSON.parse(advancedSetting.ocrmap || '{}');

        result.data.forEach(item => {
          const currentItem = ocrmap.find(o => o.cid === item.controlId);
          let newValue;

          // 附件
          if (_.includes([1, 1001, 2001], parseInt(currentItem.type))) {
            info.originalFileName = decodeURIComponent(info.originalFileName);
            info.previewUrl = file.url;
            newValue = JSON.stringify({
              attachments: [{ ...(info || {}), allowDown: true, fileSize: (info || {}).fsize }],
              knowledgeAtts: [],
              attachmentData: [],
            });
          } else if (currentItem.subCid) {
            // 子表
            newValue = {
              action: 'clearAndSet',
              rows: item.childs,
            };
          } else {
            newValue = item.value;
          }

          onChange(newValue, item.controlId);
        });
      } else {
        alert(result.errorMsg, 2);
      }

      this.setState({ isUploading: false });
      up.disableBrowse(false);
    });
  };

  render() {
    const { enumDefault } = this.props;
    const { isUploading } = this.state;
    const TYPES = [
      {},
      { text: _l('文字识别'), icon: 'ocr' },
      { text: _l('身份证识别'), icon: 'ocr_id_card' },
      { text: _l('增值税发票识别'), icon: 'ocr_invoice' },
    ];

    return (
      <QiniuUpload
        className="customFormControlBox customFormControlOCR ThemeColor3"
        ref={file => {
          this.file = file;
        }}
        options={{
          multi_selection: false,
          chunk_size: 0,
          filters: {
            mime_types: [{ title: 'image', extensions: enumDefault === 3 ? 'jpg,jpeg,png,pdf' : 'jpg,jpeg,png' }],
          },
        }}
        onUploaded={this.handleUploaded}
        onAdd={(up, files) => {
          this.setState({ isUploading: true });
          up.disableBrowse();
        }}
      >
        {isUploading ? (
          <span style={{ width: this.width - 50, textAlign: 'center' }}>
            <Icon icon="loading_button" className="Font16 customOCRLoading" />
          </span>
        ) : (
          <Fragment>
            <Icon icon={TYPES[enumDefault].icon} className="Font20 mRight5" />
            <span style={{ fontWeight: 500 }}>{TYPES[enumDefault].text}</span>
          </Fragment>
        )}
      </QiniuUpload>
    );
  }
}
