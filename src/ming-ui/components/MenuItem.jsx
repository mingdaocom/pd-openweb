import React, { cloneElement, Component } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import Item from './Item';
import './less/MenuItem.less';

class MenuItem extends Component {
  static propTypes = {
    icon: PropTypes.element,
    iconAtEnd: PropTypes.bool,
    subMenu: PropTypes.element,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onClick: PropTypes.func,
    className: PropTypes.string,
    children: PropTypes.any,
    disabled: PropTypes.bool, // 是否禁用
  };

  state = {
    showSubMenu: false,
  };

  handleMouseEnter(...args) {
    this.setState({ showSubMenu: true });
    if (this.props.onMouseEnter) {
      this.props.onMouseEnter.apply(this, args);
    }
  }
  handleMouseLeave(...args) {
    this.setState({ showSubMenu: false });
    if (this.props.onMouseLeave) {
      this.props.onMouseLeave.apply(this, args);
    }
  }

  render() {
    let { subMenu } = this.props;
    if (subMenu) {
      subMenu = cloneElement(subMenu, {
        isSubMenu: true,
        parentMenuItem: this,
        className: cx({ hide: !this.state.showSubMenu }, subMenu.props.className),
      });
    }
    return (
      <Item
        {...this.props}
        className={cx(this.props.className, 'ming MenuItem', { 'MenuItem--withSubMenu': subMenu })}
        subMenu={subMenu}
        onMouseEnter={() => this.handleMouseEnter()}
        onMouseLeave={() => this.handleMouseLeave()}
        disabled={this.props.disabled}
      >
        {this.props.children}
      </Item>
    );
  }
}

export default MenuItem;
