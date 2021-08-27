import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export default class Portal extends Component {
  static propTypes = {
    children: PropTypes.node,
  };

  componentDidMount() {
    this._renderOverlay();
  }

  componentDidUpdate() {
    this._renderOverlay();
  }

  componentWillUnmount() {
    this._unrenderOverlay();
    this._unmountOverlayTarget();
  }

  _mountOverlayTarget = () => {
    if (!this._overlayTarget) {
      this._overlayTarget = document.createElement('div');
      this._portalContainerNode = document.body;
      this._portalContainerNode.appendChild(this._overlayTarget);
    }
  };

  _unmountOverlayTarget = () => {
    if (this._overlayTarget) {
      this._portalContainerNode.removeChild(this._overlayTarget);
      this._overlayTarget = null;
    }
    this._portalContainerNode = null;
  };

  _renderOverlay = () => {
    const overlay = !this.props.children ? null : React.Children.only(this.props.children);

    if (overlay !== null) {
      this._mountOverlayTarget();
      this._overlayInstance = ReactDOM.createPortal(overlay, this._overlayTarget);
    } else {
      this._unrenderOverlay();
      this._unmountOverlayTarget();
    }
  };

  _unrenderOverlay = () => {
    if (this._overlayTarget) {
      ReactDOM.unmountComponentAtNode(this._overlayTarget);
      this._overlayInstance = null;
    }
  };

  render() {
    return null;
  }
}
