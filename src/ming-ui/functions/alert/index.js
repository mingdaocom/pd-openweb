import React from 'react';
import { message } from 'antd';

function getIcon(type = 'success') {
  const config = {
    success: {
      name: 'succeed-circle',
      color: '#4caf50',
      fontSize: 16,
    },
    error: {
      name: 'cancel',
      color: '#f44336',
      fontSize: 18,
    },
    warning: {
      name: 'error1',
      color: '#fb0',
      fontSize: 18,
    },
    info: {
      name: 'info',
      color: '#1c97f3',
      fontSize: 18,
    },
  };
  const icon = config[type];
  return (
    icon && (
      <i
        className={`icon-${icon.name}`}
        style={{
          fontSize: icon.fontSize,
          color: icon.color,
          marginRight: 6,
          top: 1,
          position: 'relative',
        }}
      />
    )
  );
}

export function antAlert(msg, type = 1, timeout = 3000, callback, key, style) {
  if (msg !== null && typeof msg === 'object' && !msg.props) {
    type = msg.type || 1;
    timeout = msg.timeout || 3000;
    callback = msg.callback;
    key = msg.key;
    msg = msg.msg;
  }

  const func = ['success', 'error', 'warning', 'info', 'loading'][type - 1] || 'success';
  message[func]({
    className: 'pcToast',
    icon: getIcon(func),
    content: msg.props ? msg : String(msg || '').replace(/(<([^>]+)>)/gi, ''),
    duration: timeout / 1000,
    onClose: callback,
    key,
    style,
  });
}

export function destroyAlert(key) {
  message.destroy(key);
}
