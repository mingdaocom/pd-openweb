import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { Icon, Tooltip } from 'ming-ui';

export default class Support extends Component {
  static propTypes = {
    /**
     * 链接
     */
    href: PropTypes.string,
    /**
     * 文案
     */
    text: PropTypes.any,
    /**
     * 类型(1: 图标，2: 图标+文案， 3: 文案)
     */
    type: PropTypes.number,
    /**
     * 样式
     */
    className: PropTypes.string,
    style: PropTypes.object,
    title: PropTypes.string,
  };

  render() {
    const { href, text, type = 2, className, style, title } = this.props;

    if (md.global.SysSettings.hideHelpTip) return null;

    return (
      <span
        className={cx(
          'TxtMiddle pointer stopPropagation',
          type === 3 ? 'ThemeColor3 ThemeHoverColor2' : 'Gray_75 ThemeHoverColor3',
          className,
        )}
        style={Object.assign({}, { alignItems: 'center', display: 'inline-flex' }, style)}
        onClick={e => {
          e.preventDefault();
          window.open(
            md.global.Config.HelpUrl ? href.replace('https://help.mingdao.com', md.global.Config.HelpUrl) : href,
          );
        }}
      >
        {type < 3 && (
          <Tooltip disable={type > 1} popupPlacement="bottom" text={<span>{title || _l('使用帮助')}</span>}>
            <Icon icon="help" className="Font16" />
          </Tooltip>
        )}
        {type > 1 && <span className="mLeft5 Font13">{text}</span>}
      </span>
    );
  }
}
