import React, { Component } from 'react';
import cx from 'classnames';
import { assign } from 'lodash';
import PropTypes from 'prop-types';
import ClickAway from 'ming-ui/components/ClickAway';
import List from './List';
import './less/Menu.less';

let Menu = class Menu extends Component {
  static propTypes = {
    fixedHeader: PropTypes.any,
    parentMenuItem: PropTypes.any,
    isSubMenu: PropTypes.bool,
    con: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string,
    children: PropTypes.any,
    renderToTop: PropTypes.bool,
    parentMenuItemNode: PropTypes.any,
    getParentMenuItemNode: PropTypes.func,
    subMenuVisible: PropTypes.bool,
  };
  state = {
    pos: undefined,
  };

  componentDidMount() {
    this.calcPos();
  }

  componentDidUpdate(prevProps) {
    // 二级菜单是父 MenuItem <li> 的子节点，React 先跑子节点的 layout effect 再挂父节点的 ref，
    // 所以它 mount 时还拿不到父菜单项 DOM，calcPos 会跳过定位、菜单退化成静态定位显示在下方。
    // 这里在二级菜单由隐藏切到显示时再算一次，既能拿到父节点，也能跟上父菜单的滚动位置。
    if (this.props.isSubMenu && this.props.subMenuVisible && !prevProps.subMenuVisible) {
      this.calcPos();
    }
  }

  setMenuNode = node => {
    this.menuNode = node;
  };

  // 非 fixedHeader 时 List 的 setRef 用于 Menu 自身定位，但会覆盖调用方透传的 setRef。
  // 这里合并两者：既记录用于 calcPos 的 menuNode，又把同一节点回传给调用方的 setRef。
  // 调用方的 setRef 可能是 React.createRef() 的 ref 对象，也可能是回调函数，两者都兼容。
  setListRef = node => {
    this.setMenuNode(node);
    const { setRef } = this.props;

    if (!setRef) {
      return;
    }

    if (typeof setRef === 'function') {
      setRef(node);
    } else {
      setRef.current = node;
    }
  };

  calcPos() {
    let { isAppendToBody, renderToTop } = this.props;
    const pos = {};

    if (this.props.isSubMenu) {
      const parentMenuItem =
        this.props.parentMenuItemNode || (this.props.getParentMenuItemNode ? this.props.getParentMenuItemNode() : null);

      if (!parentMenuItem) {
        return;
      }

      const parentRect = parentMenuItem.getBoundingClientRect();
      pos.left =
        (parentRect.left + 2 * parentRect.width > Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
          ? '-'
          : '') + '100%';
      pos.top = parentMenuItem.offsetTop - parentMenuItem.parentElement.scrollTop;
    } else {
      const el = this.menuNode;

      if (!el) {
        return;
      }

      const rect = el.getBoundingClientRect();
      let bodyRect = document.body.getBoundingClientRect();

      if (this.props.con) {
        const conEl = document.querySelector(this.props.con);
        if (conEl) bodyRect = conEl.getBoundingClientRect();
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

    this.setState({
      pos,
    });
  }

  render() {
    let style = this.props.style || {};

    if (this.state.pos) {
      style = assign({}, this.state.pos, style);
    }

    const { fixedHeader, isAppendToBody } = this.props;
    const listProps = { ...this.props };
    delete listProps.fixedHeader;
    delete listProps.isAppendToBody;
    delete listProps.parentMenuItem;
    delete listProps.parentMenuItemNode;
    delete listProps.getParentMenuItemNode;
    delete listProps.subMenuVisible;

    if (fixedHeader) {
      return (
        <div
          ref={this.setMenuNode}
          className={cx('MenuBox', {
            Absolute: !isAppendToBody,
          })}
        >
          {fixedHeader || null}
          <List
            {...listProps}
            style={style}
            className={cx(this.props.className, 'ming Menu', {
              'Menu--subMenu': this.props.isSubMenu,
            })}
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
        setRef={this.setListRef}
        className={cx(this.props.className, 'ming Menu', {
          'Menu--subMenu': this.props.isSubMenu,
        })}
      >
        {this.props.children}
      </List>
    );
  }
};
Menu = ClickAway.wrap(Menu);
export default Menu;
