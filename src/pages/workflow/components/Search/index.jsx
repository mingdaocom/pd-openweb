import React, { Component } from 'react';
import { string, func } from 'prop-types';
import Icon from 'ming-ui/components/Icon';
import cx from 'classnames';
import './index.less';
import _ from 'lodash';

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
        <Icon icon="workflow_find" className="search Gray_9e Font16" />
        <Icon
          icon="close"
          onClick={() => this.handleChange('')}
          className={cx('close pointer', { hide: !value.length })}
        />
      </div>
    );
  }
}
