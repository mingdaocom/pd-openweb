import React, { Component } from 'react';
import ReactDom from 'react-dom';
import cx from 'classnames';
import { assign } from 'lodash';
import PropTypes from 'prop-types';
import withClickAway from 'ming-ui/decorators/withClickAway';
import List from './List';
import './less/Menu.less';

@withClickAway
class Menu extends Component {
  static propTypes = {
    fixedHeader: PropTypes.any,
    parentMenuItem: PropTypes.any,
    isSubMenu: PropTypes.bool,
    con: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string,
    children: PropTypes.any,
    renderToTop: PropTypes.bool,
  };

  state = { pos: undefined };

  componentDidMount() {
    this.calcPos();
  }

  calcPos() {
    let { isAppendToBody, renderToTop } = this.props;
    const pos = {};
    if (this.props.isSubMenu) {
      const parentMenuItem = ReactDom.findDOMNode(this.props.parentMenuItem);
      const parentRect = parentMenuItem.getBoundingClientRect();
      pos.left =
        (parentRect.left + 2 * parentRect.width > Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
          ? '-'
          : '') + '100%';
      pos.top = parentMenuItem.offsetTop - parentMenuItem.parentElement.scrollTop;
    } else {
      const el = ReactDom.findDOMNode(this);
      const rect = el.getBoundingClientRect();
      let bodyRect = document.body.getBoundingClientRect();
      if (this.props.con) {
        bodyRect = document.querySelector(this.props.con).getBoundingClientRect();
      }
      if (rect.left + rect.width >= bodyRect.left + bodyRect.width) {
        pos.right = 0;
        pos.left = 'inherit';
      } else {
        pos.left = 0;
      }
      pos.top = '100%';
      /**
       * 当下方空间不够且上方空间足够时，在上方显示
       */
      if ((!isAppendToBody && window.innerHeight - rect.bottom < 0 && rect.top > rect.height) || renderToTop) {
        pos.bottom = '100%';
        pos.top = 'inherit';
      }
    }
    this.setState({ pos });
  }
  render() {
    let style = this.props.style || {};
    if (this.state.pos) {
      style = assign({}, this.state.pos, style);
    }
    const { fixedHeader, isAppendToBody, ...listProps } = this.props;

    if (fixedHeader) {
      return (
        <div className={cx('MenuBox', { Absolute: !isAppendToBody })}>
          {fixedHeader || null}
          <List
            {...listProps}
            style={style}
            className={cx(this.props.className, 'ming Menu', { 'Menu--subMenu': this.props.isSubMenu })}
          >
            {this.props.children}
          </List>
        </div>
      );
    }

    return (
      <List
        {...listProps}
        style={style}
        className={cx(this.props.className, 'ming Menu', { 'Menu--subMenu': this.props.isSubMenu })}
      >
        {this.props.children}
      </List>
    );
  }
}

export default Menu;
