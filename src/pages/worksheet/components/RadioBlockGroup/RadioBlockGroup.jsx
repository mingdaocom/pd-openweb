import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import './RadioBlockGroup.less';

export default class RadioBlockGroup extends Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({})),
    value: PropTypes.number,
    onChange: PropTypes.func,
  };
  render() {
    const { data, value, onChange } = this.props;
    return (
      <div className="radioBlockGroup">
        {data.map((item, index) => (
          <div
            key={index}
            className={cx('item', {
              ThemeBGColor3: item.value === value,
            })}
            onClick={() => {
              onChange(item.value);
            }}
          >
            {item.text}
          </div>
        ))}
      </div>
    );
  }
}
