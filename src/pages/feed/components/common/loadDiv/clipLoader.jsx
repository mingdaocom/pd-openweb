import { assign } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import './clipLoader.css';

/**
 * ------------------------------------------------------------------
 * Circular loading animation,
 * borrowed from https://github.com/yuanyan/halogen/blob/master/src/ClipLoader.js
 * added ThemeBorderColor
 * ------------------------------------------------------------------
 */
class Loader extends React.Component {
  static propTypes = {
    loading: PropTypes.bool,
    color: PropTypes.string,
    size: PropTypes.number,
    id: PropTypes.string,
    style: PropTypes.any,
    className: PropTypes.string,
  };

  static defaultProps = {
    loading: true,
    color: '#ffffff',
    size: 35,
  };

  getBallStyle = () => {
    return {
      width: this.props.size,
      height: this.props.size,
      border: '2px solid',
      borderColor: this.props.color,
      borderBottomColor: 'transparent !important',
      borderRadius: '100%',
      background: 'transparent !important',
    };
  };

  getAnimationStyle = (i) => {
    const animation = ['clipLoader', '0.75s', '0s', 'infinite', 'linear'].join(' ');
    const animationFillMode = 'both';

    return {
      MsAnimation: animation,
      MsAnimationFillMode: animationFillMode,
      WebkitAnimation: animation,
      WebkitAnimationFillMode: animationFillMode,
      OAnimation: animation,
      OAnimationFillMode: animationFillMode,
      MozAnimation: animation,
      MozAnimationFillMode: animationFillMode,
      animation,
      animationFillMode,
    };
  };

  getStyle = (i) => {
    return assign(this.getBallStyle(i), this.getAnimationStyle(i), {
      display: 'inline-block',
    });
  };

  /**
   * @param  {Boolean} loading
   * @return {ReactComponent || null}
   */
  renderLoader = (loading) => {
    if (loading) {
      return (
        <div id={this.props.id} style={assign({ height: this.props.size + 5 }, this.props.style)} className={this.props.className}>
          <div style={this.getStyle()} className="ThemeBorderColor3" />
        </div>
      );
    }
    return null;
  };

  render() {
    return this.renderLoader(this.props.loading);
  }
}

export default Loader;
