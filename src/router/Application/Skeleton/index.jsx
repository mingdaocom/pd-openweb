import React, { Component } from 'react';
import { string, bool, oneOf, arrayOf, object } from 'prop-types';
import cx from 'classnames';
import './index.less';

export default class Skeleton extends Component {
  static propTypes = {
    className: string,
    // 占位条方向
    direction: oneOf(['column', 'row']),
    height: string,
    // 占位条的宽度
    widths: arrayOf(string),
    style: object,
    itemStyle: object,
    itemClassName: string,
    active: bool,
  };
  static defaultProps = {
    direction: 'column',
    height: '18px',
    widths: ['100%', '50%', '100%', '50%'],
    active: false,
  };
  render() {
    const { className, direction, height, widths, style, itemStyle, itemClassName, active } = this.props;
    return (
      <div className={cx('loadingSkeleton', className, { active })} style={style}>
        <ul style={{ flexDirection: direction }}>
          {widths.map((width, index) => (
            <li key={index} style={{ width, height, ...itemStyle }} className={cx('loadingParagraph', itemClassName)} />
          ))}
        </ul>
      </div>
    );
  }
}
