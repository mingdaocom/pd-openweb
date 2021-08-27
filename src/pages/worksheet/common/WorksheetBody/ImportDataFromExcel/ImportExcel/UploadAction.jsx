import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import { UPLOAD_STATUS } from 'src/pages/kc/constant/enum';

export default class UploadAction extends React.Component {
  static propTypes = {
    status: PropTypes.number,
    cancelUpload: PropTypes.func,
    retryUpload: PropTypes.func,
    deleteFile: PropTypes.func,
  };

  render() {
    const { status, cancelUpload, retryUpload, deleteFile } = this.props;
    let show = true;
    let icon, action, title;

    switch (status) {
      case UPLOAD_STATUS.ERROR:
        icon = <Icon icon="turnLeft" />;
        title = _l('重试');
        action = retryUpload;
        break;
      case UPLOAD_STATUS.QUEUE:
      case UPLOAD_STATUS.UPLOADING:
        icon = <span className="textIcon">×</span>;
        title = _l('取消');
        action = cancelUpload;
        break;
      case UPLOAD_STATUS.COMPLETE:
        icon = <span className="textIcon">×</span>;
        title = _l('删除');
        action = deleteFile;
        break;
      default:
        show = false;
        break;
    }

    return (
      show && (
        <div className="fileListActionBtn Hand ThemeHoverColor3" title={title} icon={icon} onClick={action}>
          {icon}
        </div>
      )
    );
  }
}
