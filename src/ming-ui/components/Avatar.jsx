import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import './less/Avatar.less';

export default class Avatar extends Component {
  static propTypes = {
    src: PropTypes.string,
    size: PropTypes.number,
    shape: PropTypes.string,
  };
  static defaultProps = {
    src: 'http://tuku-image.oss-cn-beijing.aliyuncs.com/18-5-28/13392370.jpg',
    size: 36,
    shape: 'circle',
  };
  constructor(props) {
    super(props);
  }
  render() {
    const { src, shape, size, className } = this.props;
    return (
      <span style={{ width: size, height: size }} className={cx('avatarBox', className)}>
        <img style={{ width: '100%', height: '100%' }} className={`${shape}`} src={src} alt="avatar" />
      </span>
    );
  }
}
