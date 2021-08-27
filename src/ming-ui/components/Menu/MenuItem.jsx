import React, { Component, cloneElement } from 'react';
import PropTypes from 'prop-types';

import cx from 'classnames';
import { connect } from 'mini-store';
import Item from '../Item';

import { noop, menuAllProps } from './util';
import '../less/MenuItem.less';

export default class MenuItem extends Component {
  static propTypes = {
    icon: PropTypes.element,
    iconAtEnd: PropTypes.bool,
    disabled: PropTypes.bool,
    eventKey: PropTypes.string,

    closeAll: PropTypes.func,
    onClick: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    className: PropTypes.string,

    children: PropTypes.any,
  };

  static defaultProps = {
    onClick: noop,
    onMouseEnter: noop,
    onMouseLeave: noop,
    closeAll: noop,
  };

  clickHandler = (e) => {
    if (this.props.disabled) return;
    this.props.onClick();
    this.props.closeAll();
    e.stopPropagation();
  };

  render() {
    let { className, ...props } = this.props;
    className = cx(className, 'ming MenuItem');
    props = {
      ...props,
      className,
    };

    menuAllProps.forEach(key => delete props[key]);

    const mouseEvent = {
      onClick: this.clickHandler,
      onMouseLeave: props.disabled ? null : props.onMouseLeave,
      onMouseEnter: props.disabled ? null : props.onMouseEnter,
    };
    return (
      <Item {...props} {...mouseEvent}>
        {this.props.children}
      </Item>
    );
  }
}
