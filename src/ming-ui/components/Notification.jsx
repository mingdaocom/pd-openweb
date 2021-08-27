/* eslint-disable */
/* eslint-disable */
/* eslint-disable */
/* eslint-disable */
import React, { Component } from 'react';
import Notification from 'rc-notification';
import cx from 'classnames';
import './less/Notification.less';

export class NotificationContent extends Component {
  constructor(props) {
    super(props);
  }
  getThemeColor(themeColor) {
    switch (themeColor) {
      case 'success':
        themeColor = '#43bd36';
        break;
      case 'error':
        themeColor = 'red';
        break;
      default:
        return '#fff';
    }
    return themeColor;
  }
  render() {
    const { header, content, footer, className, themeColor, showClose, onClose } = this.props;
    return (
      <div className={cx('ming Notification Notification-wrapper', className)} style={{ borderColor: this.getThemeColor(themeColor) }}>
        {showClose && (
          <span className="closeIcon" onClick={onClose}>
            <i className="icon-close"></i>
          </span>
        )}
        <div className="Notification-header">{header}</div>
        <div className="Notification-content">{content}</div>
        { footer && <div className="Notification-footer">{footer}</div> }
      </div>
    );
  }
}

let notificationObj = undefined;

const getPlacementStyle = placement => {
  let style;
  let defaultTop = 20;
  let defaultBottom = 20;
  switch (placement) {
    case 'topLeft':
      style = {
        left: 0,
        top: defaultTop,
      };
      break;
    case 'topRight':
      style = {
        right: 0,
        top: defaultTop,
      };
      break;
    case 'bottomRight':
      style = {
        right: 0,
        bottom: 0,
      };
      break;
    default:
      style = {
        left: 0,
        bottom: 0,
      };
      break;
  }
  return style;
};

export const notification = {
  keys: {},
  open: config => {
    if (typeof notificationObj == 'undefined') {
      Notification.newInstance(
        {
          style: getPlacementStyle(config.placement),
          ...config,
        },
        n => {
          notificationObj = n;
          notificationObj.notice(config);
        }
      );
    } else {
      notificationObj.notice(config);
    }
    notification.keys[config.key] = config.key;
  },
  close: key => {
    notificationObj && notificationObj.removeNotice(key);
    delete notification.keys[key];
  },
  get: () => {
    return notificationObj;
  },
  is: key => {
    return notification.keys[key];
  },
};
