import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'mini-store';

import Trigger from 'rc-trigger';
import cx from 'classnames';

import placements from './placements';
import PopupMenu from './PopupMenu';
import Item from '../Item';
import { noop } from './util';

const popupPlacementMap = {
  'vertical-left': 'rightTop',
  'vertical-right': 'leftTop',
};

const mainPopupPlacementMap = {
  'vertical-left': 'bottomLeft',
  'vertical-right': 'bottomRight',
};

class SubMenu extends React.Component {
  static defaultProps = {
    onMouseEnter: noop,
    onMouseLeave: noop,
    onTitleMouseEnter: noop,
    onTitleMouseLeave: noop,
    onTitleClick: noop,
    onOpenChange: noop,
    level: 1,
    title: '',
  };

  triggerOpenChange = (open, type) => {
    const key = this.props.eventKey;
    const openChange = () => {
      this.props.onOpenChange({
        key,
        item: this,
        trigger: type,
        open,
      });
    };
    if (type === 'mouseenter') {
      this.mouseenterTimeout = setTimeout(() => {
        openChange();
      }, 0);
    } else {
      openChange();
    }
  };

  onTitleMouseEnter = domEvent => {
    const { eventKey, onTitleMouseEnter } = this.props;
    onTitleMouseEnter({
      key: eventKey,
      domEvent,
    });
  };

  onTitleMouseLeave = e => {
    const { eventKey, onTitleMouseLeave } = this.props;
    onTitleMouseLeave({
      key: eventKey,
      domEvent: e,
    });
  };

  onTitleClick = e => {
    const { props } = this;
    props.onTitleClick({
      key: props.eventKey,
      domEvent: e,
    });
    if (props.triggerSubMenuAction === 'hover') {
      return;
    }
    this.triggerOpenChange(!props.isOpen, 'click');
  };

  onPopupVisibleChange = visible => {
    this.triggerOpenChange(visible, visible ? 'mouseenter' : 'mouseleave');
  };

  renderChildren(children) {
    const props = this.props;
    const baseProps = {
      mode: 'vertical-left',
      visible: this.props.isOpen,
      level: props.level + 1,
      eventKey: `${props.eventKey}-menu-`,
      openKeys: props.openKeys,
      parentMenu: this,
      prefixCls: props.rootPrefixCls,
      onOpenChange: props.onOpenChange,
      closeAll: props.closeAll,
      triggerSubMenuAction: props.triggerSubMenuAction,
    };
    const haveRendered = this.haveRendered;
    this.haveRendered = true;

    this.haveOpened = this.haveOpened || baseProps.visible;
    if (!this.haveOpened) return <div />;

    return <PopupMenu {...baseProps}>{children}</PopupMenu>;
  }

  render() {
    const props = { ...this.props };
    const isOpen = props.isOpen;
    const prefixCls = '';

    let mouseEvents = {};
    let titleClickEvents = {};
    let titleMouseEvents = {};

    if (!props.disabled) {
      mouseEvents = {
        onMouseLeave: this.onMouseLeave,
        onMouseEnter: this.onMouseEnter,
      };

      titleClickEvents = {
        onClick: this.onTitleClick,
      };
      titleMouseEvents = {
        onMouseEnter: this.onTitleMouseEnter,
        onMouseLeave: this.onTitleMouseLeave,
      };
    }

    let title;
    if (props.eventKey === 'main') {
      title = props.title;
    } else {
      title = (
        <Item className={cx('MenuItem--withSubMenu', 'ming MenuItem')} {...titleMouseEvents} {...titleClickEvents}>
          {props.title}
        </Item>
      );
    }

    const children = this.renderChildren(props.children);

    const getPopupContainer = props.parentMenu.isRootMenu ? props.parentMenu.props.getPopupContainer : triggerNode => triggerNode.parentNode;
    const popupAlign = props.popupOffset ? { offset: props.popupOffset } : {};
    let popupPlacement = popupPlacementMap[props.mode];

    if (props.eventKey === 'main') {
      popupPlacement = mainPopupPlacementMap[props.mode];
    }

    let action = props.disabled ? [] : [props.triggerSubMenuAction];
    if (props.level === 1) {
      action = ['click'];
    }

    return (
      <Trigger
        prefixCls={'Menu'}
        popupClassName={cx('ming', props.className)}
        getPopupContainer={getPopupContainer}
        builtinPlacements={placements}
        popupPlacement={popupPlacement}
        popupVisible={isOpen}
        popupAlign={popupAlign}
        popup={children}
        action={action}
        onPopupVisibleChange={this.onPopupVisibleChange}
      >
        {title}
      </Trigger>
    );
  }
}

export default connect(({ openKeys }, { eventKey }) => ({
  isOpen: openKeys.indexOf(eventKey) !== -1,
}))(SubMenu);
