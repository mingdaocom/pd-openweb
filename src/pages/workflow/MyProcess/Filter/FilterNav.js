import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';

export default class FilterNav extends Component {
  constructor(props) {
    super(props);
    let currentIndex = 0;

    props.data.forEach((item, index) => {
      if (item.value.type === (props.checked || {}).type) {
        currentIndex = index;
      }
    });

    this.state = {
      currentIndex,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.data, this.props.data)) {
      this.state = {
        currentIndex: 0,
      };
    }
  }
  render() {
    const { data } = this.props;
    const { currentIndex } = this.state;
    return (
      <div className="filterNav flexRow valignWrapper">
        {data.map((item, index) => (
          <div
            key={index}
            className={cx('item', { active: currentIndex === index })}
            onClick={() => {
              this.setState({ currentIndex: index });
              this.props.onChange(item.value);
            }}
          >
            {item.name}
          </div>
        ))}
      </div>
    );
  }
}
