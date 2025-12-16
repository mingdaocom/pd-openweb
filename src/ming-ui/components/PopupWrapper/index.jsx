import React, { memo } from 'react';
import { Popup } from 'antd-mobile';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import './index.less';

const PopupWrapper = ({
  visible,
  title = '',
  confirmDisable = false,
  confirmText,
  clearDisable = false,
  onClose,
  onBack,
  onConfirm,
  onClear,
  className = '',
  bodyClassName = '',
  bodyStyle = {},
  maskClassName = '',
  maskStyle = {},
  mask = true,
  headerType = 'default',
  headerTitleAlign = 'center',
  children,
}) => {
  const handleConfirm = () => {
    if (confirmDisable) return;
    onConfirm();
  };

  const handleClear = () => {
    if (clearDisable) return;
    onClear();
  };

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      className={`mobileModal mobilePopup ${className}`}
      bodyClassName={`popupWrapperBody ${bodyClassName}`}
      bodyStyle={bodyStyle}
      maskClassName={maskClassName}
      maskStyle={maskStyle}
      mask={mask}
    >
      <div className="popupWrapper">
        {headerType === 'default' && (
          <div className="popupHeaderBox ">
            {/* 中间：标题 */}
            <div className="popupTitle ellipsis">{title}</div>
            {/* 左侧：取消按钮 */}
            <div>
              {onClose && !onBack && (
                <span className="btnCancel" onClick={onClose}>
                  {_l('取消')}
                </span>
              )}
              {onBack && (
                <span className="btnBack" onClick={onBack}>
                  <Icon icon="arrow-left-border" />
                  {_l('返回')}
                </span>
              )}
            </div>
            {/* 右侧：确定和清除按钮 */}
            <div className="rightBtnBox">
              {onClear && (
                <span className={`btnClear ${clearDisable ? 'btnDisable' : ''}`} onClick={handleClear}>
                  {_l('清除')}
                </span>
              )}
              {onConfirm && (
                <span className={`btnConfirm ${confirmDisable ? 'btnDisable' : ''}`} onClick={handleConfirm}>
                  {confirmText || _l('确定')}
                </span>
              )}
            </div>
          </div>
        )}
        {headerType === 'withIcon' && (
          <div className={cx('popupHeaderBox', `justify-${headerTitleAlign}`)}>
            <div className={cx('ellipsis', `widthIconTitle-${headerTitleAlign}`)}>{title}</div>
            <div className="closeIcon">
              <Icon icon="close" onClick={onClose} />
            </div>
          </div>
        )}
        <div className="popupContentBox">{children}</div>
      </div>
    </Popup>
  );
};

PopupWrapper.propTypes = {
  visible: PropTypes.bool.isRequired,
  title: PropTypes.string,
  // 是否禁用确定按钮
  confirmDisable: PropTypes.bool,
  confirmText: PropTypes.string,
  // 是否禁用清楚按钮
  clearDisable: PropTypes.bool,
  // 取消
  onClose: PropTypes.func.isRequired,
  // 返回
  onBack: PropTypes.func,
  // 确认
  onConfirm: PropTypes.func,
  // 清除
  onClear: PropTypes.func,
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  bodyStyle: PropTypes.object,
  maskClassName: PropTypes.string,
  maskStyle: PropTypes.object,
  mask: PropTypes.bool,
  /**
   * 头部类型
   * default：默认，表单内弹层的较多
   * withIcon：带图标，即使用的是icon，一般视图用的较多
   * */
  headerType: PropTypes.oneOf(['default', 'withIcon']),
  // 使用withIcon时，标题对齐方式
  headerTitleAlign: PropTypes.oneOf(['left', 'center']),
  children: PropTypes.node,
};

export default memo(PopupWrapper);
