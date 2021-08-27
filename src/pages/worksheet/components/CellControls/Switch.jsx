/**
 * 工作表控件-Checkbox
 */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Checkbox } from 'ming-ui';
import { autobind } from 'core-decorators';
import { FROM } from './enum';

export default class Switch extends React.Component {
  static propTypes = {
    from: PropTypes.number,
    className: PropTypes.string,
    style: PropTypes.shape({}),
    updateCell: PropTypes.func,
    cell: PropTypes.shape({ value: PropTypes.string }),
    onClick: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      value: props.cell.value === '1' || props.cell.value === 1,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.cell.value !== this.props.cell.value) {
      this.setState({ value: nextProps.cell.value === '1' || nextProps.cell.value === 1 });
    }
  }

  @autobind
  handleChange(checked, value, e) {
    const { updateCell } = this.props;
    e.stopPropagation();
    e.preventDefault();
    this.setState({
      value: !checked,
    }, () => {
      updateCell({
        value: checked ? '0' : '1',
      });
    });
  }

  render() {
    const { className, style, from, cell, editable, onClick } = this.props;
    const { value } = this.state;
    if (from === FROM.CARD && cell.value !== '1' && cell.value !== 1) {
      return '';
    }
    return (<div
      className={cx('cellSwitch cellControl', className)}
      style={style}
      onClick={onClick}
    >
      <Checkbox
        className="InlineBlock"
        disabled={!editable}
        checked={value}
        onClick={this.handleChange}
      />
    </div>);
  }
}
