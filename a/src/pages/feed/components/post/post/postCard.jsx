import _ from 'lodash';
import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * 动态基础卡片样式
 */
class PostCard extends React.Component {
  static propTypes = {
    component: PropTypes.any,
    className: PropTypes.string,
    children: PropTypes.any,
    leavingAnimation: PropTypes.oneOfType([
      PropTypes.shape({
        css: PropTypes.string,
        timeout: PropTypes.number,
      }),
      PropTypes.bool,
    ]),
  };

  state = { leaving: false };

  componentDidMount() {
    this.bindComponentWillLeave();
  }

  componentWillReceiveProps() {
    this.bindComponentWillLeave();
  }

  bindComponentWillLeave = () => {
    if (this.props.leavingAnimation) {
      const timeout = this.props.leavingAnimation.timeout;
      this.componentWillLeave = cb => {
        this.setState({ leaving: true });
        setTimeout(cb, timeout || 400);
      };
      this.leavingCss = this.props.leavingAnimation.css;
    } else {
      this.componentWillLeave = undefined;
      this.leavingCss = undefined;
    }
  };

  render() {
    const props = _.assign({}, this.props);
    props.className = cx(
      'card postCard clearfix',
      this.props.className,
      this.state.leaving ? this.leavingCss : undefined,
    );
    const component = props.component || 'div';
    delete props.component;
    delete props.leavingAnimation;
    return React.createElement(component, props, this.props.children);
  }
}

export default PostCard;
