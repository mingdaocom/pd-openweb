import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import './CheckBlock.less';

export default class CheckBlock extends React.Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
      text: PropTypes.string,
      value: PropTypes.number,
    })),
    value: PropTypes.number,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    onChange: () => {},
  };

  render() {
    const { data, value, onChange } = this.props;
    return <div className="checkBlock">
      {
        data.map(item => <div
          className={cx('block', { active: item.value === value })}
          onClick={() => (onChange(item.value))}
        >
          { item.text }
        </div>)
      }
    </div>;
  }
}
