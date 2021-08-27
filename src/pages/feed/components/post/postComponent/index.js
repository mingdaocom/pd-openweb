import React from 'react';
import { getSpecificComponent } from './factory';
import PropTypes from 'prop-types';

class PostComponent extends React.Component {
  static propTypes = {
    postItem: PropTypes.object,
    isReshare: PropTypes.bool,
  };

  render() {
    return getSpecificComponent(this.props.postItem, this.props.isReshare);
  }
}

module.exports = PostComponent;
