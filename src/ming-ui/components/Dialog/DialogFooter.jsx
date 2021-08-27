import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import Button from 'ming-ui/components/Button';

class DialogFooter extends Component {
  render() {
    const { onCancel, cancelText, footer, onOk, okDisabled, okText, action, buttonType, confirm } = this.props;
    // 默认尾部
    const defaultFooter = (
      <div className="mui-dialog-footer">
        <Button type="link" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button disabled={okDisabled} type={buttonType || confirm || 'primary'} onClick={onOk} action={action}>
          {okText}
        </Button>
      </div>
    );
    // 如果未定义footer使用默认的footer
    if (footer === undefined) {
      return defaultFooter;
    }
    if (footer) {
      return <div className="mui-dialog-footer">{footer}</div>;
    }
    return footer;
  }
}

DialogFooter.propTypes = {
  okDisabled: PropTypes.bool,
  buttonType: PropTypes.string,
  cancelText: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]),
  okText: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]),
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  action: PropTypes.func,
  footer: PropTypes.node,
};

export default DialogFooter;
