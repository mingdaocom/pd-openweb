import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import { UPLOAD_STATUS } from 'src/pages/kc/constant/enum';

export default class UploadProgress extends React.Component {
  static propTypes = {
    status: PropTypes.number,
    percentage: PropTypes.number, // 百分比，1 === 100%
    errorText: PropTypes.string,
  };

  render() {
    const { status, errorText } = this.props;
    let percentage = (parseInt(this.props.percentage * 100, 10) || 0) + '%';
    let colorClass, text, icon;

    switch (status) {
      case UPLOAD_STATUS.COMPLETE:
        percentage = '100%';
        colorClass = 'bgSuccess';
        text = _l('上传成功');
        icon = <Icon className="uploadPercentageText fgSuccess" icon="ok" />;
        break;
      case UPLOAD_STATUS.ERROR:
        colorClass = 'bgError';
        text = errorText || '上传失败';
        icon = <Icon className="uploadPercentageText fgError" icon="delete" />;
        break;
      case UPLOAD_STATUS.UPLOADING:
        colorClass = 'ThemeBGColor3';
        text = percentage === '100%' ? _l('即将完成') : _l('上传中');
        icon = <span className="uploadPercentageText">{percentage}</span>;
        break;
      case UPLOAD_STATUS.QUEUE:
      default:
        colorClass = 'ThemeBGColor3';
        text = _l('排队中');
        icon = <span className="uploadPercentageText">{percentage}</span>;
        break;
    }

    return (
      <div className="uploadPercentage" title={text}>
        <div className="progressContainer">
          <div
            className={cx('progressBar', colorClass)}
            style={{ height: '100%', width: status === UPLOAD_STATUS.ERROR ? '100%' : percentage }}
          />
        </div>
        {icon}
        <div className="progressTitle">{text}</div>
      </div>
    );
  }
}
