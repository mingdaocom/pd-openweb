import React from 'react';
import uploadNewVersionDailog from './kcUploadNewVersion/kcUploadNewVersion';
import service from '../api/service';
import createUploader from 'src/library/plupload/createUploader';
import { UPLOAD_ERROR } from '../constant/enum';
import RegExpValidator from 'src/util/expression';
class UploadNewVersion extends React.Component {
  static propTypes() {
    return {
      item: React.propTypes.object,
      callback: React.propTypes.func,
    };
  }

  componentDidMount() {
    const _this = this;
    const MAX_FILE_COUNT = 1;
    this.uploader = createUploader({
      runtimes: 'html5',
      max_file_count: MAX_FILE_COUNT,
      browse_button: this.con,
      multi_selection: false,
      error_callback(errorType, errorFiles) {
        switch (errorType) {
          case UPLOAD_ERROR.TOO_MANY_FILES:
            alert(_l('支持每次选择%0个文件，超过的请您分批次选择', MAX_FILE_COUNT));
            break;
          case UPLOAD_ERROR.INVALID_FILES:
            alert(_l('%0个文件格式不被支持，没有加入上传队列', errorFiles.length));
            break;
          default:
            break;
        }
      },
      before_upload_check: (up, files) =>
        service.getUsage().then(usage => {
          if (usage.used + files.reduce((total, file) => total + (file.size || 0), 0) > usage.total) {
            return Promise.reject(_l('选择的文件超过本月上传流量上限'));
          }
        }),
      init: {
        FilesAdded(up, files) {
          console.log('FilesAdded');
          const item = _this.props.item;
          const file = files[0];
          const targetFileExt = item.ext;
          const newVersionExt = RegExpValidator.getExtOfFileName(file.name);
          if (RegExpValidator.fileIsPicture('.' + targetFileExt)) {
            if (!RegExpValidator.fileIsPicture('.' + newVersionExt)) {
              alert(_l('请选择图片文件'), 3);
              up.setOption('auto_start', false);
              return;
            }
          } else if (newVersionExt.toLowerCase() !== targetFileExt.toLowerCase()) {
            alert(_l('请选择相同格式的文件'), 3);
            up.setOption('auto_start', false);
            return;
          }
          up.setOption('auto_start', true);
          up.splice(0, up.files.length - 1);
          _this.dialog = uploadNewVersionDailog(item, file, _this.props.callback);
        },
        Error(up, err, errTip) {},
        UploadProgress(up, file) {
          _this.dialog.setProcess((file.loaded / file.size) * 100);
        },
        FileUploaded(up, file, info) {
          _this.dialog.uploaded(info.response);
        },
      },
    });
  }

  render() {
    return (
      <span
        className="newVersionFile"
        ref={con => {
          this.con = con;
        }}
      />
    );
  }
}

export default UploadNewVersion;
