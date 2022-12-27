/**
 * 文件上传模块（任务）
 */
/**
 * 文件上传模块（任务）
 */
import React from 'react';

import ReactDOM from 'react-dom';
import UploadFiles from 'src/components/UploadFiles';
import Button from 'ming-ui/components/Button';

class FileUploaderTask {
  constructor(target, config, postUpdate) {
    /**
     * 元素 ID
     */
    this.target = target;
    /**
     * fileUploader
     */
    this.fileUploader = null;
    /**
     * uploading
     */
    this.uploading = false;
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
        files.attachmentData = JSON.parse(config.files);
      } catch (e) {
        //
      }
    }
    this.files = files;
    /**
     * postUpdate
     */
    let defaultPostUpdate = () => {};
    this.postUpdate = postUpdate || defaultPostUpdate;
  }

  /**
   * 上传状态发生变化
   */
  uploadStatuChanged = done => {
    $(this.target).data('uploading', !done);
    this.uploading = !done;
  };

  /**
   * 上传文件发生变化
   */
  filesChanged = (files, key) => {
    this.files[key] = files;

    this.render();
  };

  /**
   * 更新数据
   */
  update = attachmentData => {
    this.files = {
      attachments: [],
      knowledgeAtt: [],
      attachmentData,
    };

    this.render();
  };

  /**
   * 删除文件的回调
   */
  updateAttachmentData = data => {
    this.files.attachmentData = data;

    this.render();
  };

  /**
   * 取消
   */
  cancel = () => {
    this.files.attachments = [];
    this.files.knowledgeAtt = [];

    this.render();
  };

  /**
   * 确定
   */
  ok = () => {
    if (this.uploading) {
      alert(_l('文件上传中，请稍候'), 3);
      return;
    }

    const fileData = {
      attachments: this.files.attachments,
      knowledgeAtt: this.files.knowledgeAtt,
    };

    this.postUpdate($(this.target), fileData, this.update);

    this.files.attachments = [];
    this.files.knowledgeAtt = [];

    this.render();
  };

  /**
   * 开始事件监听
   */
  start() {
    this.render();
  }

  /**
   * 渲染组件
   */
  render() {
    this.hasAuth = $(this.target).data('hasauth');

    let uploader = null;
    if (this.hasAuth !== false) {
      uploader = (
        <UploadFiles
          canAddLink
          minWidth={140}
          isUpload={true}
          showAttInfo={false}
          isInitCall={true}
          attachmentData={[]}
          onUploadComplete={done => {
            this.uploadStatuChanged(done);
          }}
          temporaryData={this.files.attachments}
          onTemporaryDataUpdate={res => {
            this.filesChanged(res, 'attachments');
          }}
          kcAttachmentData={this.files.knowledgeAtt}
          onKcAttachmentDataUpdate={res => {
            this.filesChanged(res, 'knowledgeAtt');
          }}
        />
      );
    }

    let toolbar = null;
    if (this.files.attachments.length || this.files.knowledgeAtt.length) {
      toolbar = (
        <div
          style={{
            textAlign: 'right',
            padding: '4px 4px 15px 4px',
          }}
        >
          <Button
            size="small"
            type="link"
            style={{
              marginRight: '4px',
            }}
            onClick={(evt) => {
              evt.nativeEvent.stopImmediatePropagation();
              this.cancel();
            }}
          >
            {_l('取消')}
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={(evt) => {
              evt.nativeEvent.stopImmediatePropagation();
              this.ok();
            }}
          >
            {_l('确定')}
          </Button>
        </div>
      );
    }

    let fileList = null;
    if (this.files.attachmentData.length) {
      fileList = (
        <UploadFiles
          minWidth={140}
          isUpload={false}
          showAttInfo={false}
          isDeleteFile={this.hasAuth !== false}
          onDeleteAttachmentData={data => {
            this.updateAttachmentData(data);
          }}
          attachmentData={this.files.attachmentData}
        />
      );
    }

    ReactDOM.render(
      <div
        style={{
          flex: 1,
        }}
      >
        {uploader}
        {toolbar}
        {fileList}
      </div>,
      this.target
    );
  }
}

export default FileUploaderTask;
