import PropTypes from 'prop-types';
import React from 'react';
import { classSet } from '../../utils/util';
import './number.less';

class Number extends React.Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    number: PropTypes.number.isRequired,
    toggleNumber: PropTypes.func.isRequired,
  };

  addNumber() {
    if (this.props.number < 9) {
      this.props.toggleNumber(this.props.number + 1);
    }
  }

  reduceNumber() {
    if (this.props.number > 0) {
      this.props.toggleNumber(this.props.number - 1);
    }
  }

  handleChange(event) {
    let value = event.target.value;
    if (value.match(/^\d\d$/)) {
      value = parseInt(value.slice(1), 10);
    } else if (value.match(/^\d.$/)) {
      value = parseInt(value.slice(0, 1), 10);
    } else if (value.match(/^\d$/)) {
      value = parseInt(value, 10);
    } else if (value === '') {
      value = '';
    } else {
      value = 2;
    }
    this.props.toggleNumber(value);
  }

  handleBlur(event) {
    let value = event.target.value;
    if (value === '') {
      value = 2;
    }
    this.props.toggleNumber(parseInt(value), 10);
  }

  render() {
    let { number } = this.props;
    return (
      <div className="customWidgetNumber">
        <input
          type="text"
          className="numberInput ThemeBorderColor3"
          value={number}
          onBlur={this.handleBlur.bind(this)}
          onChange={this.handleChange.bind(this)}
        />
        <div className="numberControlBox">
          <span className="icon-arrow-up-border ThemeColor3 pointer" onClick={this.addNumber.bind(this)} />
          <span className="icon-arrow-down-border ThemeColor3 pointer" onClick={this.reduceNumber.bind(this)} />
        </div>
      </div>
    );
  }
}

export default Number;
