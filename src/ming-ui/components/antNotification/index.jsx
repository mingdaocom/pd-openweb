import React from 'react';
import { notification } from 'antd';
import cx from 'classnames';
import styled from 'styled-components';
import './index.less';

const DefaultBtn = styled.div`
  max-width: 120px;
  padding: 0 12px;
  line-height: 32px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  color: #2196f3;
  text-align: center;
  cursor: pointer;
  &:hover {
    background: #f5f5f5;
  }
`;

const defaultClass = 'mdNotification';

const defaultProps = {
  placement: 'bottomLeft',
  duration: 5,
  bottom: 30,
};

function getIconName(type = 'success') {
  return (
    {
      success: 'check_circle1',
      error: 'cancel1',
      warning: 'error1',
      info: 'info1',
    }[type] || ''
  );
}

const getProps = (props, type = 'success') => {
  const { className, btnText, onBtnClick, loading, message, description, ...rest } = props;

  const getIcon = () => {
    if (loading) {
      return (
        <div className="notificationIconWrap">
          <i className="icon-loading_button"></i>
        </div>
      );
    }
    return <i className={`${type} icon-${getIconName(type)}`}></i>;
  };
  // 如果使用默认样式，传入按钮文字, 否则传入自定义按钮
  return {
    ...defaultProps,
    btn: btnText ? <DefaultBtn onClick={onBtnClick}>{btnText}</DefaultBtn> : null,
    icon: getIcon(),
    ...rest,
    message: message && (
      <div className="ellipsis" title={message}>
        {message}
      </div>
    ),
    description: description && (
      <div className="antNotificationDescription" title={description}>
        {description}
      </div>
    ),
    className: cx(defaultClass, type, className),
    closeIcon: <i className="closeNotice icon-close"></i>,
  };
};

const antNotification = {
  ...notification,
  success(props) {
    return notification.success(getProps(props, 'success'));
  },
  error(props) {
    return notification.error(getProps(props, 'error'));
  },
  info(props) {
    return notification.info(getProps(props, 'info'));
  },
  warn(props) {
    return notification.warn(getProps(props, 'warning'));
  },
  warning(props) {
    return notification.warn(getProps(props, 'warning'));
  },
};

export default antNotification;
