import PropTypes from 'prop-types';
import React from 'react';
import { classSet } from '../../utils/util';
import './radioGroup.less';

class RadioGroup extends React.Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.number, // 单选框的value
        name: PropTypes.string, // 单选框显示的name
      })
    ).isRequired,
    checkedValue: PropTypes.node.isRequired, // 被选中的单选框的value
    changeRadioValue: PropTypes.func.isRequired, // 回调，返回被选中的value  changeRadioValue(value)
  };

  handleClick(event) {
    this.props.changeRadioValue(parseInt(event.currentTarget.getAttribute('value'), 10));
  }

  componentDidUpdate() {}

  render() {
    let { data, checkedValue } = this.props;
    return (
      <div className="radioGroup">
        {data.map((item, key) => {
          let sc = classSet(
            {
              checked: item.value === this.props.checkedValue,
              small: this.props.size === 'small',
            },
            'radioLabel',
            'overflow_ellipsis'
          );
          return (
            <label className={sc} key={key} onClick={this.handleClick.bind(this)} value={item.value}>
              <span className="radioBox ThemeBorderColor3">
                <span className="radioRound ThemeBGColor3" />
              </span>
              <span>{item.name}</span>
            </label>
          );
        })}
      </div>
    );
  }
}

export default RadioGroup;
