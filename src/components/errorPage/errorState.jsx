import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import './errorPage.less';

export default class ErrorState extends Component {
  static propTypes = {
    text: PropTypes.string,
    showBtn: PropTypes.bool,
    className: PropTypes.string,
    iconClassName: PropTypes.string,
    btnText: PropTypes.string,
    callback: PropTypes.func,
  };

  static defaultProps = {
    text: '',
    btnText: _l('申请加入'),
    showBtn: false,
    callback: () => {},
  };

  constructor(props) {
    super(props);
  }

  render() {
    const { text, btnText, showBtn, callback, className, iconClassName } = this.props;

    return (
      <div className={cx('flexColumn noAuthContentBox', className)}>
        <i className={cx('icon-error1', iconClassName)} />
        <div className="Font17 mTop20">{text}</div>
        {showBtn ? (
          <span className="Font14 ThemeBGColor3 ThemeHoverBGColor2 noAuthJoin mTop25 pointer" onClick={callback}>
            {btnText}
          </span>
        ) : undefined}
      </div>
    );
  }
}
