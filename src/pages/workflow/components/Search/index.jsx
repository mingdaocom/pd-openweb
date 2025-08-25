import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { func, string } from 'prop-types';
import Icon from 'ming-ui/components/Icon';
import './index.less';

export default class Search extends Component {
  static propTypes = {
    handleChange: func,
    className: string,
    placeholder: string,
    onFocus: func,
  };
  static defaultProps = {
    handleChange: _.noop,
    onFocus: _.noop,
  };
  state = { value: '' };
  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({
        value: nextProps.value,
      });
    }
  }
  handleChange = value => {
    this.setState({ value });
    this.props.handleChange(value);
  };
  render() {
    const { className, placeholder = _l('搜索名称'), onFocus } = this.props;
    const { value } = this.state;
    return (
      <div className={cx('workflowSearchWrap', className)}>
        <input
          type="text"
          className="ThemeBorderColor3"
          onFocus={onFocus}
          value={value}
          placeholder={placeholder}
          onChange={e => this.handleChange(e.target.value)}
        />
        <Icon icon="search" className="search Gray_75 Font16" />
        <Icon
          icon="close"
          onClick={() => this.handleChange('')}
          className={cx('close pointer', { hide: !value.length })}
        />
      </div>
    );
  }
}
