import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * 普通图片
 */
class NormalImg extends React.Component {
  static propTypes = {
    src: PropTypes.string.isRequired,
    placeholder: PropTypes.string, // 如果加载失败显示的图片
  };

  state = {
    src: this.props.src,
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      src: nextProps.src,
    });
  }

  onError = () => {
    this.setState({ src: this.props.placeholder });
  };

  render() {
    const attrs = _.assign({}, this.props, this.state);
    delete attrs.placeholder;
    return <img {...attrs} alt={attrs.alt} onError={!this.props.placeholder || this.state.src === this.props.placeholder ? undefined : this.onError} />;
  }
}

export default NormalImg;
