import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { connect } from 'mini-store';

import List from '../List';
import { getEventKey, getKeyFromChildrenIndex } from './util';

class PopupMenu extends React.Component {
  static porpTypes = {
    children: PropTypes.any,
    className: PropTypes.string,
    store: PropTypes.shape({
      getState: PropTypes.func,
      setState: PropTypes.func,
    }),

    defaultOpenKeys: PropTypes.arrayOf(PropTypes.string),
    openKeys: PropTypes.arrayOf(PropTypes.string),
    mode: PropTypes.oneOf(['vertical-left', 'vertical-right']),

    eventKey: PropTypes.string,
    level: PropTypes.number,

    onClick: PropTypes.func,
    onOpenChange: PropTypes.func,
    closeAll: PropTypes.func,
    parentMenu: PropTypes.element,

    subMenuCloseDelay: PropTypes.number,
    subMenuOpenDelay: PropTypes.number,
    triggerSubMenuAction: PropTypes.oneOf(['click', 'hover']),
  };

  static defaultProps = {
    className: '',
    mode: 'vertical-left',
    level: 1,
    visible: true,
    eventKey: '0-menu-',
  };

  renderCommonMenuItem = (child, i, extraProps) => {
    const state = this.props.store.getState();
    const props = this.props;
    const key = getKeyFromChildrenIndex(child, props.eventKey, i);
    const childProps = child.props;
    const newChildProps = {
      index: i,
      level: props.level,
      mode: props.mode,
      renderMenuItem: this.renderMenuItem,
      parentMenu: props.parentMenu,
      eventKey: key,
      onOpenChange: props.onOpenChange,
      closeAll: props.closeAll,
      subMenuOpenDelay: props.subMenuOpenDelay,
      subMenuCloseDelay: props.subMenuCloseDelay,
      ...extraProps,
    };
    return React.cloneElement(child, newChildProps);
  };

  renderMenuItem = (c, i, subMenuKey) => {
    if (!c) return null;
    const state = this.props.store.getState();
    const extraProps = {
      subMenuKey,
      openKeys: state.openKeys,
      triggerSubMenuAction: this.props.triggerSubMenuAction,
    };
    return this.renderCommonMenuItem(c, i, extraProps);
  };

  render() {
    const { ...props } = this.props;
    const { eventKey } = props;

    return (
      <List className={props.className}>
        {React.Children.map(props.children, (comp, index) => {
          return this.renderMenuItem(comp, index, eventKey);
        })}
      </List>
    );
  }
}

export default connect()(PopupMenu);
