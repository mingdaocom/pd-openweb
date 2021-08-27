import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDom from 'react-dom';
import cx from 'classnames';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import withClickAway from 'ming-ui/decorators/withClickAway';
import './less/Drawer.less';

const propTypes = {
  key: PropTypes.string,
  children: PropTypes.any,
  style: PropTypes.object,
  className: PropTypes.string,
  open: PropTypes.bool,
  onRequestClose: PropTypes.func,
};

@withClickAway
class DrawerContent extends Component {
  static propTypes = propTypes;

  render() {
    return (
      <div style={this.props.style} className={cx('ming Drawer', this.props.className)}>
        {this.props.children}
      </div>
    );
  }
}

class Drawer extends Component {
  static propTypes = propTypes;

  render() {
    return (
      <ReactCSSTransitionGroup transitionName="Drawer" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
        {this.props.open && (
          <DrawerContent key={this.props.key || 'DrawerContent'} onClickAway={() => this.props.onRequestClose && this.props.onRequestClose()} {...this.props} />
        )}
      </ReactCSSTransitionGroup>
    );
  }
}

export default Drawer;
