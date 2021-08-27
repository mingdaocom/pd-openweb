/**
 * 文件上传模块（审批）
 */
/**
 * 文件上传模块（审批）
 */
import $ from 'jquery';
import ReactDOM from 'react-dom';
import React from 'react';
import UploadFiles from 'src/components/UploadFiles';

class FileUploaderHr {
  constructor(target, config) {
    /**
     * 元素 ID
     */
    this.target = target;
    /**
     * fileUploader
     */
    this.fileUploader = null;
    /**
     * files
     */
    let files = {
      // 本地附件
      attachments: [],
      // 知识附件
      knowledgeAtt: [],
      // 已保存的附件
      attachmentData: [],
    };
    if (config && config.files) {
      try {
        const _files = JSON.parse(config.files);

        _files.map((_file, i, list) => {
          if (_file.refType) {
            files.knowledgeAtt.push(_file);
          } else {
            files.attachments.push(_file);
          }

          files.attachmentData.push(_file);

          return null;
        });
      } catch (e) {
        //
      }
    }
    this.files = files;
  }

  /**
   * 上传状态发生变化
   */
  uploadStatuChanged = done => {
    $(this.target).data('uploading', !done);
  };

  /**
   * 上传文件发生变化
   */
  filesChanged = (files, key) => {
    this.files[key] = files;
    // 文件数量
    let length = 0;
    length += this.files.attachments.length;
    length += this.files.knowledgeAtt.length;

    const fileData = {
      attachments: [],
      knowledgeAtt: [],
      attachmentData: [],
    };

    if (this.hasAuth !== false) {
      fileData.attachments = this.files.attachments;
      fileData.knowledgeAtt = this.files.knowledgeAtt;
    } else {
      fileData.attachmentData = this.files.attachmentData;
    }

    $(this.target).data('files', JSON.stringify(fileData));
    $(this.target).data('files-length', length);

    $(this.target).closest('.customContents').find('.customFieldsLabel').removeClass('error');
  };

  /**
   * 开始事件监听
   */
  start() {
    if ($(this.target).hasClass('Hidden')) {
      return;
    }

    this.hasAuth = $(this.target).data('hasauth');

    const fileData = {
      attachments: [],
      knowledgeAtt: [],
      attachmentData: [],
    };

    if (this.hasAuth !== false) {
      fileData.attachments = this.files.attachments;
      fileData.knowledgeAtt = this.files.knowledgeAtt;
    } else {
      fileData.attachmentData = this.files.attachmentData;
    }

    ReactDOM.render(
      <UploadFiles
        isUpload={this.hasAuth !== false}
        isInitCall={true}
        showAttInfo={false}
        attachmentData={fileData.attachmentData}
        onUploadComplete={done => {
          this.uploadStatuChanged(done);
        }}
        temporaryData={fileData.attachments}
        onTemporaryDataUpdate={res => {
          this.filesChanged(res, 'attachments');
        }}
        kcAttachmentData={fileData.knowledgeAtt}
        previewHideFunctions={['editFileName', 'officeEdit']}
        onKcAttachmentDataUpdate={res => {
          this.filesChanged(res, 'knowledgeAtt');
        }}
      />,
      this.target,
    );
  }
}

export default FileUploaderHr;
