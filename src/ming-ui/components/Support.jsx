import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import { Icon, Tooltip } from 'ming-ui';

/**
 * Get the effective help URL, taking into account md.global.Config.HelpUrl for backwards compatibility
 * @param {string} href - The original help URL
 * @returns {string} - The effective help URL
 */
function getEffectiveHelpUrl(href) {
  if (!href) return '';
  
  // If md.global.Config.HelpUrl is defined, replace the base domain
  if (typeof md !== 'undefined' && md.global && md.global.Config && md.global.Config.HelpUrl) {
    return href.replace('https://help.mingdao.com', md.global.Config.HelpUrl);
  }
  
  return href;
}

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

    if (typeof md !== 'undefined' && md.global && md.global.SysSettings && md.global.SysSettings.hideHelpTip) return null;

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
          window.open(getEffectiveHelpUrl(href));
        }}
      >
        {type < 3 && (
          <Tooltip disable={type > 1} popupPlacement="bottom" text={<span>{title || _l('使用帮助')}</span>}>
            <Icon icon="workflow_help" className="Font16" />
          </Tooltip>
        )}
        {type > 1 && <span className="mLeft5 Font13">{text}</span>}
      </span>
    );
  }
}
