import PropTypes from 'prop-types';
import React from 'react';
import { classSet } from '../../utils/util';
import './checkbox.less';

class Checkbox extends React.Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    name: PropTypes.string, // checkbox显示的name
    checked: PropTypes.bool, // 默认是否点击
    toggleCheckbox: PropTypes.func.isRequired, // 回调，返回optionKey和checked toggleCheckbox(optionKey, checked)
    optionKey: PropTypes.node, // 在回调中返回来
    color: PropTypes.oneOf(['gray', 'theme', undefined]), // checkbox颜色，默认主题色 gray灰色，theme主题色
  };

  handleClick(event) {
    this.props.toggleCheckbox(this.props.optionKey, !this.props.checked);
  }

  render() {
    let { name, checked, color } = this.props;
    let sc = classSet(
      {
        checked: checked,
      },
      'checkboxLabel overflow_ellipsis'
    );
    let checkboxSc = classSet(color === 'gray' ? 'grayCheckbox' : 'ThemeBGColor3', 'rCheckbox');
    return (
      <label className={sc} onClick={this.handleClick.bind(this)}>
        <span className={checkboxSc} />
        {name}
      </label>
    );
  }
}

export default Checkbox;
