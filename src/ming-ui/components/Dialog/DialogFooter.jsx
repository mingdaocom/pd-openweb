import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'ming-ui/components/Button';

class DialogFooter extends Component {
  render() {
    const {
      onCancel,
      cancelText,
      footer,
      onOk,
      okDisabled,
      okText,
      action,
      buttonType,
      confirm,
      showCancel,
      footerLeftElement,
    } = this.props;
    // 默认尾部
    const defaultFooter = (
      <div className="mui-dialog-footer flexRow">
        {footerLeftElement && footerLeftElement()}
        <div className="flex">
          {showCancel && (
            <Button type="link" onClick={onCancel}>
              {cancelText}
            </Button>
          )}
          <Button
            disabled={okDisabled}
            type={buttonType || confirm || 'primary'}
            onClick={onOk}
            action={action}
            data-id="confirmBtn"
          >
            {okText}
          </Button>
        </div>
      </div>
    );
    // 如果未定义footer使用默认的footer
    if (footer === undefined) {
      return defaultFooter;
    }
    if (footer) {
      return (
        <div className="mui-dialog-footer flexRow">
          {footerLeftElement && footerLeftElement()}
          <div className="flex">{footer}</div>
        </div>
      );
    }
    return footer;
  }
}

DialogFooter.propTypes = {
  okDisabled: PropTypes.bool,
  buttonType: PropTypes.string,
  cancelText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  okText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  action: PropTypes.func,
  footer: PropTypes.node,
};

export default DialogFooter;
