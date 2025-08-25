import React from 'react';
import PropTypes from 'prop-types';
import getSpecificComponent from './factory';

class PostComponent extends React.Component {
  static propTypes = {
    postItem: PropTypes.object,
    isReshare: PropTypes.bool,
  };

  render() {
    return getSpecificComponent(this.props.postItem, this.props.isReshare);
  }
}

export default PostComponent;
