import PropTypes from 'prop-types';
import React, { Component } from 'react';
import SelectItem from './SelectItem';
import { scrollTo } from './utils';

class PanelSelect extends Component {
  static propTypes = {
    options: PropTypes.arrayOf(PropTypes.string),
    onSelect: PropTypes.func,
    type: PropTypes.string,
    selectedIndex: PropTypes.number,
    disabledSelect: PropTypes.arrayOf(PropTypes.number),
  };

  componentDidMount() {
    const selectedItem = this._select.querySelector('.TimePicker-select-item.actived');
    if (selectedItem) {
      const dis = this._select.scrollTop + (selectedItem.offsetTop - this._select.scrollTop);
      scrollTo(this._select, dis, 0);
    }
  }

  handleClick = (value, offsetTop) => {
    const dis = this._select.scrollTop + (offsetTop - this._select.scrollTop);
    scrollTo(this._select, dis);
    this.props.onSelect(this.props.type, value);
  };

  render() {
    const { options, selectedIndex, disabledSelect } = this.props;
    return (
      <div className="TimePicker-panel-item">
        <ul ref={select => (this._select = select)} className="TimePicker-select">
          {options.map((option, index) => (
            <SelectItem key={option} value={index} active={selectedIndex === index} onClick={this.handleClick} disabled={disabledSelect.indexOf(index) !== -1}>
              {option}
            </SelectItem>
          ))}
          <li className="TimePicker-select-placeholder" />
        </ul>
      </div>
    );
  }
}

export default PanelSelect;
