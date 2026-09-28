import React from 'react';
import { Toast } from 'antd-mobile';
import { GLOBAL_FEEDBACK_Z_INDEX, message } from 'ming-ui/antd-components';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import './index.less';

const pcAlertTimers = new Map();

function clearPcAlertTimer(key) {
  if (key !== undefined && key !== null) {
    const timer = pcAlertTimers.get(key);

    if (timer !== undefined) {
      clearTimeout(timer);
      pcAlertTimers.delete(key);
    }

    return;
  }

  pcAlertTimers.forEach(timer => clearTimeout(timer));
  pcAlertTimers.clear();
}

function resetPcAlertTimer(key, duration, onClose) {
  clearPcAlertTimer(key);
  const timer = setTimeout(() => {
    pcAlertTimers.delete(key);
    try {
      onClose?.();
    } finally {
      message.destroy(key);
    }
  }, duration);
  pcAlertTimers.set(key, timer);
}

function getIcon(type = 'success', isMobile = false) {
  const config = {
    success: {
      name: 'Finish',
      color: 'var(--color-success)',
    },
    error: {
      name: 'cancel',
      color: 'var(--color-error)',
    },
    warning: {
      name: 'error1',
      color: 'var(--color-warning)',
    },
    info: {
      name: 'info',
      color: 'var(--color-info)',
    },
    loading: {
      name: 'loading_button',
      color: 'var(--color-info)',
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
          ...(isMobile ? {} : { color: icon.color }),
          ...rotationStyle,
        }}
      />
    )
  );
}

export function antAlert(content, alertType = 1) {
  const isReactNode = React.isValidElement(content);
  const isPlainValue = typeof content !== 'object' || isReactNode;
  const isMobile = browserIsMobile();

  // 统一参数
  const defaultOptions = {
    msg: '',
    type: alertType,
    duration: isMobile ? 2000 : 3000,
    ...(isPlainValue ? { msg: content } : content),
  };
  const { msg, type, duration, onClose, key, style, isPcAlert } = defaultOptions;
  // 消息类型
  const func = ['success', 'error', 'warning', 'info', 'loading'][type - 1] || 'success';
  // 内容处理
  const contentValue = isReactNode ? msg : String(msg || '').replace(/(<([^>]+)>)/gi, '');

  // 部分情况需要在移动端使用antd的message
  if (isMobile && !isPcAlert) {
    const toastController = Toast.show({
      icon: getIcon(func, isMobile),
      content: contentValue,
      duration,
      afterClose: onClose,
      maskStyle: { zIndex: GLOBAL_FEEDBACK_Z_INDEX },
    });
    return toastController;
  }

  const hasKey = key !== undefined && key !== null;
  const shouldManageDuration = hasKey && Number.isFinite(duration) && duration > 0;

  const handleClose = () => {
    if (hasKey) {
      clearPcAlertTimer(key);
    }

    onClose?.();
  };

  if (hasKey) {
    clearPcAlertTimer(key);
  }

  message[func]({
    className: 'pcToast',
    icon: getIcon(func),
    content: contentValue,
    // antd 同 key 更新可能复用已结束的内部计时器，由 alert 统一重置 keyed message 的关闭时间
    duration: shouldManageDuration ? 0 : duration / 1000,
    pauseOnHover: false,
    onClose: hasKey ? handleClose : onClose,
    key,
    style,
  });

  if (shouldManageDuration) {
    resetPcAlertTimer(key, duration, handleClose);
  }
}

export function destroyAlert(key) {
  const isMobile = browserIsMobile();

  clearPcAlertTimer(key);

  if (isMobile) {
    Toast.clear();
    return;
  }

  message.destroy(key);
}
