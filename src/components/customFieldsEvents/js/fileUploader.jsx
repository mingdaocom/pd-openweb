import React from 'react';
import FileUploaderHr from './fileUploaderHr';
import FileUploaderTask from './fileUploaderTask';

class FileUploader {
  constructor(target, config, postUpdate) {
    if (config && config.type === 'task') {
      return new FileUploaderTask(target, config, postUpdate);
    } else {
      return new FileUploaderHr(target, config);
    }
  }
}

export default FileUploader;
