import React, { Component, createRef } from 'react';
import { string } from 'prop-types';
import cx from 'classnames';
import './index.less';
import { compareProps } from '../../../PageHeader/util';

/**
 * 多行文字超出隐藏
 */
export default class lineClampTextBox extends Component {
  constructor(props) {
    super(props);
    this.$textBox = createRef();
    this.$textContent = createRef();
  }

  componentDidMount() {
    setTimeout(() => {
      this.renderLineClampText();
    }, 0);
  }

  shouldComponentUpdate(nextProps) {
    return compareProps(nextProps, this.props, ['text']);
  }
  componentWillUpdate() {
    setTimeout(() => {
      this.renderLineClampText();
    }, 0);
  }
  renderLineClampText() {
    /**
     * 兼容firefox浏览器不支持 line-clamp
     */
    const $textBox = $(this.$textBox.current);
    const $textContent = $(this.$textContent.current);
    if (!$textBox.length || !$textContent.length) return;
    if ('webkitLineClamp' in $textContent.prop('style')) return;
    while ($textContent.height() > $textBox.height()) {
      $textContent.text($textContent.text().replace(/(\s)*(\S|\W)(\.\.\.)?$/, '...'));
    }
    return;
  }
  render() {
    const { className, style, text, line = 2, ...props } = this.props;
    return (
      <div
        ref={this.$textBox}
        style={{ ...style, WebkitLineClamp: line }}
        className={cx('lineClampTextBox', className)}
        {...props}>
        <div ref={this.$textContent} className="contentText" style={{ WebkitBoxOrient: 'vertical' }}>
          {text}
        </div>
      </div>
    );
  }
}
