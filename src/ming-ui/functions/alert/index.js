import React from 'react';
import { message } from 'antd';
import { Toast } from 'antd-mobile';
import { browserIsMobile } from 'src/utils/common';

function getIcon(type = 'success', isMobile = false) {
  const config = {
    success: {
      name: 'Finish',
      color: '#4caf50',
    },
    error: {
      name: 'cancel',
      color: '#f44336',
    },
    warning: {
      name: 'error1',
      color: '#fb0',
    },
    info: {
      name: 'info',
      color: '#1c97f3',
    },
    loading: {
      name: 'loading_button',
      color: '#1c97f3',
    },
  };
  const icon = config[type];
  if (!icon) return null;

  const rotationStyle =
    type === 'loading'
      ? {
          display: 'inline-block',
          animation: 'spin 1s linear infinite',
        }
      : {};

  return (
    icon && (
      <i
        className={`icon-${icon.name}`}
        style={{
          fontSize: isMobile ? 48 : 18,
          ...(isMobile ? {} : { color: icon.color, marginRight: 6, top: 1, position: 'relative' }),
          ...rotationStyle,
        }}
      />
    )
  );
}

export function antAlert(content, alertType = 1) {
  const isReactNode = React.isValidElement(content);
  const isPlainValue = typeof content !== 'object' || isReactNode;

  // 统一参数
  const defaultOptions = {
    msg: '',
    type: alertType,
    duration: 3000,
    ...(isPlainValue ? { msg: content } : content),
  };
  const { msg, type, duration, onClose, key, style, isPcAlert } = defaultOptions;
  // 消息类型
  const func = ['success', 'error', 'warning', 'info', 'loading'][type - 1] || 'success';
  // 内容处理
  const contentValue = isReactNode ? msg : String(msg || '').replace(/(<([^>]+)>)/gi, '');

  const isMobile = browserIsMobile();

  // 部分情况需要在移动端使用antd的message
  if (isMobile && !isPcAlert) {
    const toastController = Toast.show({
      icon: getIcon(func, isMobile),
      content: contentValue,
      duration,
      afterClose: onClose,
    });
    return toastController;
  }

  message[func]({
    className: 'pcToast',
    icon: getIcon(func),
    content: contentValue,
    duration: duration / 1000,
    onClose,
    key,
    style,
  });
}

export function destroyAlert(key) {
  const isMobile = browserIsMobile();

  if (isMobile) {
    Toast.clear();
    return;
  }

  message.destroy(key);
}
